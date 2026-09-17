import { useState } from "react";
import { WINDOWS } from "./lib/rules";
import { LANGS, t, type Lang, type Theme } from "./lib/i18n";
import { useTerminal } from "./store";
import { chimePreview } from "./lib/sfx";

function Row({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 py-3.5 text-left disabled:opacity-100"
      onClick={onClick}
      disabled={!onClick}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-white">{label}</span>
        {value && <span className="mt-0.5 block text-[12px] text-white/40">{value}</span>}
      </span>
      {onClick && <span className="text-white/30">›</span>}
    </button>
  );
}

function LangFlag({ cc, label }: { cc: string; label: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
      alt=""
      title={label}
      className="h-4 w-[22px] shrink-0 rounded-[3px] object-cover"
    />
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`relative h-6 w-11 shrink-0 rounded-full ${on ? "bg-white" : "bg-white/15"}`}
      onClick={onClick}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-[left] ${on ? "left-5.5" : "left-0.5"}`} style={{ left: on ? 22 : 2 }} />
    </button>
  );
}

export function SettingsPage() {
  const lang = useTerminal((s) => s.lang);
  const theme = useTerminal((s) => s.theme);
  const sounds = useTerminal((s) => s.sounds);
  const confirmPlace = useTerminal((s) => s.confirmPlace);
  const showLive = useTerminal((s) => s.showLive);
  const defaultWindow = useTerminal((s) => s.defaultWindow);
  const defaultStake = useTerminal((s) => s.defaultStake);
  const setLang = useTerminal((s) => s.setLang);
  const setTheme = useTerminal((s) => s.setTheme);
  const setSounds = useTerminal((s) => s.setSounds);
  const setConfirmPlace = useTerminal((s) => s.setConfirmPlace);
  const setShowLive = useTerminal((s) => s.setShowLive);
  const setDefaultWindow = useTerminal((s) => s.setDefaultWindow);
  const setDefaultStake = useTerminal((s) => s.setDefaultStake);
  const [open, setOpen] = useState<"lang" | "window" | "stake" | null>(null);

  const langMeta = LANGS.find((l) => l.id === lang) ?? LANGS[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-5">
      <div className="shrink-0">
        <p className="text-[10px] font-bold tracking-[0.22em] text-white/55 uppercase">{t(lang, "settings")}</p>
        <p className="mt-1 text-sm text-white/45">{t(lang, "desk")}</p>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">{t(lang, "general")}</p>
        <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          <button
            type="button"
            className="flex w-full items-center gap-3 py-3.5 text-left"
            onClick={() => setOpen(open === "lang" ? null : "lang")}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-white">{t(lang, "language")}</span>
              <span className="mt-0.5 flex items-center gap-2 text-[12px] text-white/40">
                <LangFlag cc={langMeta.cc} label={langMeta.label} />
                {langMeta.label}
              </span>
            </span>
            <span className="text-white/30">›</span>
          </button>
          {open === "lang" && (
            <div className="grid gap-1 py-2">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] ${
                    lang === l.id ? "bg-white text-black" : "text-white/70 hover:bg-white/8"
                  }`}
                  onClick={() => {
                    setLang(l.id);
                    setOpen(null);
                  }}
                >
                  <LangFlag cc={l.cc} label={l.label} />
                  {l.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between py-3.5">
            <span>
              <span className="block text-[14px] font-semibold text-white">{t(lang, "theme")}</span>
              <span className="mt-0.5 block text-[12px] text-white/40">
                {theme === "light" ? t(lang, "light") : t(lang, "dark")}
              </span>
            </span>
            <Toggle on={theme === "light"} onClick={() => setTheme(theme === "light" ? "dark" : "light")} />
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-[14px] font-semibold text-white">{t(lang, "sounds")}</span>
            <Toggle
              on={sounds}
              onClick={() => {
                const next = !sounds;
                setSounds(next);
                if (next) chimePreview();
              }}
            />
          </div>
        </div>

        <p className="mt-8 mb-1 text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">{t(lang, "desk")}</p>
        <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          <div className="flex items-center justify-between py-3.5">
            <span className="text-[14px] font-semibold text-white">{t(lang, "confirm")}</span>
            <Toggle on={!confirmPlace} onClick={() => setConfirmPlace(!confirmPlace)} />
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span>
              <span className="block text-[14px] font-semibold text-white">{t(lang, "liveFeed")}</span>
              <span className="mt-0.5 block text-[12px] text-white/40">{t(lang, "liveFeedHint")}</span>
            </span>
            <Toggle on={showLive} onClick={() => setShowLive(!showLive)} />
          </div>
          <Row
            label={t(lang, "defaultWindow")}
            value={`${defaultWindow}s`}
            onClick={() => setOpen(open === "window" ? null : "window")}
          />
          {open === "window" && (
            <div className="flex flex-wrap gap-2 py-3">
              {WINDOWS.map((w) => (
                <button
                  key={w}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                    defaultWindow === w ? "bg-white text-black" : "border border-white/15 text-white/55"
                  }`}
                  onClick={() => {
                    setDefaultWindow(w);
                    setOpen(null);
                  }}
                >
                  {w}s
                </button>
              ))}
            </div>
          )}
          <Row
            label={t(lang, "defaultStake")}
            value={`$ZEC ${defaultStake}`}
            onClick={() => setOpen(open === "stake" ? null : "stake")}
          />
          {open === "stake" && (
            <div className="flex flex-wrap gap-2 py-3">
              {[25, 50, 100, 250, 500].map((n) => (
                <button
                  key={n}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                    defaultStake === n ? "bg-white text-black" : "border border-white/15 text-white/55"
                  }`}
                  onClick={() => {
                    setDefaultStake(n);
                    setOpen(null);
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-[11px] tracking-wide text-white/30">{t(lang, "version")} · 0.0.1</p>
      </div>
    </div>
  );
}

export type { Lang, Theme };
