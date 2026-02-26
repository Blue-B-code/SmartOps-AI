import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "SmartOps AI",
  description: "AI-native operational assistant for anomalies and corrective actions.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-slate-100">
        <div className="min-h-screen flex">
          <aside className="hidden md:flex w-72 flex-col border-r border-slate-800 bg-surface/80 backdrop-blur">
            <div className="px-6 py-5 border-b border-slate-800">
              <div className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
                SmartOps
              </div>
              <div className="mt-1 text-lg font-semibold">Operational Assistant</div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 text-sm text-slate-400">
              <div className="mb-3 font-semibold text-slate-300">Recent runs</div>
              <div className="space-y-2 text-xs">
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
                  Rejected claims overview
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
                  Large family anomaly scan
                </div>
              </div>
              <div className="mt-6 mb-2 font-semibold text-slate-300">Proactive checks</div>
              <ul className="space-y-1 text-xs">
                <li>• Rejection spikes</li>
                <li>• Future-dated claims</li>
                <li>• High-risk family clusters</li>
              </ul>
            </div>
          </aside>
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}

