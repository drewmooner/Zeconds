import { t } from "./lib/i18n";
import { useTerminal } from "./store";

/** Set this when the $ZEC token trade URL is ready. Empty = placeholder. */
export const ZEC_TRADE_URL = "";

const glass =
  "border border-white/30 bg-black/40 shadow-[inset_0_-10px_18px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl [background-image:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_42%,rgba(255,255,255,0.18))]";

export function BuyZecButton({ size = "header" }: { size?: "header" | "block" }) {
  const lang = useTerminal((s) => s.lang);
  const ready = Boolean(ZEC_TRADE_URL);
  const className =
    size === "block"
      ? "flex h-12 w-full items-center justify-center rounded-full bg-white text-[13px] font-bold tracking-[0.06em] text-black"
      : `${glass} h-12 rounded-full px-4 text-sm font-semibold text-white`;

  if (ready) {
    return (
      <a className={className} href={ZEC_TRADE_URL} target="_blank" rel="noreferrer">
        {t(lang, "buyZec")}
      </a>
    );
  }

  return (
    <button type="button" className={className} title="Token trade coming soon">
      {t(lang, "buyZec")}
    </button>
  );
}
