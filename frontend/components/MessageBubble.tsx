"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

interface MessageBubbleProps {
  from: "user" | "ai";
  children: ReactNode;
}

export function MessageBubble({ from, children }: MessageBubbleProps) {
  const isUser = from === "user";
  return (
    <div className={clsx("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-xl rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-accent text-slate-950 rounded-br-sm"
            : "bg-slate-900/60 border border-slate-800 rounded-bl-sm",
        )}
      >
        {children}
      </div>
    </div>
  );
}

