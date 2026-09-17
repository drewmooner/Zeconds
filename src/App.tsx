import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  BookOpen,
  CandlestickChart,
  Info,
  LayoutGrid,
  Settings,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";
import { Splash } from "./Splash";
import { Intro } from "./Intro";
import { PlaceConfirm } from "./PlaceConfirm";
import { LiveChart } from "./LiveChart";
import { Markets } from "./Markets";
import { WalletPage } from "./Wallet";
import { TradeTape } from "./TradeTape";
import { Leaderboard } from "./Leaderboard";
import { SettingsPage } from "./Settings";
import { HelpPage } from "./Help";
import { BuyZecButton } from "./BuyZec";
import { ZecondsWord } from "./ZecondsWord";
import { t } from "./lib/i18n";
import { useTerminal, STOCKS, type Side, type Tab } from "./store";
import { WINDOWS, oddsLabel } from "./lib/rules";
import { disconnectAppKit, openAppKit } from "./lib/wagmi";
import { connectLiveTape } from "./lib/liveFeed";
import { chimeLose, chimePlace, chimeTie, chimeWin, unlockSfx } from "./lib/sfx";

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

const glass =
  "border border-white/30 bg-black/40 shadow-[inset_0_-10px_18px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl [background-image:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_42%,rgba(255,255,255,0.18))]";

function StockMark({ symbol }: { symbol: string }) {
  const src = LOGOS[symbol];
  if (src) return <img src={src} alt="" className="h-7 w-7 rounded-lg bg-white object-contain md:h-8 md:w-8" />;
  return (
    <b className="grid h-7 w-7 place-items-center rounded-lg bg-white text-sm text-black md:h-8 md:w-8">{symbol[0]}</b>
  );
}

function WalletButton() {
  const kit = useAppKitAccount();
  const wagmi = useAccount();
  const address = kit.address || wagmi.address;
  const isConnected = Boolean(kit.isConnected || wagmi.isConnected || address);
  const { disconnect } = useDisconnect();
  const setTab = useTerminal((s) => s.setTab);
  const zec = useTerminal((s) => s.zec);
  const lang = useTerminal((s) => s.lang);
  const holdings = useTerminal((s) => s.holdings);
  const history = useTerminal((s) => s.history);
  const pickStock = useTerminal((s) => s.pickStock);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bag = Object.entries(holdings).filter(([, v]) => v > 0);

  useEffect(() => {
    if (!isConnected) setOpen(false);
  }, [isConnected]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      <BuyZecButton />
      {!isConnected && (
        <button className={`${glass} h-10 rounded-full px-3 text-xs font-semibold text-white md:h-12 md:px-5 md:text-sm`} onClick={() => openAppKit()}>
          <span className="md:hidden">Connect</span>
          <span className="hidden md:inline">{t(lang, "connect")}</span>
        </button>
      )}
      {isConnected && (
      <div className="relative" ref={menuRef}>
        <button
          className={`${glass} grid h-10 w-10 place-items-center rounded-full text-white md:h-12 md:w-12 ${open ? "bg-white/15" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Profile"
          aria-expanded={open}
        >
          <User className="h-5 w-5" />
        </button>
        {open && (
          <div
            className={`${glass} absolute right-0 top-[calc(100%+8px)] z-40 flex w-[min(340px,calc(100vw-24px))] max-h-[min(72vh,560px)] flex-col overflow-hidden rounded-2xl`}
          >
            <div className="shrink-0 border-b border-white/10 px-4 py-3">
              {isConnected && address ? (
                <button
                  type="button"
                  className="font-[IBM_Plex_Mono,ui-monospace,monospace] text-[12px] text-white/70 hover:text-white"
                  onClick={() => openAppKit("Account")}
                >
                  {address.slice(0, 6)}…{address.slice(-4)}
                </button>
              ) : (
                <p className="text-[12px] text-white/45">Not connected</p>
              )}
              <p className="mt-1 text-[18px] font-semibold tabular-nums text-white">
                {zec.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                <span className="text-[13px] font-semibold text-white/50">$ZEC</span>
              </p>
            </div>

            {bag.length > 0 && (
              <div className="shrink-0 border-b border-white/10 py-1">
                <p className="px-4 pt-2 pb-1 text-[10px] font-bold tracking-[0.16em] text-white/35 uppercase">Holdings</p>
                {bag.map(([sym, v]) => {
                  const s = STOCKS.find((x) => x.symbol === sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-white hover:bg-white/10"
                      onClick={() => {
                        if (s) pickStock(s);
                        setTab("trade");
                        setOpen(false);
                      }}
                    >
                      <StockMark symbol={sym} />
                      <span className="min-w-0 flex-1 text-[13px] font-semibold">{sym}</span>
                      <span className="text-[12px] font-semibold tabular-nums">{v.toFixed(4)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <p className="px-4 pt-2 pb-1 text-[10px] font-bold tracking-[0.16em] text-white/35 uppercase">Trade history</p>
              {history.length === 0 && (
                <p className="px-4 py-3 text-[12px] text-white/40">No rounds yet. Up or Down on Trade writes here.</p>
              )}
              {history.map((row) => (
                <div key={row.id} className="flex items-start gap-3 px-4 py-2">
                  <span
                    className={`mt-0.5 shrink-0 text-[10px] font-bold tracking-wide uppercase ${
                      row.outcome === "win" ? "text-[#3dff8a]" : row.outcome === "lose" ? "text-[#ff4d4d]" : "text-white/40"
                    }`}
                  >
                    {row.outcome}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-white">
                      {row.symbol} {row.side.toUpperCase()} · {row.windowSec}s
                    </span>
                    <span className="block text-[11px] tabular-nums text-white/40">
                      $ZEC {row.stake} · {row.startPx.toFixed(4)} → {row.closePx.toFixed(4)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-[12px] font-semibold tabular-nums text-white">
                    {row.outcome === "win"
                      ? `+${row.shares.toLocaleString(undefined, { maximumFractionDigits: 4 })}`
                      : row.outcome === "tie"
                        ? "refund"
                        : `−${row.stake}`}
                  </span>
                </div>
              ))}
            </div>
            {isConnected && (
              <div className="shrink-0 border-t border-white/10 p-3">
                <button
                  type="button"
                  className="h-10 w-full rounded-full border border-white/15 text-[13px] font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    void disconnectAppKit();
                    disconnect();
                    setOpen(false);
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

export function App() {
  const tab = useTerminal((s) => s.tab);
  const stock = useTerminal((s) => s.stock);
  const picker = useTerminal((s) => s.picker);
  const query = useTerminal((s) => s.query);
  const windowSec = useTerminal((s) => s.windowSec);
  const stake = useTerminal((s) => s.stake);
  const phase = useTerminal((s) => s.phase);
  const left = useTerminal((s) => s.left);
  const outcome = useTerminal((s) => s.outcome);
  const payout = useTerminal((s) => s.payout);
  const payoutShares = useTerminal((s) => s.payoutShares);
  const rounds = useTerminal((s) => s.stats.rounds);
  const zec = useTerminal((s) => s.zec);
  const booting = useTerminal((s) => s.booting);
  const setTab = useTerminal((s) => s.setTab);
  const setQuery = useTerminal((s) => s.setQuery);
  const togglePicker = useTerminal((s) => s.togglePicker);
  const closePicker = useTerminal((s) => s.closePicker);
  const pickStock = useTerminal((s) => s.pickStock);
  const setWindowSec = useTerminal((s) => s.setWindowSec);
  const bumpStake = useTerminal((s) => s.bumpStake);
  const setStake = useTerminal((s) => s.setStake);
  const setBooting = useTerminal((s) => s.setBooting);
  const tickTimer = useTerminal((s) => s.tickTimer);
  const place = useTerminal((s) => s.place);
  const nextTrade = useTerminal((s) => s.nextTrade);
  const lang = useTerminal((s) => s.lang);
  const theme = useTerminal((s) => s.theme);
  const sounds = useTerminal((s) => s.sounds);
  const confirmPlace = useTerminal((s) => s.confirmPlace);
  const setConfirmPlace = useTerminal((s) => s.setConfirmPlace);
  const showLive = useTerminal((s) => s.showLive);
  const [gate, setGate] = useState<"splash" | "intro">("splash");
  const [stakeText, setStakeText] = useState(String(stake));
  const [windowOpen, setWindowOpen] = useState(false);
  const [oneTapHint, setOneTapHint] = useState(false);
  const [pending, setPending] = useState<Side | null>(null);
  const pairRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const stakeFocused = useRef(false);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (pairRef.current && !pairRef.current.contains(t)) closePicker();
      if (windowRef.current && !windowRef.current.contains(t)) setWindowOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [closePicker]);

  const found = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STOCKS;
    return STOCKS.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    );
  }, [query]);
  const odds = oddsLabel(windowSec);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (tab !== "trade") closePicker();
  }, [tab, closePicker]);

  useEffect(() => {
    if (stakeFocused.current) return;
    setStakeText(stake === 0 ? "" : String(stake));
  }, [stake]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      if (now - last >= 80) {
        last = now;
        useTerminal.getState().tickPrice();
      }
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => connectLiveTape((msg) => useTerminal.getState().ingestFill(msg)), []);

  useEffect(() => {
    if (phase !== "live") return;
    const id = window.setInterval(tickTimer, 50);
    return () => window.clearInterval(id);
  }, [phase, tickTimer]);

  useEffect(() => {
    const unlock = () => unlockSfx();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    if (phase !== "done" || !outcome) return;
    const t = window.setTimeout(() => nextTrade(), 5800);
    return () => window.clearTimeout(t);
  }, [phase, outcome, nextTrade]);

  const settleSound = useRef<string | null>(null);
  useEffect(() => {
    if (phase !== "done" || !outcome) {
      if (phase === "idle") settleSound.current = null;
      return;
    }
    const key = `${rounds}-${outcome}`;
    if (settleSound.current === key) return;
    settleSound.current = key;
    if (!sounds) return;
    if (outcome === "win") chimeWin();
    else if (outcome === "lose") chimeLose();
    else chimeTie();
  }, [phase, outcome, sounds, rounds]);

  const send = (side: Side) => {
    if (sounds) chimePlace(side);
    place(side);
    setPending(null);
  };

  const askOrSend = (side: Side) => {
    if (confirmPlace) setPending(side);
    else send(side);
  };

  const timer = useMemo(() => {
    const s = Math.max(0, left);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(Math.floor(s % 60)).padStart(2, "0");
    const cs = String(Math.floor((s % 1) * 100)).padStart(2, "0");
    return `${mm}:${ss}:${cs}`;
  }, [left]);

  return (
    <>
      {booting && gate === "splash" && <Splash onDone={() => setGate("intro")} />}
      {booting && gate === "intro" && <Intro onDone={() => setBooting(false)} />}
      {pending && (
        <PlaceConfirm
          side={pending}
          symbol={stock.symbol}
          name={stock.name}
          windowSec={windowSec}
          stake={stake}
          onSend={() => send(pending)}
          onCancel={() => setPending(null)}
        />
      )}
      <div
        id="desk"
        className={`grid h-full overflow-hidden bg-black text-[#f2f2f2] max-md:grid-cols-1 max-md:grid-rows-[minmax(0,1fr)_auto] md:grid-cols-[88px_minmax(0,1fr)] ${
          booting && gate === "intro" ? "pointer-events-none select-none" : ""
        }`}
      >
        <aside className="z-[6] flex min-h-0 items-center border-white/10 bg-black max-md:order-2 max-md:h-[calc(3.75rem+env(safe-area-inset-bottom))] max-md:w-full max-md:flex-row max-md:border-t max-md:px-1 max-md:pt-1 max-md:pb-[env(safe-area-inset-bottom)] md:h-full md:flex-col md:border-r md:px-2 md:pt-4 md:pb-3">
          <img className="brand-logo mb-1 h-12 w-12 shrink-0 object-contain max-md:hidden" src="/logo.png" alt="Zeconds" />
          <nav className="flex min-h-0 w-full flex-1 max-md:flex-row max-md:items-center max-md:justify-around md:flex-col md:justify-evenly">
            {railItems.map((item) => (
              <button
                key={item.id}
                className={`group relative grid shrink-0 place-items-center rounded-[14px] max-md:h-11 max-md:w-11 md:h-12 md:w-full ${
                  tab === item.id ? "bg-white/10 text-white" : "bg-transparent text-white/55 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setTab(item.id)}
                aria-label={item.label}
              >
                <item.Icon className="h-6 w-6" strokeWidth={1.6} />
                <span className="pointer-events-none absolute top-1/2 left-[calc(100%+14px)] z-10 -translate-y-1/2 rounded-lg border border-white/15 bg-neutral-900/90 px-2.5 py-1.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 max-md:hidden">
                  {t(lang, item.id)}
                </span>
              </button>
            ))}
          </nav>
          <ZecondsWord className="-mt-0.5 w-full shrink-0 px-0.5 max-md:hidden" />
        </aside>

        <div className="relative flex h-full min-h-0 min-w-0 flex-col max-md:order-1">
          <header className="relative z-[7] flex items-center justify-between overflow-visible max-md:h-12 max-md:gap-2 max-md:px-2 md:h-14 md:gap-4 md:px-4">
            {tab === "trade" ? (
            <div
              ref={pairRef}
              className={`${glass} ${picker ? "w-[min(280px,calc(100vw-7.5rem))] rounded-[22px]" : "rounded-full"} mt-1 max-w-[min(280px,calc(100vw-8.5rem))] self-start overflow-hidden`}
            >
              <button
                className="flex h-10 w-full items-center gap-2 py-0 pr-3 pl-1.5 text-sm font-bold tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-55 md:h-12 md:gap-2.5 md:pr-4 md:pl-2"
                onClick={() => {
                  setWindowOpen(false);
                  togglePicker();
                }}
                disabled={phase === "live"}
              >
                <StockMark symbol={stock.symbol} />
                <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                  <span className="truncate">{stock.symbol}<span className="max-md:hidden"> / USD</span></span>
                  <small className="hidden text-[10px] font-medium tracking-wider text-white/55 md:block">{stock.name}</small>
                </span>
                <span className={`text-white/70 ${picker ? "rotate-180" : ""}`}>▾</span>
              </button>
              {picker && (
                <div className="flex max-h-[min(380px,55vh)] flex-col border-t border-white/10 px-2 pt-2 pb-2">
                  <input
                    className="mb-1.5 h-9 w-full rounded-full border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none placeholder:text-white/40"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search stocks"
                    autoFocus
                  />
                  <div className="flex flex-col gap-0.5 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {found.map((s) => (
                      <button
                        key={s.symbol}
                        className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-white ${
                          s.symbol === stock.symbol ? "bg-white/12" : "bg-transparent hover:bg-white/12"
                        }`}
                        onClick={() => pickStock(s)}
                      >
                        <StockMark symbol={s.symbol} />
                        <span className="flex flex-col items-start text-xs font-bold">
                          {s.symbol}
                          <small className="text-[9px] font-medium text-white/50">{s.name}</small>
                        </span>
                      </button>
                    ))}
                    {found.length === 0 && <p className="mx-2 my-2.5 text-xs text-white/45">No stocks match</p>}
                  </div>
                </div>
              )}
            </div>
            ) : (
              <div />
            )}
            {(phase === "live" || (phase === "done" && outcome)) && (
              <div className="pointer-events-none absolute top-1 left-1/2 z-[8] hidden -translate-x-1/2 md:block">
                {phase === "live" && (
                  <div className={`${glass} flex h-12 min-w-[108px] items-center justify-center rounded-full px-5 font-[IBM_Plex_Mono,ui-monospace,monospace] text-sm tabular-nums text-white`}>
                    {timer}
                  </div>
                )}
                {phase === "done" && outcome && (
                  <div className={`${glass} flex min-w-[108px] flex-col items-center justify-center rounded-full px-6 py-2 text-white`}>
                    {outcome === "win" && (
                      <>
                        <span className="text-[13px] font-semibold tabular-nums">
                          +{payoutShares.toLocaleString(undefined, { maximumFractionDigits: 6 })} {stock.symbol}
                        </span>
                        <span className="text-[11px] font-medium tabular-nums text-white/55">
                          $ZEC {payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} after fees
                        </span>
                      </>
                    )}
                    {outcome === "lose" && <span className="text-sm font-semibold">Round lost</span>}
                    {outcome === "tie" && <span className="text-sm font-semibold">Round even · $ZEC back</span>}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 md:gap-3">
              <WalletButton />
            </div>
          </header>
          {(phase === "live" || (phase === "done" && outcome)) && (
            <div className="flex justify-center px-2 pb-1 md:hidden">
              {phase === "live" && (
                <div className={`${glass} flex h-9 min-w-[96px] items-center justify-center rounded-full px-4 font-[IBM_Plex_Mono,ui-monospace,monospace] text-[12px] tabular-nums text-white`}>
                  {timer}
                </div>
              )}
              {phase === "done" && outcome && (
                <div className={`${glass} flex flex-col items-center rounded-full px-4 py-1.5 text-white`}>
                  {outcome === "win" && (
                    <>
                      <span className="text-[12px] font-semibold tabular-nums">
                        +{payoutShares.toLocaleString(undefined, { maximumFractionDigits: 5 })} {stock.symbol}
                      </span>
                      <span className="text-[10px] font-medium tabular-nums text-white/55">
                        $ZEC {payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} after fees
                      </span>
                    </>
                  )}
                  {outcome === "lose" && <span className="text-[12px] font-semibold">Round lost</span>}
                  {outcome === "tie" && <span className="text-[12px] font-semibold">Round even · $ZEC back</span>}
                </div>
              )}
            </div>
          )}

          {tab === "trade" && (
            <div className="mx-2 mt-1 mb-1 flex min-h-0 flex-1 gap-3 md:mx-3 md:mt-3 md:mb-2">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl">
              <LiveChart />
            </div>
              <div className="mt-2 mb-1 flex w-full shrink-0 flex-wrap items-center gap-1.5 md:mt-3 md:h-7 md:flex-nowrap md:justify-center">
                <div className={`${glass} flex h-11 w-[6.75rem] shrink-0 items-center rounded-full px-0.5 md:h-full md:w-[148px]`}>
                  <button
                    className="h-full w-8 shrink-0 text-lg text-white/70 md:w-6 md:text-sm"
                    onClick={() => bumpStake(-10)}
                    disabled={phase === "live"}
                  >
                    −
                  </button>
                  <div className="flex min-w-0 flex-1 items-center justify-center">
                    <span className="shrink-0 text-base font-semibold text-white/55 md:text-[11px]">$</span>
                    <input
                    className="h-full min-w-0 bg-transparent pr-1 pl-0.5 text-center text-base font-semibold text-white outline-none md:text-[11px]"
                    style={{ width: `${Math.max(1, stakeText.length || 1)}ch` }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled={phase === "live"}
                    value={stakeText}
                    placeholder="0"
                    aria-label="Size"
                    onFocus={() => {
                      stakeFocused.current = true;
                    }}
                    onBlur={() => {
                      stakeFocused.current = false;
                      if (stakeText === "") {
                        setStake(0);
                        setStakeText("");
                      } else {
                        setStakeText(String(stake));
                      }
                    }}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, "");
                      setStakeText(raw);
                      if (raw !== "") setStake(Number(raw));
                    }}
                  />
                  </div>
                  <button
                    className="h-full w-8 shrink-0 text-lg text-white/70 md:w-6 md:text-sm"
                    onClick={() => bumpStake(10)}
                    disabled={phase === "live"}
                  >
                    +
                  </button>
                </div>
                <button
                  className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-[#c43b4a] px-2 text-white disabled:opacity-40 md:h-full md:w-[108px] md:flex-none md:px-3"
                  disabled={phase === "live" || stake < 1 || stake > zec}
                  onClick={() => askOrSend("down")}
                  aria-label="Down"
                >
                  <span className="text-[11px] font-semibold tabular-nums">{odds}</span>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-[#1fa866] px-2 text-white disabled:opacity-40 md:h-full md:w-[108px] md:flex-none md:px-3"
                  disabled={phase === "live" || stake < 1 || stake > zec}
                  onClick={() => askOrSend("up")}
                  aria-label="Up"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[11px] font-semibold tabular-nums">{odds}</span>
                </button>
                <div className={`${glass} relative order-last flex h-9 w-full items-center justify-between gap-2 rounded-full px-3 md:order-0 md:h-full md:w-auto md:justify-center md:gap-1.5 md:px-2.5`}>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-white md:text-[10px] md:whitespace-nowrap">One tap bet</span>
                    <span
                      className="relative shrink-0"
                      onMouseEnter={() => setOneTapHint(true)}
                      onMouseLeave={() => setOneTapHint(false)}
                    >
                      <button
                        type="button"
                        className="grid h-4 w-4 place-items-center rounded-full border border-white/25 text-white/45 hover:text-white"
                        aria-label="What one tap bet does"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOneTapHint((v) => !v);
                        }}
                      >
                        <Info className="h-2.5 w-2.5" strokeWidth={2.4} />
                      </button>
                      {oneTapHint && (
                        <span className="absolute bottom-[calc(100%+10px)] left-0 z-30 w-[min(16rem,calc(100vw-2.5rem))] rounded-xl border border-white/15 bg-black/90 px-2.5 py-2 text-left text-[11px] leading-snug text-white/70 shadow-lg md:left-1/2 md:w-44 md:-translate-x-1/2">
                          On: Up / Down sends immediately. Off: you confirm first.
                        </span>
                      )}
                    </span>
                  </span>
                  <button
                    type="button"
                    className={`relative h-5 w-8 shrink-0 rounded-full ${!confirmPlace ? "bg-white" : "bg-white/15"}`}
                    onClick={() => setConfirmPlace(!confirmPlace)}
                    aria-pressed={!confirmPlace}
                    aria-label="Toggle one tap bet"
                  >
                    <span
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-black"
                      style={{ left: !confirmPlace ? 14 : 2 }}
                    />
                  </button>
                </div>
                <div className="relative h-11 w-[52px] shrink-0 md:h-full md:w-[58px]" ref={windowRef}>
                  <button
                    className={`${glass} flex h-full w-full items-center justify-center gap-0.5 rounded-full px-2 text-[11px] font-semibold text-white disabled:opacity-50`}
                    disabled={phase === "live"}
                    onClick={() => {
                  closePicker();
                  setWindowOpen((v) => !v);
                }}
                    aria-label="Window"
                  >
                    {windowSec}s
                    <span className="text-[10px] text-white/70">▾</span>
                  </button>
                  {windowOpen && phase !== "live" && (
                    <div className={`${glass} absolute right-0 bottom-[calc(100%+6px)] z-20 flex w-[58px] flex-col overflow-hidden rounded-2xl py-1`}>
                      {WINDOWS.map((w) => (
                        <button
                          key={w}
                          className={`px-2 py-1.5 text-[13px] ${
                            windowSec === w ? "bg-white text-black" : "text-white hover:bg-white/15"
                          }`}
                          onClick={() => {
                            setWindowSec(w);
                            setWindowOpen(false);
                          }}
                        >
                          {w}s
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {showLive && <div className="hidden h-full lg:flex"><TradeTape /></div>}
            </div>
          )}

          {tab === "markets" && <Markets />}

          {tab === "wallet" && <WalletPage />}

          {tab === "leaderboard" && <Leaderboard />}

          {tab === "settings" && <SettingsPage />}

          {tab === "help" && <HelpPage />}
        </div>
      </div>
    </>
  );
}

const railItems: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: "trade", label: "Trade", Icon: CandlestickChart },
  { id: "markets", label: "Markets", Icon: LayoutGrid },
  { id: "leaderboard", label: "Leaderboard", Icon: Trophy },
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "help", label: "Help / Docs", Icon: BookOpen },
];
