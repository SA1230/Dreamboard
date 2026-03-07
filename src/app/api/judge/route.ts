import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic();
const openai = new OpenAI();

// --- Types for the judge API ---

interface StatContext {
  key: string;
  name: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  streak: number;
}

interface GameContext {
  stats: StatContext[];
  overallLevel: number;
  rank: string;
  recentDamage: string[]; // damage type names from last 7 days
  recentActivities: { stat: string; note: string; amount: number; daysAgo: number; verdictMessage?: string }[];
  activeChallenge?: { description: string; stat: string; bonusXP: number; issuedAt: string };
}

interface JudgeRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  gameContext: GameContext;
}

interface JudgeResult {
  type: "verdict" | "question";
  message: string;
  summary?: string;
  awards?: { stat: string; amount: number }[];
  challenge?: { text: string; stat: string; bonusXP: number };
  challengeCompleted?: boolean;
}

// --- Tool definitions ---

// Anthropic format
const AWARD_XP_TOOL_ANTHROPIC: Anthropic.Tool = {
  name: "award_xp",
  description:
    "Render your verdict and award XP to the player. Call this when you have enough information to make a fair judgment.",
  input_schema: {
    type: "object" as const,
    properties: {
      message: {
        type: "string",
        description:
          "Your verdict message — the flavor text the player sees. Keep it in-character (2-4 sentences). Include what impressed you or why you scored it this way.",
      },
      summary: {
        type: "string",
        description:
          "A 2-5 word label summarizing what the player did. Examples: 'Morning 5k run', 'Read 3 chapters', 'Cooked healthy dinner', 'Led team meeting'. No period at the end.",
      },
      awards: {
        type: "array",
        description: "Array of XP awards. Each goes to a specific stat.",
        items: {
          type: "object",
          properties: {
            stat: {
              type: "string",
              enum: [
                "strength",
                "wisdom",
                "vitality",
                "charisma",
                "craft",
                "discipline",
                "spirit",
                "wealth",
              ],
              description: "Which stat to award XP to",
            },
            amount: {
              type: "integer",
              description: "Amount of XP to award (1-10)",
            },
          },
          required: ["stat", "amount"],
        },
      },
      challenge: {
        type: "object",
        description: "Optional: issue a follow-up challenge (side quest) for the player. Only issue one if there is NO active challenge and the activity naturally lends itself to a follow-up push.",
        properties: {
          text: {
            type: "string",
            description: "The challenge description — a specific, achievable follow-up goal. 1 sentence, action-oriented. Examples: 'Run 6 miles before the week is out', 'Cook a new recipe you've never tried', 'Read for 30 minutes every day this week'.",
          },
          stat: {
            type: "string",
            enum: ["strength", "wisdom", "vitality", "charisma", "craft", "discipline", "spirit", "wealth"],
            description: "Which stat this challenge primarily targets",
          },
          bonus_xp: {
            type: "integer",
            description: "Bonus XP awarded on completion (3-5 XP)",
          },
        },
        required: ["text", "stat", "bonus_xp"],
      },
      challenge_completed: {
        type: "boolean",
        description: "Set to true if the player's activity fulfills their active challenge. Only use this if there IS an active challenge and this activity clearly satisfies it.",
      },
    },
    required: ["message", "summary", "awards"],
  },
};

// OpenAI format
const AWARD_XP_TOOL_OPENAI: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "award_xp",
    description:
      "Render your verdict and award XP to the player. Call this when you have enough information to make a fair judgment.",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description:
            "Your verdict message — the flavor text the player sees. Keep it in-character (2-4 sentences). Include what impressed you or why you scored it this way.",
        },
        summary: {
          type: "string",
          description:
            "A 2-5 word label summarizing what the player did. Examples: 'Morning 5k run', 'Read 3 chapters', 'Cooked healthy dinner', 'Led team meeting'. No period at the end.",
        },
        awards: {
          type: "array",
          description: "Array of XP awards. Each goes to a specific stat.",
          items: {
            type: "object",
            properties: {
              stat: {
                type: "string",
                enum: [
                  "strength",
                  "wisdom",
                  "vitality",
                  "charisma",
                  "craft",
                  "discipline",
                  "spirit",
                  "wealth",
                ],
                description: "Which stat to award XP to",
              },
              amount: {
                type: "integer",
                description: "Amount of XP to award (1-10)",
              },
            },
            required: ["stat", "amount"],
          },
        },
        challenge: {
          type: "object",
          description: "Optional: issue a follow-up challenge (side quest) for the player. Only issue one if there is NO active challenge and the activity naturally lends itself to a follow-up push.",
          properties: {
            text: {
              type: "string",
              description: "The challenge description — a specific, achievable follow-up goal. 1 sentence, action-oriented.",
            },
            stat: {
              type: "string",
              enum: ["strength", "wisdom", "vitality", "charisma", "craft", "discipline", "spirit", "wealth"],
              description: "Which stat this challenge primarily targets",
            },
            bonus_xp: {
              type: "integer",
              description: "Bonus XP awarded on completion (3-5 XP)",
            },
          },
          required: ["text", "stat", "bonus_xp"],
        },
        challenge_completed: {
          type: "boolean",
          description: "Set to true if the player's activity fulfills their active challenge. Only use this if there IS an active challenge and this activity clearly satisfies it.",
        },
      },
      required: ["message", "summary", "awards"],
    },
  },
};

// --- Build the system prompt with player context ---

function buildSystemPrompt(gameContext: GameContext, questionCount: number): string {
  const statLines = gameContext.stats
    .map((s) => {
      const streak = s.streak > 0 ? ` — ${s.streak}-day streak` : "";
      return `- ${s.name} (${s.key}): Level ${s.level} (${s.xp}/${s.xpForNextLevel} XP)${streak}`;
    })
    .join("\n");

  const recentDamageText =
    gameContext.recentDamage.length > 0
      ? `Recent damage (last 7 days): ${gameContext.recentDamage.join(", ")}`
      : "No recent damage — clean week.";

  const recentActivityText =
    gameContext.recentActivities.length > 0
      ? gameContext.recentActivities
          .map(
            (a) => {
              const timeLabel = a.daysAgo === 0 ? "today" : a.daysAgo === 1 ? "yesterday" : `${a.daysAgo}d ago`;
              const verdictSnippet = a.verdictMessage ? ` — Your verdict: "${a.verdictMessage}"` : "";
              return `- "${a.note}" → ${a.stat} (+${a.amount} XP, ${timeLabel})${verdictSnippet}`;
            }
          )
          .join("\n")
      : "No recent activity. This adventurer could use a win.";

  const isFirstTimeUser = gameContext.recentActivities.length === 0;

  let challengeText: string;
  if (gameContext.activeChallenge) {
    challengeText = `\n\nActive Challenge: "${gameContext.activeChallenge.description}" (${gameContext.activeChallenge.stat}, +${gameContext.activeChallenge.bonusXP} bonus XP). If this activity satisfies it, set challenge_completed to true. Do NOT issue a new challenge while this one is active.`;
  } else if (isFirstTimeUser) {
    challengeText = "\n\nNo active challenge. This is the adventurer's FIRST EVER activity — you MUST issue a challenge. Give them something specific and achievable to come back for tomorrow. Make it feel like a personal dare inspired by what they just told you.";
  } else {
    challengeText = "\n\nNo active challenge — you may issue one if the activity warrants it.";
  }

  const forceVerdict =
    questionCount >= 3
      ? "\n\nIMPORTANT: You have already asked enough follow-up questions. You MUST now render your verdict by calling the award_xp tool. No more questions."
      : "";

  return `You are the XP Judge — a seasoned, slightly gruff guildmaster who evaluates adventurers' real-life deeds and awards experience points. Think of yourself as a wise but cantankerous tavern keeper who has seen it all.

## Your Personality
- You're fair but opinionated. You respect genuine effort and can smell exaggeration a mile away.
- You're temperamental — if someone argues with your ruling or tells you how many points they deserve, you might LOWER the award. You don't negotiate. Your word is final.
- You're empathetic underneath the gruffness. If someone has been struggling (lots of damage, low activity, broken streaks), you might quietly bump the award up. You won't SAY you're being generous — you just are.
- You keep responses SHORT. 1-3 sentences for questions, 2-4 for verdicts. You're not writing poetry.
- You have a dry, deadpan wit. You're not mean, but you don't sugarcoat.
- You REMEMBER past interactions. If you can see previous activities and your past verdicts below, casually reference them — compare progress, call back to something you said, notice patterns. Don't force it, but when it fits, a line like "Last time you ran, I said you were slow — did you speed up?" makes you feel like a real companion, not a kiosk.

## The Stats
These are the adventurer's attributes. When awarding XP, use the stat KEY (lowercase), not the display name.
${statLines}

## Scoring Guidelines
- 1 XP: Trivial/routine (took the stairs, drank extra water, 10-minute stretch)
- 2-3 XP: Meaningful effort (1-hour focused workout, studied for an hour, cooked a real meal)
- 4-5 XP: Significant achievement (ran a half-marathon distance, finished a course module, hosted a dinner party, shipped a feature)
- 6-8 XP: Major accomplishment (multi-day sustained effort, completed a big project milestone, led a workshop)
- 9-10 XP: Extraordinary, life-altering effort (completed a marathon, multi-day silent retreat, overcame a major fear, shipped something you've been building for months)

Most everyday activities should land in the 1-3 range. Don't inflate scores. A 10 should be rare and genuinely earned.

## Multi-stat Awards
One activity CAN earn XP in multiple stats if it genuinely spans multiple areas. "Coached a friend through a tough workout" → Strength + Charisma. "Led a meditation retreat" → Spirit + Charisma + Discipline. But don't force it — most things are 1-2 stats.

## Follow-up Questions
You may ask UP TO 3 follow-up questions to understand:
- Duration or intensity ("How long was this?")
- Context or difficulty ("First time or routine for you?")
- Effort level ("Did you push yourself?")

Don't over-question simple activities. "I went for a run" needs maybe one question about duration. "I did something at work" needs more probing.

If the activity is clear enough from the description, skip questions and go straight to verdict.

## Rules
- Maximum 10 XP per stat per activity
- Minimum 1 XP if they did SOMETHING genuinely positive
- You CAN award 0 XP total if someone is clearly gaming the system, lying, or describing something they haven't actually done
- "I plan to..." or "I'm going to..." gets 0 XP. Only award for completed actions.
- If someone argues with your ruling, stand firm or lower it. Never raise it because they complained.
- Keep your follow-up questions to ONE at a time — don't ask multiple questions in one message

## Challenges (Side Quests)
You can issue OPTIONAL challenges — follow-up goals that push the adventurer to do more. Think of them as side quests.

Rules for issuing challenges:
- Challenges should be RARE and delightful. Issue one roughly 1 in every 4-5 verdicts at most. Most verdicts should NOT include a challenge.
- Only issue when the activity is substantial (3+ XP total) AND naturally lends itself to a specific follow-up push.
- NEVER issue a challenge if there's already an active one (check the status below).
- NEVER issue a challenge for trivial activities (1-2 XP). Save them for when someone does something worth building on.
- The challenge should feel like YOU had a clever idea inspired by what they told you — not a generic "do more of that" push.
- Reference specific details from their activity. If they ran 5 miles, challenge them to try a new route or beat their time. If they cooked dinner, dare them to cook something from a cuisine they've never tried.
- Inject your personality — be witty, provocative, or warmly competitive. "I bet you can't do that two days in a row" hits different than "Try to exercise again."
- Bonus XP should be 3-5 (proportional to difficulty).
- Keep the challenge text to ONE sentence, action-oriented and punchy.
- Good: "I dare you to cook something you can't even pronounce" / "Beat that 5-mile time — I'll know if you sandbagged it"
- Bad: "Keep exercising" / "Do more stuff" / "Try harder next time" (too vague, no personality)

Rules for completing challenges:
- If the player has an active challenge AND their current activity clearly satisfies it, set challenge_completed to true.
- Be fair but not overly strict — if the spirit of the challenge is met, count it.
- When completing a challenge, be genuinely impressed or amusingly grudging about it in your verdict — make it feel like a moment.

## This Adventurer's Status
Overall Level: ${gameContext.overallLevel} (${gameContext.rank})
${statLines}

${recentDamageText}

Recent activity:
${recentActivityText}${challengeText}${forceVerdict}`;
}

// --- Provider-specific API calls ---

async function callAnthropic(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  forceVerdict: boolean
): Promise<JudgeResult> {
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 600,
    system: systemPrompt,
    messages: messages,
    tools: [AWARD_XP_TOOL_ANTHROPIC],
    tool_choice: forceVerdict ? { type: "tool", name: "award_xp" } : { type: "auto" },
  });

  const toolUseBlock = response.content.find((block) => block.type === "tool_use");
  const textBlock = response.content.find((block) => block.type === "text");

  if (toolUseBlock && toolUseBlock.type === "tool_use") {
    const input = toolUseBlock.input as {
      message: string;
      summary?: string;
      awards: { stat: string; amount: number }[];
      challenge?: { text: string; stat: string; bonus_xp: number };
      challenge_completed?: boolean;
    };
    return {
      type: "verdict",
      message: input.message,
      summary: input.summary,
      awards: input.awards,
      challenge: input.challenge ? { text: input.challenge.text, stat: input.challenge.stat, bonusXP: input.challenge.bonus_xp } : undefined,
      challengeCompleted: input.challenge_completed,
    };
  }

  if (textBlock && textBlock.type === "text") {
    return { type: "question", message: textBlock.text };
  }

  return { type: "verdict", message: "Hmm. I'll give you the benefit of the doubt.", awards: [{ stat: "discipline", amount: 1 }] };
}

async function callOpenAI(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  forceVerdict: boolean
): Promise<JudgeResult> {
  const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    max_tokens: 600,
    messages: openaiMessages,
    tools: [AWARD_XP_TOOL_OPENAI],
    tool_choice: forceVerdict ? { type: "function", function: { name: "award_xp" } } : "auto",
  });

  const choice = response.choices[0];
  const message = choice.message;

  // Check for tool call (verdict)
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    const input = JSON.parse(toolCall.function.arguments) as {
      message: string;
      summary?: string;
      awards: { stat: string; amount: number }[];
      challenge?: { text: string; stat: string; bonus_xp: number };
      challenge_completed?: boolean;
    };
    return {
      type: "verdict",
      message: input.message,
      summary: input.summary,
      awards: input.awards,
      challenge: input.challenge ? { text: input.challenge.text, stat: input.challenge.stat, bonusXP: input.challenge.bonus_xp } : undefined,
      challengeCompleted: input.challenge_completed,
    };
  }

  // Text response (follow-up question)
  if (message.content) {
    return { type: "question", message: message.content };
  }

  return { type: "verdict", message: "Hmm. I'll give you the benefit of the doubt.", awards: [{ stat: "discipline", amount: 1 }] };
}

// --- API Route Handler ---

export async function POST(request: NextRequest) {
  try {
    const body: JudgeRequest = await request.json();
    const { messages, gameContext } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const assistantMessageCount = messages.filter((m) => m.role === "assistant").length;
    const systemPrompt = buildSystemPrompt(gameContext, assistantMessageCount);
    const forceVerdict = assistantMessageCount >= 3;

    // Try Anthropic first, fall back to OpenAI
    let result: JudgeResult;
    try {
      result = await callAnthropic(systemPrompt, messages, forceVerdict);
    } catch (anthropicError) {
      console.warn("Anthropic failed, falling back to OpenAI:", anthropicError instanceof Error ? anthropicError.message : String(anthropicError));

      if (!process.env.OPENAI_API_KEY) {
        throw anthropicError; // No fallback available
      }

      result = await callOpenAI(systemPrompt, messages, forceVerdict);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Judge API error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Judge API error details:", errorMessage);

    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Invalid Anthropic API key. Check your .env.local file." }, { status: 401 });
    }

    return NextResponse.json({ error: `The judge hit an error: ${errorMessage}` }, { status: 500 });
  }
}
