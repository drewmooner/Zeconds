import { useAccount } from "wagmi";
import { STOCKS } from "./lib/rules";
import { useTerminal } from "./store";
import { BuyZecButton } from "./BuyZec";

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

export function WalletPage() {
  const zec = useTerminal((s) => s.zec);
  const holdings = useTerminal((s) => s.holdings);
  const lastPx = useTerminal((s) => s.lastPx);
  const liveSymbol = useTerminal((s) => s.stock.symbol);
  const pickStock = useTerminal((s) => s.pickStock);
  const setTab = useTerminal((s) => s.setTab);
  const { address, isConnected } = useAccount();

  const bag = Object.entries(holdings).filter(([, v]) => v > 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-6 md:py-5">
      <div className="shrink-0">
        <p className="text-[10px] font-bold tracking-[0.22em] text-white/55 uppercase">Wallet</p>
        <p className="mt-1 text-sm text-white/45">ZEC is the protocol chip. Hold it to bet — nothing is staked.</p>
        {isConnected && address && (
          <p className="mt-2 font-[IBM_Plex_Mono,ui-monospace,monospace] text-[12px] tracking-[0.02em] text-white/40">
            {address.slice(0, 6)}…{address.slice(-4)}
          </p>
        )}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-3 border-b border-white/[0.06] py-3.5">
          <img src="/logo.png" alt="" className="brand-logo h-8 w-8 rounded-lg object-contain" />
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold tracking-[0.04em] text-white">$ZEC</span>
            <span className="block text-[12px] text-white/40">Chip</span>
          </span>
          <span className="text-[14px] font-semibold tabular-nums text-white">
            {zec.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="py-3">
          <BuyZecButton size="block" />
        </div>

        {bag.map(([sym, v]) => {
          const stock = STOCKS.find((s) => s.symbol === sym);
          return (
            <button
              key={sym}
              className="flex w-full items-center gap-3 border-b border-white/[0.06] py-3.5 text-left hover:bg-white/[0.04]"
              onClick={() => {
                if (stock) pickStock(stock);
                setTab("trade");
              }}
            >
              <Mark symbol={sym} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold tracking-[0.04em] text-white">{sym}</span>
                <span className="block text-[12px] text-white/40">{stock?.name ?? "Shares"}</span>
              </span>
              <span className="text-right">
                <span className="block text-[14px] font-semibold tabular-nums text-white">{v.toFixed(6)}</span>
                <span className="block text-[11px] tabular-nums text-white/40">
                  ~$ZEC {(v * (sym === liveSymbol ? lastPx : stock?.seed ?? 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </span>
            </button>
          );
        })}

        {bag.length === 0 && (
          <p className="py-8 text-sm text-white/40">No stock yet. Win a round on Trade and it shows up here.</p>
        )}
      </div>
    </div>
  );
}
