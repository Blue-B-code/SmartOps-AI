export type UIType = "summary" | "table" | "suggestion" | "confirmation";

export interface SuggestedAction {
  label: string;
  description: string;
  payload: {
    query: string;
    context?: Record<string, unknown>;
  };
}

export interface AIResponse {
  ui_type: UIType;
  title: string;
  message: string;
  data: Record<string, unknown>[];
  suggested_actions: SuggestedAction[];
}

