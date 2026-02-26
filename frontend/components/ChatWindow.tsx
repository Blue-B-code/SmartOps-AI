"use client";

import { useEffect, useRef, useState } from "react";
import type { AIResponse, SuggestedAction } from "../types/ai";
import { MessageBubble } from "./MessageBubble";
import { DynamicRenderer } from "./DynamicRenderer";
import { streamAIResponse } from "../lib/api";

interface Message {
  id: string;
  from: "user" | "ai";
  text?: string;
  aiPayload?: AIResponse;
}

function parseStreamedJson(buffer: string): AIResponse | null {
  try {
    return JSON.parse(buffer) as AIResponse;
  } catch {
    return null;
  }
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Proactive anomaly detection on initial load
    if (messages.length === 0) {
      void runQuery("Run proactive anomaly overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runQuery = async (query: string, context?: Record<string, unknown>) => {
    setIsLoading(true);
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      from: "user",
      text: query,
    };
    setMessages((prev) => [...prev, userMessage]);

    let buffer = "";
    const aiMessageId = `${Date.now()}-ai`;

    for await (const chunk of streamAIResponse({ query, context })) {
      buffer = chunk;
      const parsed = parseStreamedJson(buffer);
      if (parsed) {
        setMessages((prev) => {
          const others = prev.filter((m) => m.id !== aiMessageId);
          return [
            ...others,
            {
              id: aiMessageId,
              from: "ai",
              aiPayload: parsed,
            },
          ];
        });
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const query = input.trim();
    setInput("");
    await runQuery(query);
  };

  const handleSuggestedAction = async (action: SuggestedAction) => {
    await runQuery(action.payload.query, action.payload.context);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 bg-surface/80 px-6 py-4">
        <div>
          <div className="text-sm font-semibold text-slate-50">SmartOps AI Control Panel</div>
          <div className="text-xs text-slate-400">
            Analyze operations, detect anomalies, and propose corrective actions.
          </div>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            Thinking through operational impact…
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} from={msg.from}>
            {msg.text && <div className="whitespace-pre-wrap text-xs">{msg.text}</div>}
            {msg.aiPayload && (
              <DynamicRenderer response={msg.aiPayload} onAction={handleSuggestedAction} />
            )}
          </MessageBubble>
        ))}
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-xs text-slate-500">
            SmartOps AI is ready. Ask about rejected claims, invalid dates, or large families.
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-800 bg-slate-950/70 px-4 py-3 backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <input
            className="flex-1 rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-accent"
            placeholder="Describe the operational question you want SmartOps AI to answer…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            Run analysis
          </button>
        </div>
      </form>
    </div>
  );
}

