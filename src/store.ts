import { create } from "zustand";
import {
  STOCKS,
  quoteWinPayout,
  type Stock,
  type WindowSec,
} from "./lib/rules";
import type { CrowdBet, TradeCandle } from "./LiveChart";
import type { Lang, Theme } from "./lib/i18n";
import type { LiveFillMsg } from "./lib/liveFeed";

const TAPE_MAX = 10;
let fillSeq = 1;

export type LiveFill = LiveFillMsg & { id: number };

function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem("zeconds-settings") || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function writePrefs(p: Record<string, unknown>) {
  try {
    const cur = readPrefs();
    localStorage.setItem("zeconds-settings", JSON.stringify({ ...cur, ...p }));
  } catch {
    /* ignore */
  }
}

const prefs = readPrefs();

export type DeskStats = {
  rounds: number;
  wins: number;
  losses: number;
  ties: number;
  wonZec: number;
  streak: number;
  bestStreak: number;
  bySymbol: Record<string, { wins: number; rounds: number }>;
};

const emptyStats = (): DeskStats => ({
  rounds: 0,
  wins: 0,
  losses: 0,
  ties: 0,
  wonZec: 0,
  streak: 0,
  bestStreak: 0,
  bySymbol: {},
});

export type Phase = "idle" | "live" | "done";
export type Side = "up" | "down";
export type Outcome = "win" | "lose" | "tie";
export type Tab = "trade" | "markets" | "wallet" | "leaderboard" | "settings" | "help";

export type TradeRecord = {
  id: number;
  at: number;
  symbol: string;
  side: Side;
  windowSec: WindowSec;
  stake: number;
  startPx: number;
  closePx: number;
  outcome: Outcome;
  payout: number;
  shares: number;
};

export function seedWalk(seed: number, n: number) {
  const out = [seed];
  let v = seed;
  for (let i = 1; i < n; i++) {
    v = Math.max(0.01, v + (Math.random() - 0.48) * seed * 0.0007);
    out.push(v);
  }
  return out;
}

type TerminalState = {
  tab: Tab;
  stock: Stock;
  picker: boolean;
  query: string;
  windowSec: WindowSec;
  stake: number;
  series: number[];
  candles: TradeCandle[];
  crowd: CrowdBet[];
  tape: LiveFill[];
  freshFillId: number;
  liveOpenI: number | null;
  phase: Phase;
  left: number;
  startPx: number;
  outcome: Outcome | null;
  payout: number;
  payoutShares: number;
  zec: number;
  holdings: Record<string, number>;
  history: TradeRecord[];
  stats: DeskStats;
  dayPnl: Record<string, number>;
  booting: boolean;
  lastPx: number;
  liveHi: number;
  liveLo: number;
  side: Side;
  closed: boolean;
  lang: Lang;
  theme: Theme;
  sounds: boolean;
  confirmPlace: boolean;
  showLive: boolean;
  defaultWindow: WindowSec;
  defaultStake: number;
  setTab: (tab: Tab) => void;
  setQuery: (query: string) => void;
  togglePicker: () => void;
  closePicker: () => void;
  pickStock: (stock: Stock) => void;
  setWindowSec: (w: WindowSec) => void;
  bumpStake: (delta: number) => void;
  setStake: (n: number) => void;
  setBooting: (v: boolean) => void;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  setSounds: (v: boolean) => void;
  setConfirmPlace: (v: boolean) => void;
  setShowLive: (v: boolean) => void;
  setDefaultWindow: (w: WindowSec) => void;
  setDefaultStake: (n: number) => void;
  tickPrice: () => void;
  ingestFill: (msg: LiveFillMsg) => void;
  tickTimer: () => void;
  place: (side: Side) => void;
  buyZec: (n: number) => void;
  nextTrade: () => void;
};

export const useTerminal = create<TerminalState>((set, get) => {
  const startSeries = seedWalk(STOCKS[0].seed, 90);
  return {
  tab: "trade",
  stock: STOCKS[0],
  picker: false,
  query: "",
  windowSec: ([5, 15, 30, 45, 60] as WindowSec[]).includes(prefs.defaultWindow as WindowSec)
    ? (prefs.defaultWindow as WindowSec)
    : 5,
  stake: typeof prefs.defaultStake === "number" ? prefs.defaultStake : 50,
  series: startSeries,
  candles: [],
  crowd: [],
  tape: [],
  freshFillId: 0,
  liveOpenI: null,
  phase: "idle",
  left: 0,
  startPx: 0,
  outcome: null,
  payout: 0,
  payoutShares: 0,
  zec: typeof prefs.zec === "number" ? prefs.zec : 10_000,
  holdings: {},
  history: Array.isArray(prefs.history) ? (prefs.history as TradeRecord[]) : [],
  stats: emptyStats(),
  dayPnl: typeof prefs.dayPnl === "object" && prefs.dayPnl ? (prefs.dayPnl as Record<string, number>) : {},
  booting: true,
  lastPx: STOCKS[0].seed,
  liveHi: STOCKS[0].seed,
  liveLo: STOCKS[0].seed,
  side: "up",
  closed: false,
  lang: (["en", "es", "fr", "pt", "de", "zh", "ja"] as Lang[]).includes(prefs.lang as Lang) ? (prefs.lang as Lang) : "en",
  theme: prefs.theme === "light" ? "light" : "dark",
  sounds: prefs.sounds !== false,
  confirmPlace: prefs.confirmPlace !== false,
  showLive: prefs.showLive !== false,
  defaultWindow: ([5, 15, 30, 45, 60] as WindowSec[]).includes(prefs.defaultWindow as WindowSec)
    ? (prefs.defaultWindow as WindowSec)
    : 5,
  defaultStake: typeof prefs.defaultStake === "number" ? prefs.defaultStake : 50,

  setTab: (tab) => set({ tab }),
  setQuery: (query) => set({ query }),
  togglePicker: () =>
    set((s) => ({ picker: !s.picker, query: s.picker ? s.query : "" })),
  closePicker: () => set({ picker: false }),
  pickStock: (stock) => {
    const walk = seedWalk(stock.seed, 90);
    set({
      stock,
      picker: false,
      query: "",
      lastPx: stock.seed,
      liveHi: stock.seed,
      liveLo: stock.seed,
      liveOpenI: null,
      candles: [],
      crowd: [],
      series: walk,
      phase: "idle",
      outcome: null,
      closed: false,
    });
  },
  setWindowSec: (windowSec) => set({ windowSec }),
  bumpStake: (delta) => set((s) => ({ stake: Math.max(0, s.stake + delta) })),
  setStake: (n) =>
    set({
      stake: Math.max(0, Math.min(1_000_000, Math.floor(Number.isFinite(n) ? n : 0))),
    }),
  setBooting: (booting) => set({ booting }),
  setLang: (lang) => {
    writePrefs({ lang });
    set({ lang });
  },
  setTheme: (theme) => {
    writePrefs({ theme });
    set({ theme });
  },
  setSounds: (sounds) => {
    writePrefs({ sounds });
    set({ sounds });
  },
  setConfirmPlace: (confirmPlace) => {
    writePrefs({ confirmPlace });
    set({ confirmPlace });
  },
  setShowLive: (showLive) => {
    writePrefs({ showLive });
    set({ showLive });
  },
  setDefaultWindow: (w) => {
    writePrefs({ defaultWindow: w });
    set({ defaultWindow: w, windowSec: w });
  },
  setDefaultStake: (n) => {
    writePrefs({ defaultStake: n });
    set({ defaultStake: n, stake: n });
  },

  tickPrice: () => {
    const s = get();
    const vol = s.lastPx * 0.0009;
    const drift = (Math.random() - 0.48) * vol;
    const spike = Math.random() < 0.06 ? (Math.random() - 0.5) * vol * 4 : 0;
    const lastPx = Math.max(0.01, s.lastPx + drift + spike);
    s.series.push(lastPx);
    if (s.series.length > 420) {
      const cut = s.series.length - 420;
      s.series.splice(0, cut);
      const liveOpenI = s.liveOpenI != null ? Math.max(0, s.liveOpenI - cut) : null;
      set({
        lastPx,
        liveOpenI,
        candles: s.candles.map((c) => ({ ...c, i: c.i - cut, openI: (c.openI ?? c.i) - cut })).filter((c) => c.i >= 0),
        crowd: s.crowd.map((b) => ({ ...b, i: b.i - cut })).filter((b) => b.i >= 0),
        liveHi: liveOpenI != null ? Math.max(s.liveHi, lastPx) : s.liveHi,
        liveLo: liveOpenI != null ? Math.min(s.liveLo, lastPx) : s.liveLo,
      });
      return;
    }
    set({
      lastPx,
      liveHi: s.liveOpenI != null ? Math.max(s.liveHi, lastPx) : s.liveHi,
      liveLo: s.liveOpenI != null ? Math.min(s.liveLo, lastPx) : s.liveLo,
    });
  },

  ingestFill: (msg) => {
    const s = get();
    const id = fillSeq++;
    const onPair = msg.symbol === s.stock.symbol;
    const tape = [{ ...msg, id }, ...s.tape].slice(0, TAPE_MAX);
    const crowd = onPair
      ? [
          ...s.crowd,
          {
            i: s.series.length - 1,
            price: s.lastPx,
            amount: msg.amount,
            side: msg.side,
            above: s.crowd.length % 2 === 0,
          },
        ].slice(-20)
      : s.crowd;
    set({ tape, crowd, freshFillId: id });
  },

  tickTimer: () => {
    const s = get();
    if (s.phase !== "live") return;
    if (s.left > 0) {
      set({ left: Math.max(0, +(s.left - 0.05).toFixed(2)) });
      return;
    }
    if (s.closed) return;
    const finish = s.lastPx;
    const eps = s.startPx * 1e-8;
    let result: Outcome;
    if (Math.abs(finish - s.startPx) <= eps) result = "tie";
    else if (finish > s.startPx) result = s.side === "up" ? "win" : "lose";
    else result = s.side === "down" ? "win" : "lose";

    const closeI = s.series.length - 1;
    const candle: TradeCandle = {
      i: closeI,
      openI: s.liveOpenI ?? closeI,
      open: s.startPx,
      close: finish,
      high: Math.max(s.liveHi, s.startPx, finish),
      low: Math.min(s.liveLo, s.startPx, finish),
      tone: result === "win" ? "win" : result === "lose" ? "lose" : "tie",
    };
    const paid = result === "win" ? quoteWinPayout(s.stake, s.windowSec) : 0;
    const shares = result === "win" && finish > 0 ? paid / finish : 0;
    const streak = result === "win" ? s.stats.streak + 1 : result === "lose" ? 0 : s.stats.streak;
    const prevPair = s.stats.bySymbol[s.stock.symbol] ?? { wins: 0, rounds: 0 };
    const stats: DeskStats = {
      rounds: s.stats.rounds + 1,
      wins: s.stats.wins + (result === "win" ? 1 : 0),
      losses: s.stats.losses + (result === "lose" ? 1 : 0),
      ties: s.stats.ties + (result === "tie" ? 1 : 0),
      wonZec: s.stats.wonZec + paid,
      streak,
      bestStreak: Math.max(s.stats.bestStreak, streak),
      bySymbol: {
        ...s.stats.bySymbol,
        [s.stock.symbol]: {
          rounds: prevPair.rounds + 1,
          wins: prevPair.wins + (result === "win" ? 1 : 0),
        },
      },
    };
    const nextZec = result === "tie" ? s.zec + s.stake : s.zec;
    const record: TradeRecord = {
      id: Date.now(),
      at: Date.now(),
      symbol: s.stock.symbol,
      side: s.side,
      windowSec: s.windowSec,
      stake: s.stake,
      startPx: s.startPx,
      closePx: finish,
      outcome: result,
      payout: paid,
      shares,
    };
    const history = [record, ...s.history].slice(0, 50);
    writePrefs({ zec: nextZec, history });
    set({
      closed: true,
      outcome: result,
      phase: "done",
      liveOpenI: null,
      payout: paid,
      payoutShares: shares,
      zec: nextZec,
      holdings:
        result === "win"
          ? {
              ...s.holdings,
              [s.stock.symbol]: (s.holdings[s.stock.symbol] ?? 0) + shares,
            }
          : s.holdings,
      candles: [...s.candles, candle].slice(-8),
      stats,
      history,
      dayPnl: (() => {
        const delta = result === "win" ? paid : result === "lose" ? -s.stake : 0;
        const now = new Date();
        const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const next = { ...s.dayPnl, [key]: (s.dayPnl[key] ?? 0) + delta };
        writePrefs({ dayPnl: next });
        return next;
      })(),
    });
  },

  place: (side) => {
    const s = get();
    if (s.phase === "live" || s.stake <= 0 || s.stake > s.zec) return;
    const nextZec = s.zec - s.stake;
    writePrefs({ zec: nextZec });
    set({
      closed: false,
      side,
      zec: nextZec,
      startPx: s.lastPx,
      outcome: null,
      payout: 0,
      payoutShares: 0,
      left: s.windowSec,
      phase: "live",
      liveHi: s.lastPx,
      liveLo: s.lastPx,
      liveOpenI: s.series.length - 1,
      crowd: [
        ...s.crowd,
        {
          i: s.series.length - 1,
          price: s.lastPx,
          amount: s.stake,
          side,
          above: s.crowd.length % 2 === 0,
        },
      ].slice(-20),
      tape: [
        { id: fillSeq++, wallet: "you", side, amount: s.stake, symbol: s.stock.symbol },
        ...s.tape,
      ].slice(0, TAPE_MAX),
      freshFillId: fillSeq - 1,
    });
  },

  buyZec: (n) => {
    const add = Math.max(0, Math.floor(n));
    if (add <= 0) return;
    const zec = get().zec + add;
    writePrefs({ zec });
    set({ zec });
  },
  nextTrade: () => set({ phase: "idle", outcome: null }),
};
});

export { STOCKS, quoteWinPayout };
export type { Stock, WindowSec };
