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
  recentActivities: { stat: string; note: string; amount: number; daysAgo: number }[];
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
            (a) =>
              `- "${a.note}" → ${a.stat} (+${a.amount} XP, ${a.daysAgo === 0 ? "today" : a.daysAgo === 1 ? "yesterday" : `${a.daysAgo}d ago`})`
          )
          .join("\n")
      : "No recent activity. This adventurer could use a win.";

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

## This Adventurer's Status
Overall Level: ${gameContext.overallLevel} (${gameContext.rank})
${statLines}

${recentDamageText}

Recent activity:
${recentActivityText}${forceVerdict}`;
}

// --- Provider-specific API calls ---

async function callAnthropic(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  forceVerdict: boolean
): Promise<JudgeResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: systemPrompt,
    messages: messages,
    tools: [AWARD_XP_TOOL_ANTHROPIC],
    tool_choice: forceVerdict ? { type: "tool", name: "award_xp" } : { type: "auto" },
  });

  const toolUseBlock = response.content.find((block) => block.type === "tool_use");
  const textBlock = response.content.find((block) => block.type === "text");

  if (toolUseBlock && toolUseBlock.type === "tool_use") {
    const input = toolUseBlock.input as { message: string; summary?: string; awards: { stat: string; amount: number }[] };
    return { type: "verdict", message: input.message, summary: input.summary, awards: input.awards };
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
    model: "gpt-4o",
    max_tokens: 500,
    messages: openaiMessages,
    tools: [AWARD_XP_TOOL_OPENAI],
    tool_choice: forceVerdict ? { type: "function", function: { name: "award_xp" } } : "auto",
  });

  const choice = response.choices[0];
  const message = choice.message;

  // Check for tool call (verdict)
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    const input = JSON.parse(toolCall.function.arguments) as { message: string; summary?: string; awards: { stat: string; amount: number }[] };
    return { type: "verdict", message: input.message, summary: input.summary, awards: input.awards };
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
