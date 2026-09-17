import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useTerminal } from "./store";

const WALLETS = [
  "0x8f2a…c41d",
  "0x12ab…91e0",
  "0x77c0…3b2a",
  "0xa91e…04ff",
  "0x40d1…aa18",
  "0xbe44…9c01",
  "0x03f6…d882",
  "0xcc19…7e55",
];

function isoDay(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(offset: number, iso: string) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Yesterday";
  const [, m, day] = iso.split("-");
  return `${m}/${day}`;
}

function housePnl(wallet: string, day: string) {
  let h = 2166136261;
  for (const c of wallet + day) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h % 28001) - 6000);
}

function fmtPnl(n: number) {
  const abs = Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (n > 0) return `+${abs}`;
  if (n < 0) return `−${abs}`;
  return "0";
}

const DAYS = Array.from({ length: 7 }, (_, i) => {
  const key = isoDay(i);
  return { key, offset: i, label: dayLabel(i, key) };
});

export function Leaderboard() {
  const dayPnl = useTerminal((s) => s.dayPnl);
  const { address } = useAccount();
  const youWallet = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "you";
  const [day, setDay] = useState(DAYS[0].key);

  const rows = useMemo(() => {
    const you = { id: "you", you: true, wallet: youWallet, pnl: dayPnl[day] ?? 0 };
    const house = WALLETS.map((wallet, i) => ({
      id: `h${i}`,
      you: false,
      wallet,
      pnl: housePnl(wallet, day),
    }));
    return [you, ...house].sort((a, b) => b.pnl - a.pnl);
  }, [day, dayPnl, youWallet]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-5">
      <div className="shrink-0">
        <p className="text-[10px] font-bold tracking-[0.22em] text-white/55 uppercase">Leaderboard</p>
        <p className="mt-1 text-sm text-white/45">Wallet PnL by day.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {DAYS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDay(d.key)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                day === d.key ? "bg-white text-black" : "border border-white/15 text-white/50"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={`flex items-center gap-4 border-b border-white/[0.06] py-3.5 ${row.you ? "bg-white/[0.04]" : ""}`}
          >
            <span className="w-7 shrink-0 text-[15px] font-bold tabular-nums text-white/35">{i + 1}</span>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span className="font-[IBM_Plex_Mono,ui-monospace,monospace] text-[13px] text-white">{row.wallet}</span>
              {row.you && <span className="text-[10px] font-bold tracking-[0.14em] text-white/40 uppercase">You</span>}
            </span>
            <span
              className={`shrink-0 text-[15px] font-bold tabular-nums ${
                row.pnl > 0 ? "text-[#3dff8a]" : row.pnl < 0 ? "text-[#ff4d4d]" : "text-white/45"
              }`}
            >
              {fmtPnl(row.pnl)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
