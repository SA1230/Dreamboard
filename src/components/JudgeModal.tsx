"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GameData, StatKey } from "@/lib/types";
import { STAT_KEYS, StatDefinition } from "@/lib/stats";
import { getStatStreaks, getXPForNextLevel } from "@/lib/storage";
import { StatIcon } from "./StatIcons";

// --- Types ---

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Award {
  stat: StatKey;
  amount: number;
}

interface JudgeVerdict {
  message: string;
  summary: string;
  awards: Award[];
}

interface JudgeModalProps {
  gameData: GameData;
  definitions: Record<StatKey, StatDefinition>;
  overallLevel: number;
  rank: string;
  profilePicture: string | null;
  onAcceptVerdict: (awards: Award[], summary: string) => void;
  onCancel: () => void;
}

// Build the game context snapshot to send to the API
function buildGameContext(
  gameData: GameData,
  definitions: Record<StatKey, StatDefinition>,
  overallLevel: number,
  rank: string
) {
  const streaks = getStatStreaks(gameData.activities);

  const stats = STAT_KEYS.map((key) => ({
    key,
    name: definitions[key].name,
    level: gameData.stats[key].level,
    xp: gameData.stats[key].xp,
    xpForNextLevel: getXPForNextLevel(gameData.stats[key].level),
    streak: streaks[key],
  }));

  // Recent damage (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentDamage: string[] = [];
  if (gameData.dailyDamage) {
    for (const [damageKey, dates] of Object.entries(gameData.dailyDamage)) {
      if (dates?.some((d) => new Date(d + "T00:00:00") >= sevenDaysAgo)) {
        recentDamage.push(damageKey);
      }
    }
  }

  // Recent activities (last 10)
  const recentActivities = gameData.activities.slice(0, 10).map((a) => {
    const daysAgo = Math.floor(
      (now.getTime() - new Date(a.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      stat: definitions[a.stat].name,
      note: a.note || "(no note)",
      amount: a.amount ?? 1,
      daysAgo,
    };
  });

  return { stats, overallLevel, rank, recentDamage, recentActivities };
}

export function JudgeModal({
  gameData,
  definitions,
  overallLevel,
  rank,
  profilePicture,
  onAcceptVerdict,
  onCancel,
}: JudgeModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verdict, setVerdict] = useState<JudgeVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMessage }];
      setMessages(newMessages);
      setInputValue("");
      setIsLoading(true);
      setError(null);

      try {
        const gameContext = buildGameContext(gameData, definitions, overallLevel, rank);

        const response = await fetch("/api/judge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages, gameContext }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Something went wrong");
        }

        const data = await response.json();

        if (data.type === "verdict") {
          // Judge rendered a verdict
          setMessages([...newMessages, { role: "assistant", content: data.message }]);
          setVerdict({ message: data.message, summary: data.summary || "Judged activity", awards: data.awards });
        } else {
          // Judge asked a follow-up question
          setMessages([...newMessages, { role: "assistant", content: data.message }]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "The Captain is unavailable.");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, gameData, definitions, overallLevel, rank]
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading || verdict) return;
    sendMessage(trimmed);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      onCancel();
    }
    // Submit on Enter (without Shift)
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  const totalXP = verdict?.awards.reduce((sum, a) => sum + a.amount, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fadeIn" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-modalSlideUp flex flex-col" style={{ maxHeight: "80vh" }}>
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/mascots/judge-hero.svg"
                alt="The Captain"
                className="w-9 h-9 rounded-full bg-amber-50 border-2 border-amber-200 p-0.5 flex-shrink-0"
              />
              <div>
                <h3 className="font-bold text-lg text-stone-700">The Captain</h3>
                <p className="text-xs text-stone-400">Describe what you did. Be honest.</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-stone-300 hover:text-stone-500 transition-colors text-xl leading-none px-1"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ minHeight: "200px" }}>
          {messages.length === 0 && !isLoading && (
            <div className="space-y-4">
              {/* Captain welcome bubble */}
              <div className="flex items-end gap-2 justify-start">
                <img
                  src="/mascots/judge-hero.svg"
                  alt=""
                  className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 p-0.5 flex-shrink-0"
                />
                <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-stone-100 text-stone-700 px-4 py-2.5 text-sm leading-relaxed">
                  What did you get up to? Tell me about something you accomplished — big or small. I&apos;ll ask a few questions and award you XP.
                </div>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 pl-8">
                {["I worked out", "I learned something", "I was productive"].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setInputValue(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-stone-50 text-stone-500 border border-stone-200 hover:bg-stone-100 hover:text-stone-700 hover:border-stone-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <img
                  src="/mascots/judge-hero.svg"
                  alt=""
                  className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 p-0.5 flex-shrink-0"
                />
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-stone-700 text-white rounded-br-md"
                    : "bg-stone-100 text-stone-700 rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && profilePicture && (
                <img
                  src={profilePicture}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover border border-stone-300 flex-shrink-0"
                />
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start items-end gap-2">
              <img
                src="/mascots/judge-hero.svg"
                alt=""
                className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 p-0.5 flex-shrink-0"
              />
              <div className="bg-stone-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-stone-400 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Verdict display */}
        {verdict && (
          <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50">
            <div className="space-y-2 mb-4">
              {verdict.awards.map((award, index) => {
                const def = definitions[award.stat];
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border"
                    style={{ borderColor: `${def.color}40` }}
                  >
                    <div style={{ color: def.color }}>
                      <StatIcon iconKey={def.iconKey} className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-stone-600">{def.name}</span>
                    <span
                      className="ml-auto text-sm font-bold"
                      style={{ color: def.color }}
                    >
                      +{award.amount} XP
                    </span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => onAcceptVerdict(verdict.awards, verdict.summary)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-stone-700 hover:bg-stone-800 transition-colors active:scale-[0.98]"
            >
              Accept Verdict (+{totalXP} XP)
            </button>
          </div>
        )}

        {/* Input area (hidden after verdict) */}
        {!verdict && (
          <form onSubmit={handleSubmit} className="px-6 pb-5 pt-3 border-t border-stone-100">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={messages.length === 0 ? "I went for a 5-mile run today..." : "Answer the Captain..."}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-stone-200 text-sm bg-stone-50 text-stone-700 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors resize-none"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ease-in-out active:scale-[0.98] ${
                  inputValue.trim() && !isLoading
                    ? "text-white shadow-sm hover:shadow-md hover:scale-105"
                    : "bg-stone-300 text-stone-400 cursor-not-allowed"
                }`}
                style={
                  inputValue.trim() && !isLoading
                    ? { background: "linear-gradient(135deg, #C4943A, #B07830)" }
                    : undefined
                }
              >
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
