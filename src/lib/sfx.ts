const CASH = "/music/dragon-studio-cash-register-kaching-376867.mp3";

let primed: HTMLAudioElement | null = null;

function clip() {
  const a = new Audio(CASH);
  a.preload = "auto";
  return a;
}

export function unlockSfx() {
  if (!primed) {
    primed = clip();
    primed.load();
  }
}

function playCash(rate = 1) {
  unlockSfx();
  const a = clip();
  a.volume = 1;
  a.playbackRate = rate;
  void a.play().catch(() => {
    /* autoplay blocked */
  });
}

export function chimePlace(side: "up" | "down") {
  playCash(side === "up" ? 1 : 0.92);
}

export function chimeWin() {
  playCash(1.06);
}

export function chimeLose() {
  playCash(0.82);
}

export function chimeTie() {
  playCash(0.96);
}

export function chimePreview() {
  playCash(1);
}
