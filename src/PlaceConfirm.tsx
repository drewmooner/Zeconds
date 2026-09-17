import { useEffect } from "react";
import { oddsLabel, quoteWinPayout, type WindowSec } from "./lib/rules";
import type { Side } from "./store";

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

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium tracking-[0.14em] text-white/35 uppercase">{label}</p>
      <p className="mt-1 truncate text-[13px] font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}

export function PlaceConfirm({
  side,
  symbol,
  name,
  windowSec,
  stake,
  onSend,
  onCancel,
}: {
  side: Side;
  symbol: string;
  name: string;
  windowSec: WindowSec;
  stake: number;
  onSend: () => void;
  onCancel: () => void;
}) {
  const up = side === "up";
  const ink = up ? "#1fa866" : "#c43b4a";
  const win = quoteWinPayout(stake, windowSec);
  const src = LOGOS[symbol];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onSend();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSend, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onCancel}
        aria-label="Cancel"
      />
      <div
        role="dialog"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/12 bg-[#0c0c0c]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        <div className="h-px w-full" style={{ background: ink }} />
        <div className="px-5 pt-4 pb-5">
          <p id="confirm-title" className="text-[11px] font-medium tracking-[0.16em] text-white/40 uppercase">
            Confirm order
          </p>

          <div className="mt-4 flex items-center gap-3">
            {src ? (
              <img src={src} alt="" className="h-10 w-10 rounded-lg bg-white object-contain" />
            ) : (
              <b className="grid h-10 w-10 place-items-center rounded-lg bg-white text-sm text-black">{symbol[0]}</b>
            )}
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[16px] font-semibold tracking-tight text-white">{symbol}</p>
              <p className="text-[12px] text-white/40">{name}</p>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]"
              style={{ color: ink, background: `${ink}22` }}
            >
              {up ? "UP" : "DOWN"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-white/[0.08] pt-4">
            <Spec label="Size" value={`$${stake.toLocaleString()}`} />
            <Spec label="Window" value={`${windowSec}s`} />
            <Spec label="Odds" value={oddsLabel(windowSec)} />
            <Spec
              label="Win (after fees)"
              value={`$${win.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-white/40">
            Paid in {symbol} if expiry is {up ? "above" : "below"} entry. Otherwise the size is lost.
          </p>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              className="h-10 flex-1 rounded-lg border border-white/12 text-[13px] font-medium text-white/70 hover:bg-white/[0.04] hover:text-white"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-10 flex-1 rounded-lg text-[13px] font-semibold text-white"
              style={{ background: ink }}
              onClick={onSend}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
