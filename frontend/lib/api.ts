import type { AIResponse } from "../types/ai";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8001";

export async function* streamAIResponse(input: {
  query: string;
  context?: Record<string, unknown>;
}): AsyncGenerator<string, void, unknown> {
  // For simplicity, this demo does not implement server-sent chunks from the backend.
  // We simulate streaming on the client by yielding the final JSON string gradually.
  const res = await fetch(`${BACKEND_URL}/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: input.query, context: input.context ?? {} }),
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }

  const json = (await res.json()) as AIResponse;
  const serialized = JSON.stringify(json);

  // Naive client-side streaming: yield chunks of the string.
  const chunkSize = Math.max(32, Math.floor(serialized.length / 5));
  for (let i = 0; i < serialized.length; i += chunkSize) {
    yield serialized.slice(0, i + chunkSize);
    await new Promise((r) => setTimeout(r, 60));
  }
}

export async function callAI(input: {
  query: string;
  context?: Record<string, unknown>;
}): Promise<AIResponse> {
  const res = await fetch(`${BACKEND_URL}/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: input.query, context: input.context ?? {} }),
  });
  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }
  return (await res.json()) as AIResponse;
}

