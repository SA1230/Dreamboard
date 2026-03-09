"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ModalBackdrop } from "./ModalBackdrop";
import { track } from "@/lib/tracker";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const DAILY_MESSAGE_CAP = 10;

const CONVERSATION_STARTERS = [
  "How's your day going?",
  "What's your favorite snack?",
  "Tell me something weird",
];

const SLEEPY_MESSAGES = [
  "* yaaawn * Okay I'm getting sleepy... penguins need their beauty rest, you know. Come chat with me tomorrow!",
  "* eyelids drooping * That's all the waddling I can do today... I'll be here tomorrow though! Bring snacks.",
  "* curls up * My penguin brain needs a nap. Same time tomorrow? I'll dream about fish for both of us.",
];

interface CompanionModalProps {
  profilePicture: string | null;
  onClose: () => void;
}

export function CompanionModal({ profilePicture, onClose }: CompanionModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isSleepy, setIsSleepy] = useState(false);

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
      if (isSleepy) return;

      const newCount = messageCount + 1;
      setMessageCount(newCount);

      // Track each message sent
      track("companion_message_sent", { messageNumber: newCount });

      // Check if this message hits the cap
      if (newCount >= DAILY_MESSAGE_CAP) {
        const sleepyMessage = SLEEPY_MESSAGES[Math.floor(Math.random() * SLEEPY_MESSAGES.length)];
        const newMessages: ChatMessage[] = [
          ...messages,
          { role: "user", content: userMessage },
          { role: "assistant", content: sleepyMessage },
        ];
        setMessages(newMessages);
        setInputValue("");
        setIsSleepy(true);
        return;
      }

      const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMessage }];
      setMessages(newMessages);
      setInputValue("");
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/companion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Something went wrong");
        }

        const data = await response.json();
        setMessages([...newMessages, { role: "assistant", content: data.message }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Skipper got lost at sea.");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, messageCount, isSleepy]
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading || isSleepy) return;
    sendMessage(trimmed);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  const remainingMessages = DAILY_MESSAGE_CAP - messageCount;

  return (
    <ModalBackdrop onClose={onClose} onKeyDown={handleKeyDown} ariaLabel="Chat with Skipper">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-modalSlideUp flex flex-col" style={{ maxHeight: "80vh" }}>
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-sky-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sky-50 border-2 border-sky-200 p-0.5 flex-shrink-0 flex items-center justify-center">
                <img
                  src="/mascots/judge-hero.svg"
                  alt="Skipper"
                  className="w-full h-full rounded-full"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-stone-700">Skipper</h3>
                <p className="text-xs text-stone-400">Just vibing. No XP here.</p>
              </div>
            </div>
            <button
              onClick={onClose}
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
              {/* Skipper welcome bubble */}
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-sky-50 border border-sky-200 p-0.5 flex-shrink-0 flex items-center justify-center">
                  <img src="/mascots/judge-hero.svg" alt="" className="w-full h-full rounded-full" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-sky-50 text-stone-700 px-4 py-2.5 text-sm leading-relaxed">
                  Hey hey! * waddles excitedly * What&apos;s up? I&apos;m just hanging out — tell me anything!
                </div>
              </div>

              {/* Conversation starters */}
              <div className="flex flex-wrap gap-2 pl-8">
                {CONVERSATION_STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => {
                      setInputValue(starter);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100 hover:text-sky-700 hover:border-sky-300 transition-colors"
                  >
                    {starter}
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
                <div className="w-6 h-6 rounded-full bg-sky-50 border border-sky-200 p-0.5 flex-shrink-0 flex items-center justify-center">
                  <img src="/mascots/judge-hero.svg" alt="" className="w-full h-full rounded-full" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-stone-700 text-white rounded-br-md"
                    : "bg-sky-50 text-stone-700 rounded-bl-md"
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
              <div className="w-6 h-6 rounded-full bg-sky-50 border border-sky-200 p-0.5 flex-shrink-0 flex items-center justify-center">
                <img src="/mascots/judge-hero.svg" alt="" className="w-full h-full rounded-full" />
              </div>
              <div className="bg-sky-50 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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

        {/* Input area */}
        <form onSubmit={handleSubmit} className="px-6 pt-3 border-t border-sky-100" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 1.25rem))" }}>
          {/* Message counter */}
          {messageCount > 0 && !isSleepy && (
            <div className="text-center mb-2">
              <span className={`text-[10px] font-medium ${remainingMessages <= 3 ? "text-amber-500" : "text-stone-300"}`}>
                {remainingMessages} message{remainingMessages !== 1 ? "s" : ""} left today
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isSleepy ? "Skipper is sleeping..." : messages.length === 0 ? "Say hi to Skipper..." : "Type something..."}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-stone-200 text-sm bg-stone-50 text-stone-700 placeholder:text-stone-300 outline-none focus:border-sky-300 transition-colors resize-none disabled:opacity-50"
              rows={1}
              disabled={isLoading || isSleepy}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim() || isSleepy}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ease-in-out active:scale-[0.98] ${
                inputValue.trim() && !isLoading && !isSleepy
                  ? "bg-sky-500 text-white shadow-sm hover:bg-sky-600 hover:shadow-md hover:scale-105"
                  : "bg-stone-300 text-stone-400 cursor-not-allowed"
              }`}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}
