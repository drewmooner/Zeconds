import { STOCKS } from "./rules";

export const LIVE_UP = "#3dff9a";
export const LIVE_DOWN = "#ff4d5c";

export type LiveFillMsg = {
  wallet: string;
  side: "up" | "down";
  amount: number;
  symbol: string;
};

const AMOUNTS = [5, 10, 15, 25, 50];

function nibble() {
  return Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, "0");
}

function mockFill(): LiveFillMsg {
  const stock = STOCKS[Math.floor(Math.random() * STOCKS.length)];
  return {
    wallet: `0x${nibble()}…${nibble()}`,
    side: Math.random() > 0.48 ? "up" : "down",
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    symbol: stock.symbol,
  };
}

/** Paper fills. Replace the timer with `new WebSocket(url)` and `onmessage` → onFill. */
export function connectLiveTape(onFill: (msg: LiveFillMsg) => void) {
  let timer = 0;
  const pump = () => {
    onFill(mockFill());
    timer = window.setTimeout(pump, 80 + Math.random() * 280);
  };
  timer = window.setTimeout(pump, 40);
  return () => window.clearTimeout(timer);
}
