import { useTerminal } from "./store";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`relative h-6 w-10 shrink-0 rounded-full ${on ? "bg-white" : "bg-white/15"}`}
      onClick={onClick}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-black"
        style={{ left: on ? 18 : 2 }}
      />
    </button>
  );
}

export function Intro({ onDone }: { onDone: () => void }) {
  const confirmPlace = useTerminal((s) => s.confirmPlace);
  const setConfirmPlace = useTerminal((s) => s.setConfirmPlace);
  const oneTap = !confirmPlace;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-6 py-10">
      <div
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 48%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.08) 72%, transparent 100%)",
        }}
      />
      <div className="relative w-full max-w-[20rem] text-center">
        <p className="text-[9px] font-bold tracking-[0.22em] text-white/40 uppercase">Zeconds</p>
        <h1 className="mt-1 text-[17px] font-semibold tracking-tight text-white">How this desk works</h1>
        <p className="mt-2 text-[12px] leading-relaxed text-white/55">
          ZEC is the protocol chip — nothing is staked. Pick a stock, a seconds window, then Up or Down. Right at
          expiry: paid in that stock after fees. Wrong: you lose.
        </p>
        <ol className="mx-auto mt-3 w-fit list-decimal space-y-1 pl-4 text-left text-[12px] leading-relaxed text-white/60">
          <li>Hold ZEC.</li>
          <li>Pick the stock.</li>
          <li>Pick 5 / 15 / 30 / 45 / 60s.</li>
          <li>Tap Up or Down.</li>
        </ol>

        <div className="mt-5 flex items-start justify-between gap-3 text-left">
          <span>
            <span className="block text-[12px] font-semibold text-white">One tap bet</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-white/40">
              On: send immediately. Off: confirm first. Starts off.
            </span>
          </span>
          <Toggle on={oneTap} onClick={() => setConfirmPlace(!confirmPlace)} />
        </div>

        <button
          type="button"
          className="mt-5 inline-flex h-9 items-center justify-center rounded-full bg-white px-8 text-[12px] font-bold tracking-[0.04em] text-black"
          onClick={onDone}
        >
          Enter desk
        </button>
      </div>
    </div>
  );
}
