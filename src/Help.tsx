import { useState, type ReactNode } from "react";
import { WINDOWS, oddsLabel, quoteWinPayout } from "./lib/rules";
import { useTerminal } from "./store";
import { BuyZecButton } from "./BuyZec";

const TOC = [
  { id: "start", label: "Quick start" },
  { id: "desk", label: "The desk" },
  { id: "odds", label: "Windows & odds" },
  { id: "fees", label: "Fees" },
  { id: "settle", label: "Settlement" },
  { id: "chart", label: "Chart & Live" },
  { id: "wallet", label: "Wallet & $ZEC" },
  { id: "board", label: "Leaderboard" },
  { id: "settings", label: "Settings" },
  { id: "risk", label: "Risk" },
  { id: "faq", label: "FAQ" },
] as const;

const FAQ: { q: string; a: string }[] = [
  {
    q: "What is Zeconds?",
    a: "A seconds-scale house-odds desk. You stake $ZEC, pick a tokenized stock, choose 5 / 15 / 30 / 45 / 60 seconds, and call Up or Down. If you are right when the window closes, you are paid in that stock — not in $ZEC. If you are wrong, the $ZEC stays in the house pool.",
  },
  {
    q: "How do I place a trade?",
    a: "Trade tab → pick a pair (top left) → set stake and window → tap Up or Down. With One tap bet on, that send is instant. The center timer is your window. You cannot cancel or close early.",
  },
  {
    q: "What do I receive if I win?",
    a: "Shares of the stock you traded, sized from the $ZEC payout after both 1.5% fees, divided by the close price. The center toast shows share count and $ZEC worth after fees. Holdings sit in Wallet.",
  },
  {
    q: "What if I lose or it ties?",
    a: "Lose: the stake is spent; no shares. Tie (close equals entry within a tiny epsilon): full $ZEC stake is refunded. There is no partial fill.",
  },
  {
    q: "How are odds set?",
    a: "House odds, not a CLOB. Shorter windows pay more: 5s 2.00×, 15s 1.80×, 30s 1.65×, 45s 1.50×, 60s 1.35×. The multiple is on the post-entry-fee stake, then the exit fee is taken.",
  },
  {
    q: "What are the fees?",
    a: "1.5% when the stake goes in, 1.5% on the winning gross. Both sides of a round are raked. A $100 / 5s win nets about $194.05 in $ZEC terms, paid as stock at the close print.",
  },
  {
    q: "How do I get $ZEC?",
    a: "Buy $ZEC in the header, Wallet, or Help. The button is a placeholder until the token trade link is live. Paper desk still starts you with 10,000 $ZEC to trade.",
  },
  {
    q: "Do I need a wallet?",
    a: "Connect to attach your address to the desk, leaderboard “you” row, and account menu. Paper trading works without it. Robinhood Chain is the target network for the live build.",
  },
  {
    q: "What is the Live tape?",
    a: "The right-hand column on Trade: recent Up/Down fills across every listed stock. Chart $ tags are only the pair you have open. Hide the column in Settings → Show Live tape.",
  },
  {
    q: "How does the leaderboard work?",
    a: "Wallets ranked by $ZEC PnL for a calendar day. Pick Today / Yesterday / last seven days. Your paper rounds write into Today (win = payout after fees, lose = −stake, tie = 0).",
  },
  {
    q: "Can I zoom the chart?",
    a: "Scroll on the chart or use + / −. Zoom in stretches the line and spaces the price scale. Zoom out compresses. Double-click resets. Entry prints as a dashed line plus a strike pill.",
  },
  {
    q: "Is this live money?",
    a: "This build is a paper desk: simulated prices, simulated fills, paper $ZEC. Treat every number as a rehearsal for the house book. Nothing here is investment advice.",
  },
];

function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-white/[0.06] pt-8 pb-2">
      <p className="text-[10px] font-bold tracking-[0.22em] text-white/40 uppercase">{kicker}</p>
      <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-white">{title}</h2>
      <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-white/65">{children}</div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 py-3.5 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-[14px] font-semibold text-white">{q}</span>
        <span className={`shrink-0 text-white/35 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <p className="pb-4 text-[13px] leading-relaxed text-white/55">{a}</p>}
    </div>
  );
}

export function HelpPage() {
  const setTab = useTerminal((s) => s.setTab);
  const sample = quoteWinPayout(100, 5);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="text-[10px] font-bold tracking-[0.22em] text-white/55 uppercase">Help / Docs</p>
        <h1 className="mt-1 max-w-2xl text-[28px] font-semibold tracking-tight text-white">
          Seconds-scale house odds. Stake $ZEC. Get paid in stock.
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/50">
          Everything on the desk, in one place — so you don’t miss a fee, a window, or how a win actually settles.
          Paper desk now. Robinhood Chain next.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="w-[min(100%,220px)]">
            <BuyZecButton size="block" />
          </div>
          <button
            type="button"
            className="h-12 rounded-full border border-white/15 px-5 text-[13px] font-semibold text-white/80 hover:bg-white/10"
            onClick={() => setTab("trade")}
          >
            Open Trade
          </button>
        </div>

        <nav className="mt-6 flex flex-wrap gap-1.5">
          {TOC.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-full border border-white/12 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/50 hover:border-white/30 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Section id="start" kicker="01" title="Quick start">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <span className="text-white">Fund.</span> Buy $ZEC from the header, Wallet, or the button above when the
              trade link is live. Stake is always $ZEC. Paper desk starts with 10,000.
            </li>
            <li>
              <span className="text-white">Pick a market.</span> NVDA, TSLA, HOOD, AAPL, AMZN, META, GOOGL, MSFT — from
              the pair chip or Markets.
            </li>
            <li>
              <span className="text-white">Set size and time.</span> Stake on the HUD. Window 5–60s. Odds print on the
              Up / Down buttons.
            </li>
            <li>
              <span className="text-white">Call the next print.</span> Up if you think the last price finishes above
              entry. Down if below. Timer sits top-center.
            </li>
            <li>
              <span className="text-white">Read the fill.</span> Win = shares + $ZEC worth after fees. Lose = stake gone.
              Tie = $ZEC back.
            </li>
          </ol>
        </Section>

        <Section id="desk" kicker="02" title="How the desk is laid out">
          <p>
            Left rail is Trade, Markets, Leaderboard, Settings, Help. Pair picker and Buy $ZEC live in the
            top bar; the profile icon holds $ZEC, holdings, and trade history. The chart is the book. HUD under the chart is stake, Down, Up, window. Live tape (optional) is
            the right column — fills from every stock, not just the pair on screen.
          </p>
          <p>
            Chart $ tags are crowd size on the open pair. Green is Up, red is Down. Scroll or +/− zooms price and time
            together; double-click fits.
          </p>
        </Section>

        <Section id="odds" kicker="03" title="Windows and house odds">
          <p>
            This is not a peer book. The house posts a fixed multiple per window. Shorter clocks pay more because the
            move is noisier and the edge is tighter.
          </p>
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[10px] font-bold tracking-[0.16em] text-white/40 uppercase">
                <tr className="border-b border-white/[0.06]">
                  <th className="px-4 py-2.5 font-bold">Window</th>
                  <th className="px-4 py-2.5 font-bold">Odds</th>
                  <th className="px-4 py-2.5 font-bold">$100 stake → win (after fees)</th>
                </tr>
              </thead>
              <tbody className="tabular-nums text-white">
                {WINDOWS.map((w) => (
                  <tr key={w} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-4 py-2.5 text-white/70">{w}s</td>
                    <td className="px-4 py-2.5">{oddsLabel(w)}</td>
                    <td className="px-4 py-2.5">
                      {quoteWinPayout(100, w).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      $ZEC
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="fees" kicker="04" title="Fee schedule">
          <p>
            <span className="text-white">1.5% in</span> on every stake, then{" "}
            <span className="text-white">1.5% out</span> on winning gross. Two rakes, always. Tie refunds the full
            stake — no fee kept on an even close.
          </p>
          <p>
            Worked $100 at 5s (2.00×): 100 × 0.985 = 98.50 after entry fee → × 2.00 = 197.00 gross → × 0.985 ≈{" "}
            <span className="text-white">{sample.toFixed(2)} $ZEC</span> net, converted to shares at the close price.
          </p>
        </Section>

        <Section id="settle" kicker="05" title="How a round settles">
          <p>
            Entry is the last print when you tap. Close is the last print when the timer hits zero. Win if your side
            matches that move. Shares = net $ZEC payout ÷ close price. That bag is what you own — the toast lists both
            units and $ZEC worth after fees.
          </p>
          <p>You cannot add, reverse, or cash out mid-window. One stake, one clock, one print.</p>
        </Section>

        <Section id="chart" kicker="06" title="Chart, entry, Live">
          <p>
            Left scale is five-decimal price, dense enough to read the exact level. While live, a dashed strike and a
            pill mark the price you entered. The right pill is last. Live tape is all-stock flow; Settings can hide it.
          </p>
        </Section>

        <Section id="wallet" kicker="07" title="Wallet and Buy $ZEC">
          <p>
            $ZEC is the only stake asset. Wins never return $ZEC — they return the stock. Wallet lists $ZEC plus each
            holding and an approximate $ZEC mark. Buy $ZEC sits in the header, Wallet, and this page; it will open the
            token market once the link is in.
          </p>
          <div className="max-w-xs">
            <BuyZecButton size="block" />
          </div>
        </Section>

        <Section id="board" kicker="08" title="Leaderboard">
          <p>
            Rank by wallet PnL, split by day. Your paper score writes as you settle. House rows are the book’s sample
            tape so the board never looks empty.
          </p>
        </Section>

        <Section id="settings" kicker="09" title="Settings that change the desk">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="text-white">One tap bet</span> — on = Up/Down sends immediately. Off = confirm first.
            </li>
            <li>
              <span className="text-white">Show Live tape</span> — right-hand fills column on Trade.
            </li>
            <li>
              <span className="text-white">Sounds</span> — cash kaching on place and settle.
            </li>
            <li>
              <span className="text-white">Default window / stake</span> — HUD starts here each session.
            </li>
            <li>
              <span className="text-white">Language / theme</span> — desk copy and light/dark invert.
            </li>
          </ul>
        </Section>

        <Section id="risk" kicker="10" title="Risk and paper">
          <p>
            Short-dated directional calls can lose 100% of the stake in seconds. House odds already include the rake.
            This UI is a paper desk: prices and fills are simulated. Do not size like production until contracts are
            live on Robinhood Chain. Not financial advice. Not an offer to buy or sell any security.
          </p>
        </Section>

        <section id="faq" className="scroll-mt-6 border-t border-white/[0.06] pt-8 pb-10">
          <p className="text-[10px] font-bold tracking-[0.22em] text-white/40 uppercase">FAQ</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-white">Don’t miss this</h2>
          <div className="mt-4">
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
