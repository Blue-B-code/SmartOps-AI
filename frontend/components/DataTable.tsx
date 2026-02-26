import type { FC } from "react";

interface DataTableProps {
  rows: Record<string, unknown>[];
}

export const DataTable: FC<DataTableProps> = ({ rows }) => {
  if (!rows.length) {
    return <div className="text-xs text-slate-400">No rows to display.</div>;
  }

  const columns = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set()),
  );

  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-900/60 text-slate-300">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-800/60 hover:bg-slate-900/40">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 text-slate-300">
                  {String((row as Record<string, unknown>)[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

