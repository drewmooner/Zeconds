import { useEffect, useRef, useState } from "react";

const LINES = [
  "Up or down. That's the whole trade.",
  "Hit, and you get paid in the stock.",
  "Call it in seconds, not days.",
];

const RINGS = [
  ["tl", "tr", "br"] as const,
  ["bl", "ml", "br-sm"] as const,
];

const LOGOS = [
  { id: "nvda", src: "/logos/nvda.png", alt: "NVDA", ring: 0, seat: 0, ink: false },
  { id: "hood", src: "/logos/hood.png", alt: "HOOD", ring: 0, seat: 1, ink: false },
  { id: "meta", src: "/logos/meta.png", alt: "META", ring: 0, seat: 2, ink: false },
  { id: "tsla", src: "/logos/tsla.png", alt: "TSLA", ring: 1, seat: 0, ink: false },
  { id: "zec", src: "/logos/zec.png", alt: "ZEC", ring: 1, seat: 1, ink: false },
  { id: "aapl", src: "/logos/aapl.png", alt: "AAPL", ring: 1, seat: 2, ink: false },
];

const SWAYS = ["sway-l", "sway-r", "sway-lr"] as const;

function rollSway() {
  const map: Record<string, (typeof SWAYS)[number]> = {};
  for (const logo of LOGOS) {
    map[logo.id] = SWAYS[Math.floor(Math.random() * SWAYS.length)];
  }
  return map;
}

export function Splash({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [line, setLine] = useState(0);
  const [gone, setGone] = useState(false);
  const [step, setStep] = useState(0);
  const [hit, setHit] = useState(true);
  const [sway, setSway] = useState<Record<string, string>>(rollSway);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const start = performance.now();
    const dur = 5000;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setPct(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        setGone(true);
        window.setTimeout(() => doneRef.current(), 420);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLine((n) => (n + 1) % LINES.length);
    }, 650);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const pending: number[] = [];
    const kick = (fresh: boolean) => {
      if (fresh) {
        setSway(rollSway());
        setHit(true);
      }
      pending.push(
        window.setTimeout(() => setStep((n) => n + 1), 190),
        window.setTimeout(() => setHit(false), 420),
      );
    };
    kick(false);
    const id = window.setInterval(() => kick(true), 780);
    return () => {
      window.clearInterval(id);
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <div className={`splash${gone ? " splash-out" : ""}${hit ? " lit" : ""}`}>
      <div className="splash-fx" aria-hidden>
        <span className="fx-dim" />
        <span className="fx-shine" />
      </div>
      {LOGOS.map((logo) => {
        const spots = RINGS[logo.ring];
        const pos = spots[(logo.seat + step) % spots.length];
        return (
          <div
            key={logo.id}
            className={`glitch-token pos-${pos}${logo.ink ? " ink" : ""}${hit ? ` hit ${sway[logo.id] ?? ""}` : ""}`}
          >
            <div className="glitch-inner">
              <img className="glitch-img base" src={logo.src} alt={logo.alt} />
              <img className="glitch-img r" src={logo.src} alt="" />
              <img className="glitch-img g" src={logo.src} alt="" />
            </div>
          </div>
        );
      })}

      <div className="splash-core">
        <div className="splash-logo">
          <span>Zeconds</span>
        </div>
        <p className="splash-sub">
          Binary Stock Options on Robinhood
        </p>
        <div className="splash-bar">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="splash-say" key={line}>
          {LINES[line]}
        </p>
      </div>
    </div>
  );
}
