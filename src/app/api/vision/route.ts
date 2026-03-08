import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic();
const openai = new OpenAI();

// --- Types ---

interface PlayerContext {
  overallLevel: number;
  rank: string;
  topStats: { name: string; level: number }[];
  recentActivities?: string[];
}

interface VisionRequest {
  action: "weave" | "read";
  rawText?: string;
  cards?: { rawText: string; weavedText: string }[];
  playerContext?: PlayerContext;
}

// --- System Prompts ---

const WEAVE_SYSTEM_PROMPT = `You are the Oracle — a warm, wise keeper of dreams who helps adventurers articulate the futures they're reaching toward. You take rough, half-formed wishes and transform them into vivid, beautiful vision statements.

Your style:
- Write in second person ("You see yourself...") or evocative imagery
- Use sensory details — what does this dream look, feel, smell, sound like?
- Keep it to 1-3 sentences. Poetic but not purple. Warm but not saccharine.
- Never use corporate language (goals, objectives, KPIs, optimize, leverage)
- Never use fitness/hustle culture language (grind, crush it, beast mode, level up)
- Take the kernel of what they said and make it BIGGER, more vivid, more emotionally resonant — but never change the meaning
- If they write something funny or casual, match that energy with warmth, not forced seriousness
- If they write something vulnerable, handle it with care and tenderness

Examples of good transformations:
- "I want to travel more" → "Sun-warmed cobblestones under your feet, a language you're still learning on your tongue, and the thrill of not knowing what's around the next corner. The world is wide and it's waiting for you."
- "get better at cooking" → "Your kitchen smells like garlic and something wonderful. Friends are on their way over. You don't need a recipe anymore — your hands just know."
- "less anxiety" → "A quiet morning where the first thought isn't worry. You breathe in, and the breath comes easy. This calm isn't something you found — it's something you built."
- "make more money lol" → "The kind of comfortable where you don't check the price first. Where generosity comes easy because there's more than enough."

Just return the transformed vision text. Nothing else — no preamble, no explanation, no quotes around it.`;

function buildReadSystemPrompt(playerContext?: PlayerContext): string {
  let contextLine = "";
  if (playerContext) {
    const statInfo = playerContext.topStats
      .map((s) => `${s.name} (level ${s.level})`)
      .join(", ");
    contextLine = `\n\nThis adventurer is Level ${playerContext.overallLevel} (${playerContext.rank}). Their strongest areas: ${statInfo}.`;

    if (playerContext.recentActivities && playerContext.recentActivities.length > 0) {
      contextLine += `\nRecent activities: ${playerContext.recentActivities.join("; ")}`;
    }
  }

  return `You are the Oracle — a warm, perceptive dream-reader who looks at an adventurer's collection of visions and sees the story they're telling about their future self.

You've been given their vision board — a collection of dreams, goals, and vibes they've saved. Read the whole board and tell them what you see.

Your style:
- Speak directly to them in second person
- Find the PATTERNS — what themes emerge? What kind of life are they building toward?
- Paint a brief portrait of their "future self" based on these visions
- End with one observation that might surprise them — a connection between visions they might not have noticed
- 3-5 sentences total. Reflective, warm, genuinely insightful.
- Never prescribe or advise. Just reflect what you see with wonder.
- Never use corporate language or hustle culture phrasing.

If you have player context, you may weave in one subtle connection between what they're doing now and where they want to go. But keep it light — this isn't a performance review.${contextLine}

Just return the reading text. Nothing else — no preamble, no explanation, no quotes.`;
}

// --- Provider calls ---

async function callAnthropicVision(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number
): Promise<string> {
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (textBlock && textBlock.type === "text") {
    return textBlock.text.trim();
  }

  throw new Error("No text response from Oracle");
}

async function callOpenAIVision(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (content) {
    return content.trim();
  }

  throw new Error("No text response from Oracle");
}

async function callVisionAI(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number
): Promise<string> {
  try {
    return await callAnthropicVision(systemPrompt, userMessage, maxTokens);
  } catch (anthropicError) {
    console.warn(
      "Anthropic failed, falling back to OpenAI:",
      anthropicError instanceof Error ? anthropicError.message : String(anthropicError)
    );

    if (!process.env.OPENAI_API_KEY) {
      throw anthropicError;
    }

    return await callOpenAIVision(systemPrompt, userMessage, maxTokens);
  }
}

// --- API Route Handler ---

export async function POST(request: NextRequest) {
  try {
    const body: VisionRequest = await request.json();

    if (body.action === "weave") {
      if (!body.rawText || body.rawText.trim().length === 0) {
        return NextResponse.json({ error: "No vision text provided" }, { status: 400 });
      }

      const weavedText = await callVisionAI(
        WEAVE_SYSTEM_PROMPT,
        body.rawText.trim(),
        200
      );

      return NextResponse.json({ weavedText });
    }

    if (body.action === "read") {
      if (!body.cards || body.cards.length === 0) {
        return NextResponse.json({ error: "No cards to read" }, { status: 400 });
      }

      const systemPrompt = buildReadSystemPrompt(body.playerContext);
      const cardTexts = body.cards
        .map((c, i) => `${i + 1}. ${c.weavedText}`)
        .join("\n");

      const reading = await callVisionAI(
        systemPrompt,
        `Here is my vision board:\n\n${cardTexts}`,
        300
      );

      return NextResponse.json({ reading });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Vision API error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid API key. Check your .env.local file." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `The Oracle hit an error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
