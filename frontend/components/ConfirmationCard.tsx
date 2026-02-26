import type { FC } from "react";
import type { SuggestedAction } from "../types/ai";

interface ConfirmationCardProps {
  title: string;
  message: string;
  primaryAction?: SuggestedAction;
  onAction: (action: SuggestedAction) => void;
}

export const ConfirmationCard: FC<ConfirmationCardProps> = ({
  title,
  message,
  primaryAction,
  onAction,
}) => {
  return (
    <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
      <div className="font-semibold text-amber-200">{title}</div>
      <p className="mt-1 text-amber-100/90">{message}</p>
      {primaryAction && (
        <button
          className="mt-3 inline-flex items-center rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-amber-300"
          onClick={() => onAction(primaryAction)}
        >
          {primaryAction.label}
        </button>
      )}
    </div>
  );
};

