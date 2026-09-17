export const FEE_BPS = 150;
export const BPS = 10_000;

export const WINDOWS = [5, 15, 30, 45, 60] as const;
export type WindowSec = (typeof WINDOWS)[number];

export const ODDS_BPS: Record<WindowSec, number> = {
  5: 20_000,
  15: 18_000,
  30: 16_500,
  45: 15_000,
  60: 13_500,
};

export function oddsLabel(window: WindowSec): string {
  return (ODDS_BPS[window] / BPS).toFixed(2) + "×";
}

export function quoteWinPayout(stake: number, window: WindowSec): number {
  const stakeNet = (stake * (BPS - FEE_BPS)) / BPS;
  const gross = (stakeNet * ODDS_BPS[window]) / BPS;
  return (gross * (BPS - FEE_BPS)) / BPS;
}

export type Stock = {
  symbol: string;
  name: string;
  seed: number;
};

export const STOCKS: Stock[] = [
  { symbol: "NVDA", name: "NVIDIA", seed: 184.2 },
  { symbol: "TSLA", name: "Tesla", seed: 248.6 },
  { symbol: "HOOD", name: "Robinhood", seed: 28.4 },
  { symbol: "AAPL", name: "Apple", seed: 227.1 },
  { symbol: "AMZN", name: "Amazon", seed: 186.9 },
  { symbol: "META", name: "Meta", seed: 512.3 },
  { symbol: "GOOGL", name: "Alphabet", seed: 165.8 },
  { symbol: "MSFT", name: "Microsoft", seed: 418.7 },
];
