import { ChatWindow } from "../components/ChatWindow";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="flex-1 px-4 py-4 md:px-8 md:py-6">
        <div className="mx-auto flex h-full max-w-5xl flex-col">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                SmartOps AI
              </div>
              <h1 className="text-lg font-semibold text-slate-50">
                Operational anomaly detection & corrective guidance
              </h1>
            </div>
            <div className="hidden text-xs text-slate-400 md:block">
              Not a chatbot. Each run is an operational analysis with structured output.
            </div>
          </header>
          <section className="flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl">
            <ChatWindow />
          </section>
        </div>
      </div>
    </div>
  );
}

