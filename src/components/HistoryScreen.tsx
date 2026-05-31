import React from "react";
import {
  Database,
  Trash2,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { HistoryItem } from "../types";
import { getHistoryRiskClasses } from "../services/riskLevelUtils";

interface HistoryScreenProps {
  historyItems: HistoryItem[];
  loading: boolean;
  error: string | null;
  onSelectHistoryItem: (reportId: string) => void;
  onClearHistory: () => void;
  onRetry: () => void;
}

export default function HistoryScreen({
  historyItems,
  loading,
  error,
  onSelectHistoryItem,
  onClearHistory,
  onRetry,
}: HistoryScreenProps) {
  const handleWipeHistory = () => {
    const confirmWipe = window.confirm(
      "Delete all saved scans from your account? This cannot be undone."
    );
    if (confirmWipe) {
      onClearHistory();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0" id="history-logs-view">
      <div className="px-5 pt-4 pb-3 bg-[#05070A] border-b border-slate-900/40 flex justify-between items-center select-none z-40 shrink-0">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            Scan history
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Saved to your account in Firestore</p>
        </div>

        {historyItems.length > 0 && !loading && (
          <button
            id="clear-logs-btn"
            onClick={handleWipeHistory}
            className="p-1 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-rose-400 rounded-2xl text-[9.5px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="flex-grow p-5 space-y-4 select-none overflow-y-auto text-left min-h-0">
        {loading && (
          <div className="flex flex-col items-center justify-center text-center p-10 min-h-[280px]">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-xs font-mono text-slate-400">Loading your scans…</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-200/90 leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="text-[10px] font-mono font-bold text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && historyItems.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-850 bg-slate-900/10 rounded-3xl my-auto space-y-3 min-h-[300px]">
            <Database className="w-10 h-10 text-slate-700" />
            <h5 className="text-xs font-bold text-slate-300">No scans found</h5>
            <p className="text-[10px] text-slate-500 max-w-[220px] leading-relaxed">
              Run a scam text analysis from the sandbox. Your saved scans will show up here.
            </p>
          </div>
        )}

        {!loading && !error && historyItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-slate-550 tracking-wider font-bold">
              <Database className="w-4 h-4 text-slate-600" />
              <span>{historyItems.length} saved scans</span>
            </div>

            <div className="space-y-2.5">
              {historyItems.map((item) => {
                const riskStyle = getHistoryRiskClasses(item.riskLevel);

                return (
                  <button
                    id={`full-history-row-${item.id}`}
                    key={item.id}
                    type="button"
                    onClick={() => onSelectHistoryItem(item.reportId)}
                    className="w-full text-left p-3.5 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-805 hover:border-slate-800 rounded-2xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-xl border shrink-0 ${riskStyle.icon}`}>
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                            &ldquo;{item.previewText}&rdquo;
                          </p>

                          <p className="text-[9px] text-slate-500 font-mono mt-2">{item.timestamp}</p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span
                              className={`text-[8px] font-mono font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border bg-slate-950/60 ${riskStyle.badge}`}
                            >
                              {item.riskLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <span
                          className={`text-sm font-mono font-extrabold px-2 py-1 rounded-lg border bg-slate-950/80 ${riskStyle.badge}`}
                        >
                          {item.riskScore}%
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
