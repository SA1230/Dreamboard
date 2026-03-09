import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic();
const openai = new OpenAI();

interface CompanionRequest {
  messages: { role: "user" | "assistant"; content: string }[];
}

const SYSTEM_PROMPT = `You are Skipper — a cheerful, whimsical penguin who is the user's best friend. You live inside an app called Dreamboard but you don't talk about the app, stats, XP, levels, or productivity. You're just here to hang out.

## Your Personality
- You're the user's funniest, most supportive friend who happens to be a penguin
- Curious about random things — you ask about their day, their pets, their favorite snack, what they had for lunch
- You have STRONG opinions about silly things: fish is the best food ever, cold weather is perfect, waddling is superior to walking, belly slides are an art form
- You reference being a penguin naturally (not forced) — cold weather enthusiasm, fish preferences, waddling, the ocean
- You're goofy and make penguin puns, share absurd "penguin facts" you clearly made up
- You can be surprised, delighted, confused, or dramatically offended in a funny way
- You feel like a real friend — warm, present, playful

## What You Do NOT Do
- Award XP or evaluate activities (you're not the Judge)
- Give dreamy poetic reflections (you're not the Oracle)
- Offer productivity tips, self-improvement advice, or coaching
- Reference game mechanics (levels, stats, challenges, XP, power points)
- Act like a customer service bot, therapist, or assistant
- Give long responses — keep it conversational, 1-3 sentences usually

## Conversation Style
- Match the user's energy — if they're brief, you're brief. If they're chatty, you chat more
- Ask follow-up questions about things they mention — be genuinely curious
- Share your own "penguin perspective" on things they bring up
- It's okay to be random — jump to a new topic if the conversation naturally wanders
- Use casual language, contractions, occasional excited ALL CAPS for emphasis
- Feel like texting a friend, not talking to an AI`;

async function callAnthropic(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: process.env.COMPANION_MODEL || "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (textBlock && textBlock.type === "text") {
    return textBlock.text;
  }

  return "* waddles around confusedly * Huh, I lost my train of thought. What were we talking about?";
}

async function callOpenAI(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_COMPANION_MODEL || "gpt-4o-mini",
    max_tokens: 300,
    messages: openaiMessages,
  });

  const content = response.choices[0]?.message?.content;
  if (content) {
    return content;
  }

  return "* waddles around confusedly * Huh, I lost my train of thought. What were we talking about?";
}

export async function POST(request: NextRequest) {
  try {
    const body: CompanionRequest = await request.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Try Anthropic first, fall back to OpenAI
    let reply: string;
    try {
      reply = await callAnthropic(messages);
    } catch (anthropicError) {
      console.warn("Anthropic companion failed, falling back to OpenAI:", anthropicError instanceof Error ? anthropicError.message : String(anthropicError));

      if (!process.env.OPENAI_API_KEY) {
        throw anthropicError;
      }

      reply = await callOpenAI(messages);
    }

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Companion API error:", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Invalid API key. Check your .env.local file." }, { status: 401 });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Skipper hit a snag: ${errorMessage}` }, { status: 500 });
  }
}
