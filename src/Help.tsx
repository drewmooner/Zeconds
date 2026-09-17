import { useState, type ReactNode } from "react";
import { WINDOWS, oddsLabel, quoteWinPayout } from "./lib/rules";
import { useTerminal } from "./store";
import { BuyZecButton } from "./BuyZec";

const TOC = [
  { id: "start", label: "Quick start" },
  { id: "instant", label: "Instant bets" },
  { id: "chip", label: "ZEC chip" },
  { id: "desk", label: "The desk" },
  { id: "odds", label: "Windows & odds" },
  { id: "pool", label: "Rewards pool" },
  { id: "settle", label: "If you win / lose" },
  { id: "chart", label: "Chart & Live" },
  { id: "board", label: "Leaderboard" },
  { id: "settings", label: "Settings" },
  { id: "risk", label: "Risk" },
  { id: "faq", label: "FAQ" },
] as const;

const FAQ: { q: string; a: string }[] = [
  {
    q: "Do I have to stake ZEC?",
    a: "No. There is no staking, lockup, or deposit vault. ZEC is the protocol chip — the token you spend to place a bet. You need ZEC in your wallet to tap Up or Down. That is not staking.",
  },
  {
    q: "What is Zeconds?",
    a: "A seconds-scale desk on the Zeconds protocol. Pick a stock, pick a window (5 / 15 / 30 / 45 / 60s), pick Up or Down. If you’re right at expiry, you’re paid in that stock after fees. If you’re wrong, you lose.",
  },
  {
    q: "How do I bet?",
    a: "Trade → pick the stock → set size (ZEC) and window → tap Up or Down. One tap starts off, so you confirm first. Turn One tap on if you want that tap to be the bet. The timer is the window. You cannot cancel mid-round.",
  },
  {
    q: "How do I bet instantly?",
    a: "Turn Settings → One tap bet on. Set a default window and size so the HUD is already loaded. Then it is: pick stock, tap Up or Down. One tap starts off. Off = a confirm before the round starts.",
  },
  {
    q: "What do I get if I win?",
    a: "The stock you picked — not ZEC. Size is the win payout after protocol fees, converted at the expiry price. The toast shows shares and the ZEC-equivalent after fees. Holdings land in the profile menu.",
  },
  {
    q: "What if I lose or it ties?",
    a: "You lose. No shares. Tie (expiry equals entry): ZEC comes back.",
  },
  {
    q: "Where does the rewards pool come from?",
    a: "Tax on ZEC token trades and protocol fees on rounds. Winners are paid from that pool, in the stock they called.",
  },
  {
    q: "How are odds set?",
    a: "Fixed protocol odds per window, not an order book. Shorter windows pay more: 5s 2.00×, 15s 1.80×, 30s 1.65×, 45s 1.50×, 60s 1.35×. Fees come out of the round; the toast is always after fees.",
  },
  {
    q: "How do I get ZEC?",
    a: "Buy $ZEC in the header, Wallet, or Help. That button will open the ZEC token market when the link is live. You cannot bet without ZEC.",
  },
  {
    q: "Do I need a wallet?",
    a: "Connect to attach your address, profile, and leaderboard row. Robinhood Chain is the network. You still need ZEC to bet.",
  },
  {
    q: "What is the Live tape?",
    a: "Right column on Trade (desktop): recent Up/Down fills across every listed stock. Chart $ tags are only the pair you have open. Hide it in Settings → Show Live tape.",
  },
  {
    q: "How does the leaderboard work?",
    a: "Wallets ranked by ZEC PnL for a calendar day. Today / Yesterday / last seven days. Win = payout after fees, lose = − that round’s ZEC, tie = 0.",
  },
  {
    q: "Can I zoom the chart?",
    a: "Scroll or use + / −. Zoom in stretches the line and the price scale. Zoom out compresses. Double-click resets. IN is your entry; EXP is expiry.",
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

function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 py-3.5 text-left"
        onClick={onToggle}
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
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="text-[10px] font-bold tracking-[0.22em] text-white/55 uppercase">Help / Docs</p>
        <h1 className="mt-1 max-w-2xl text-[22px] font-semibold tracking-tight text-white md:text-[28px]">
          Pick a stock. Pick seconds. Pick a side. Win in that stock.
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/50">
          ZEC is the Zeconds chip — not a stake lock. You need ZEC to bet. You never lock it in a vault. Win, and you
          get the stock you called, after fees. Miss, and you lose.
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
              <span className="text-white">Hold ZEC.</span> Buy the protocol chip when the trade link is live. No ZEC,
              no bet. Nothing is staked or locked.
            </li>
            <li>
              <span className="text-white">Pick a stock.</span> NVDA, TSLA, HOOD, AAPL, AMZN, META, GOOGL, MSFT — pair
              chip or Markets.
            </li>
            <li>
              <span className="text-white">Pick the window.</span> 5, 15, 30, 45, or 60 seconds. Odds sit on Up / Down.
            </li>
            <li>
              <span className="text-white">Pick direction and size.</span> Size is ZEC you put on this round. Up if you
              think expiry prints above entry. Down if below.
            </li>
            <li>
              <span className="text-white">One tap.</span> With One tap bet on, Up or Down is the bet. Win = that stock
              after fees. Miss = you lose.
            </li>
          </ol>
        </Section>

        <Section id="instant" kicker="02" title="How bets stay instant">
          <p>
            Instant means: stock already chosen, window already chosen, size already in the bar, One tap bet on — then
            a single Up or Down send. One tap starts off. Turn it on at the intro screen or in Settings if you want
            that.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="text-white">One tap bet</span> starts off. On = instant send. Off = confirm first.
            </li>
            <li>
              <span className="text-white">Default window and size</span> in Settings so you do not retype every round.
            </li>
            <li>
              <span className="text-white">Stay on Trade</span> after a settle. The next tap is the next round.
            </li>
          </ul>
        </Section>

        <Section id="chip" kicker="03" title="ZEC is the chip, not a stake">
          <p>
            ZEC is the Zeconds protocol token. You spend it to play. You do not stake it, delegate it, or lock it for
            yield. Think chips on a table: you need them to sit down; they are not a staking position.
          </p>
          <p>Buy $ZEC when you need more chips. Wins do not pay ZEC back — they pay the stock you picked.</p>
          <div className="max-w-xs">
            <BuyZecButton size="block" />
          </div>
        </Section>

        <Section id="desk" kicker="04" title="How the desk is laid out">
          <p>
            Rail: Trade, Markets, Leaderboard, Settings, Help (bottom of the phone, left on desktop). Pair picker and
            Buy $ZEC sit in the top bar. Profile (when connected) holds ZEC, stock holdings, and history. Chart is the
            book. Bar under the chart is size, Down, Up, window.
          </p>
          <p>
            Live tape (desktop) is all-stock flow. Chart $ tags are the open pair. IN / EXP mark your entry and expiry.
          </p>
        </Section>

        <Section id="odds" kicker="05" title="Windows and odds">
          <p>Shorter clocks pay more. The table is 100 ZEC on the round, shown as stock-value after fees.</p>
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[10px] font-bold tracking-[0.16em] text-white/40 uppercase">
                <tr className="border-b border-white/[0.06]">
                  <th className="px-4 py-2.5 font-bold">Window</th>
                  <th className="px-4 py-2.5 font-bold">Odds</th>
                  <th className="px-4 py-2.5 font-bold">100 ZEC → win (after fees)</th>
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
                      ZEC
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="pool" kicker="06" title="Rewards pool">
          <p>Winners are paid from the pool, in the stock they called. The pool is filled by:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="text-white">ZEC token trade tax</span> — tax on buying/selling ZEC goes to rewards.
            </li>
            <li>
              <span className="text-white">Protocol fee</span> — 1.5% in on the round, 1.5% out on a win.
            </li>
          </ul>
          <p>
            Worked 100 ZEC at 5s (2.00×): 100 × 0.985 = 98.50 after the in-fee → × 2.00 = 197.00 → × 0.985 ≈{" "}
            <span className="text-white">{sample.toFixed(2)} ZEC</span> equivalent, paid as shares at expiry.
          </p>
        </Section>

        <Section id="settle" kicker="07" title="If you win or lose">
          <p>
            Entry is the last print when you tap. Expiry is the last print when the timer hits zero. Right side at
            expiry → you win that stock after fees. Wrong side → you lose. Tie → ZEC back.
          </p>
          <p>No add, reverse, or cash-out mid-window. One size, one clock, one print.</p>
        </Section>

        <Section id="chart" kicker="08" title="Chart, entry, Live">
          <p>
            Dense five-decimal scale on the left. Live round: dashed entry and an IN tag. After expiry: IN and EXP so
            you can see both prints. Live tape is optional on desktop.
          </p>
        </Section>

        <Section id="board" kicker="09" title="Leaderboard">
          <p>Rank by wallet PnL, by day. Your settled rounds write into Today.</p>
        </Section>

        <Section id="settings" kicker="10" title="Settings that change the desk">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="text-white">One tap bet</span> — off until you turn it on. On = instant send.
            </li>
            <li>
              <span className="text-white">Show Live tape</span> — fills column on Trade (desktop).
            </li>
            <li>
              <span className="text-white">Sounds</span> — kaching on place and settle.
            </li>
            <li>
              <span className="text-white">Default window / size</span> — so the next tap is only direction.
            </li>
            <li>
              <span className="text-white">Language / theme</span> — copy and light/dark.
            </li>
          </ul>
        </Section>

        <Section id="risk" kicker="11" title="Risk">
          <p>
            A wrong call can lose 100% of the ZEC on that round in seconds. Odds already bake in protocol fees. This
            desk is a rehearsal until contracts are live on Robinhood Chain. Not financial advice. Not an offer to buy
            or sell any security.
          </p>
        </Section>

        <section id="faq" className="scroll-mt-6 border-t border-white/[0.06] pt-8 pb-10">
          <p className="text-[10px] font-bold tracking-[0.22em] text-white/40 uppercase">FAQ</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-white">Don’t miss this</h2>
          <div className="mt-4">
            {FAQ.map((item) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                open={openFaq === item.q}
                onToggle={() => setOpenFaq((cur) => (cur === item.q ? null : item.q))}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
