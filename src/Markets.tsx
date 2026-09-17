import { useMemo, useState } from "react";
import { STOCKS, type Stock } from "./lib/rules";
import { useTerminal } from "./store";

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

function Mark({ symbol }: { symbol: string }) {
  const src = LOGOS[symbol];
  if (src) return <img src={src} alt="" className="h-8 w-8 rounded-lg bg-white object-contain" />;
  return (
    <b className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm text-black">{symbol[0]}</b>
  );
}

function quotes() {
  return STOCKS.map((s) => {
    const chg = (Math.random() - 0.42) * 1.8;
    return {
      stock: s,
      last: s.seed * (1 + chg / 100),
      chg,
      vol: 12_000 + Math.floor(Math.random() * 80_000),
    };
  });
}

export function Markets() {
  const pickStock = useTerminal((s) => s.pickStock);
  const setTab = useTerminal((s) => s.setTab);
  const [q, setQ] = useState("");
  const book = useMemo(quotes, []);

  const go = (stock: Stock) => {
    pickStock(stock);
    setTab("trade");
  };

  const query = q.trim().toLowerCase();
  const house = book.filter(
    (row) =>
      !query ||
      row.stock.symbol.toLowerCase().includes(query) ||
      row.stock.name.toLowerCase().includes(query),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-5">
      <div className="shrink-0">
        <p className="text-[10px] font-bold tracking-[0.22em] text-white/55 uppercase">Markets</p>
        <p className="mt-1 text-sm text-white/45">Tap a stock to trade.</p>
      </div>
      <input
        className="mt-4 h-11 w-full max-w-md rounded-xl border border-white/20 bg-white/5 px-3 text-[13px] text-white outline-none placeholder:text-white/35"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search stocks"
      />

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {house.map((row) => {
          const up = row.chg >= 0;
          return (
            <button
              key={row.stock.symbol}
              className="flex w-full items-center gap-3 border-b border-white/[0.06] py-3.5 text-left hover:bg-white/[0.04]"
              onClick={() => go(row.stock)}
            >
              <Mark symbol={row.stock.symbol} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold tracking-[0.04em] text-white">{row.stock.symbol}</span>
                <span className="block text-[12px] text-white/40">{row.stock.name}</span>
              </span>
              <span className="text-right">
                <span className="block text-[14px] font-semibold tabular-nums text-white">{row.last.toFixed(2)}</span>
                <span className={`block text-[12px] font-medium tabular-nums ${up ? "text-[#3dd68c]" : "text-[#f07178]"}`}>
                  {up ? "+" : ""}
                  {row.chg.toFixed(2)}%
                </span>
              </span>
            </button>
          );
        })}

        {house.length === 0 && <p className="py-8 text-sm text-white/40">Nothing matches.</p>}
      </div>
    </div>
  );
}
