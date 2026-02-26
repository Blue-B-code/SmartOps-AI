"use client";

import type { FC } from "react";
import type { AIResponse, SuggestedAction } from "../types/ai";
import { DataTable } from "./DataTable";
import { ConfirmationCard } from "./ConfirmationCard";

interface DynamicRendererProps {
  response: AIResponse;
  onAction: (action: SuggestedAction) => void;
}

export const DynamicRenderer: FC<DynamicRendererProps> = ({ response, onAction }) => {
  const { ui_type, title, message, data, suggested_actions } = response;

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {ui_type}
        </div>
        <div className="mt-1 text-sm font-semibold text-slate-50">{title}</div>
        <p className="mt-1 text-xs text-slate-300">{message}</p>
      </div>

      {ui_type === "table" && <DataTable rows={data} />}

      {ui_type === "summary" && (
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {data.map((row, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs"
            >
              <div className="text-[11px] uppercase tracking-wide text-slate-400">
                {String(row.metric ?? "Metric")}
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-50">
                {String(row.value ?? "-")}
              </div>
              {row.detail && (
                <div className="mt-1 text-[11px] text-slate-400">
                  {String(row.detail ?? "")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {ui_type === "confirmation" && (
        <ConfirmationCard
          title={title}
          message={message}
          primaryAction={suggested_actions[0]}
          onAction={onAction}
        />
      )}

      {suggested_actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggested_actions.map((action, idx) => (
            <button
              key={idx}
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px] font-medium text-slate-100 hover:border-accent/80 hover:text-accent"
              onClick={() => onAction(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

