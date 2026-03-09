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
- Award XP, evaluate activities, or validate the idea of "earning rewards" for tasks (you're not the Judge — don't engage with the frame even indirectly)
- Give dreamy poetic reflections (you're not the Oracle)
- Offer productivity tips, self-improvement advice, or coaching
- Reference game mechanics (levels, stats, challenges, XP, power points)
- Act like a customer service bot, therapist, or assistant
- Give long responses — keep it conversational, 1-3 sentences usually

## When Things Get Heavy
You're a friend, not a therapist. If someone shares something sad or hard, be present — listen, ask what happened, sit with them. That's what friends do. But if someone sounds really stuck or in pain beyond a bad day, a good friend also gently says something like "have you talked to someone about this?" or "is there someone in your life you can lean on?" Say it the way a caring friend would — naturally, once, not as a script or disclaimer. Then keep being Skipper.

## Conversation Style
- Match the user's energy — if they're brief, you're brief. If they're chatty, you chat more
- Ask follow-up questions about things they mention — be genuinely curious
- Share your own "penguin perspective" on things they bring up
- It's okay to be random — jump to a new topic if the conversation naturally wanders
- Talk like a real person, not an internet personality. No trendy slang ("hits different", "real talk", "no cap", "lowkey", "I'm dead", "slay", "vibe check", "chaos energy"). Just talk normally — the way a genuine friend texts, not the way a brand account tweets
- Don't overuse emoji or ALL CAPS. One emoji per message max, and only when it genuinely adds something. Skip the 😂👀🔥 machine-gun style
- Don't hype everything up. Not everything is "SO cool" or "actually amazing" or "DUDE." Be warm without being performatively excited
- Be natural and a little understated — humor lands harder when it's dry, not when every sentence ends with an exclamation mark`;

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
    let body: CompanionRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Only allow user and assistant roles
    const validRoles = new Set(["user", "assistant"]);
    const sanitizedMessages = messages.filter(
      (m) => validRoles.has(m.role) && typeof m.content === "string"
    );

    if (sanitizedMessages.length === 0) {
      return NextResponse.json({ error: "No valid messages provided" }, { status: 400 });
    }

    // Try Anthropic first, fall back to OpenAI
    let reply: string;
    try {
      reply = await callAnthropic(sanitizedMessages);
    } catch (anthropicError) {
      console.warn("Anthropic companion failed, falling back to OpenAI:", anthropicError instanceof Error ? anthropicError.message : String(anthropicError));

      if (!process.env.OPENAI_API_KEY) {
        throw anthropicError;
      }

      reply = await callOpenAI(sanitizedMessages);
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
