import { LIVE_DOWN, LIVE_UP } from "./lib/liveFeed";
import { useTerminal } from "./store";
import { Skeleton } from "./Skeleton";

const LOGOS: Record<string, string> = {
  NVDA: "/logos/nvda.png",
  TSLA: "/logos/tsla.png",
  HOOD: "/logos/hood.png",
  AAPL: "/logos/aapl.png",
  AMZN: "/logos/amzn.svg",
  META: "/logos/meta.png",
  GOOGL: "/logos/googl.svg",
  MSFT: "/logos/msft.svg",
};

export function TradeTape() {
  const rows = useTerminal((s) => s.tape);
  const freshId = useTerminal((s) => s.freshFillId);

  return (
    <aside className="flex h-full w-[272px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-black">
      <style>{`
        @keyframes zec-tape-in {
          from { transform: translateX(110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div className="shrink-0 border-b border-white/10 px-4 py-3 text-[10px] font-bold tracking-[0.22em] text-white/55 uppercase">
        Live
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-4">
        {rows.length === 0 &&
          Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-2 border-b border-white/[0.06] py-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        {rows.map((row) => (
          <p
            key={row.id}
            className="flex items-center gap-1.5 border-b border-white/[0.06] py-3"
            style={
              row.id === freshId
                ? { animation: "zec-tape-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both" }
                : undefined
            }
          >
            <span className="font-[IBM_Plex_Mono,ui-monospace,monospace] text-[11px] tracking-[0.02em] text-white/40">{row.wallet}</span>
            <span
              className="text-[11px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: row.side === "down" ? LIVE_DOWN : LIVE_UP }}
            >
              {row.side}
            </span>
            <span
              className="text-[13px] font-semibold tabular-nums tracking-tight"
              style={{ color: row.side === "down" ? LIVE_DOWN : LIVE_UP }}
            >
              ${row.amount}
            </span>
            <span className="text-[11px] font-medium text-white/30">on</span>
            {LOGOS[row.symbol] ? (
              <img src={LOGOS[row.symbol]} alt="" className="h-4 w-4 shrink-0 rounded-sm bg-white object-contain" />
            ) : null}
            <span className="text-[12px] font-semibold tracking-[0.08em] text-white/80">{row.symbol}</span>
          </p>
        ))}
      </div>
    </aside>
  );
}
