import { useEffect, useRef } from "react";
import { useTerminal } from "./store";
import { LIVE_DOWN, LIVE_UP } from "./lib/liveFeed";

export type TradeCandle = {
  i: number;
  openI: number;
  open: number;
  close: number;
  high: number;
  low: number;
  tone: "win" | "lose" | "tie";
};

export type CrowdBet = {
  i: number;
  price: number;
  amount: number;
  side: "up" | "down";
  above: boolean;
};

type Props = {
  series: number[];
  strike: number | null;
  liveOpenI: number | null;
  candles?: TradeCandle[];
  crowd?: CrowdBet[];
};

type View = { xZoom: number; yZoom: number; mid: number | null };

export function LiveChart({ series, strike, liveOpenI, candles = [], crowd = [] }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const theme = useTerminal((s) => s.theme);
  const view = useRef<View>({ xZoom: 1, yZoom: 1, mid: null });
  const zoomRef = useRef<(factor: number, clientY?: number) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx || series.length < 2) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const compact = w < 720;
      const padL = compact ? 56 : 92;
      const padR = compact ? 12 : 36;
      const padT = compact ? 12 : 18;
      const padB = compact ? 12 : 18;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const { xZoom, yZoom } = view.current;
      const visN = Math.max(48, Math.min(series.length, Math.round(180 / xZoom)));
      const start = Math.max(0, series.length - visN);
      const vis = series.slice(start);
      const extras = candles.flatMap((c) => [c.close, c.open]);
      if (strike != null) extras.push(strike);
      const min = Math.min(...vis, ...extras);
      const max = Math.max(...vis, ...extras);
      const raw = Math.max(max - min, min * 0.0008, 0.04);
      const fitLo = min - raw * 0.14;
      const fitHi = max + raw * 0.14;
      const fitMid = (fitLo + fitHi) / 2;
      const span = (fitHi - fitLo) / yZoom;
      const last = vis[vis.length - 1];
      const mid = yZoom === 1 ? fitMid : (view.current.mid ?? fitMid);
      view.current.mid = mid;
      const lo = mid - span / 2;
      const hi = mid + span / 2;
      const x = (i: number) => padL + ((i - start) / Math.max(1, vis.length - 1)) * plotW;
      const y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * plotH;
      const lastX = x(series.length - 1);
      const lastY = y(last);

      const light = theme === "light";
      const bg = light ? "#f4f6f8" : "#000";
      const grid = light ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)";
      const ink = light ? "rgba(15,23,42,0.82)" : "rgba(255,255,255,0.88)";
      const line = light ? "#2563eb" : "#f2f2f2";
      const dash = light ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.35)";
      const strikeInk = light ? "rgba(37,99,235,0.55)" : "rgba(255,255,255,0.72)";

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      const rows = Math.max(compact ? 10 : 16, Math.round(plotH / (compact ? 22 : 18)));
      ctx.font = `${compact ? 9 : 11}px "IBM Plex Sans", Inter, sans-serif`;
      ctx.textAlign = "right";
      for (let i = 0; i <= rows; i++) {
        const gy = padT + (plotH * i) / rows;
        ctx.beginPath();
        ctx.moveTo(padL, gy);
        ctx.lineTo(w - padR, gy);
        ctx.stroke();
        const pv = hi - ((hi - lo) * i) / rows;
        ctx.fillStyle = ink;
        ctx.fillText(pv.toFixed(compact ? 4 : 5), padL - 6, gy + 3);
      }

      if (strike != null) {
        const sy = y(strike);
        ctx.setLineDash([7, 5]);
        ctx.strokeStyle = strikeInk;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(padL, sy);
        ctx.lineTo(w - padR, sy);
        ctx.stroke();
        ctx.setLineDash([]);
        if (liveOpenI != null && liveOpenI >= start) {
          const ox = x(Math.min(liveOpenI, series.length - 1));
          ctx.fillStyle = "rgba(37, 99, 235, 0.12)";
          ctx.fillRect(ox, Math.min(sy, lastY), Math.max(8, lastX - ox), Math.max(2, Math.abs(lastY - sy)));
          ctx.strokeStyle = strikeInk;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ox, padT);
          ctx.lineTo(ox, h - padB);
          ctx.stroke();
          ctx.fillStyle = line;
          ctx.beginPath();
          ctx.arc(ox, sy, 4, 0, Math.PI * 2);
          ctx.fill();
          priceTag(ctx, ox + 8, sy, `IN ${strike.toFixed(5)}`, light ? "#2563eb" : "#fff", light ? "#fff" : "#000");
        }
      }

      ctx.beginPath();
      vis.forEach((v, j) => {
        const px = x(start + j);
        const py = y(v);
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = line;
      ctx.lineWidth = 2.15;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      candles.forEach((c) => {
        if (c.i < start && (c.openI ?? c.i) < start) return;
        drawRoundPosition(ctx, x, y, c, series.length, start, light);
      });
      crowd.forEach((b) => {
        if (b.i < start) return;
        drawCrowd(ctx, x, y, b, series.length);
      });

      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = dash;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(w - padR, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = line;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4.2, 0, Math.PI * 2);
      ctx.fill();

      const tag = last.toFixed(5);
      ctx.font = '600 12px "IBM Plex Sans", Inter, sans-serif';
      const tw = ctx.measureText(tag).width + 18;
      ctx.fillStyle = light ? "#2563eb" : "#fff";
      roundFill(ctx, lastX - tw - 10, lastY - 12, tw, 22, 11);
      ctx.fillStyle = light ? "#fff" : "#000";
      ctx.textAlign = "center";
      ctx.fillText(tag, lastX - tw / 2 - 10, lastY + 4);
    };

    const zoomAt = (factor: number, clientY?: number) => {
      const v = view.current;
      const padT = 18;
      const plotH = wrap.clientHeight - padT - 18;
      const visN = Math.max(48, Math.min(series.length, Math.round(180 / v.xZoom)));
      const start = Math.max(0, series.length - visN);
      const vis = series.slice(start);
      const extras = candles.flatMap((c) => [c.close, c.open]);
      if (strike != null) extras.push(strike);
      const min = Math.min(...vis, ...extras);
      const max = Math.max(...vis, ...extras);
      const raw = Math.max(max - min, min * 0.0008, 0.04);
      const fitLo = min - raw * 0.14;
      const fitHi = max + raw * 0.14;
      const oldSpan = (fitHi - fitLo) / v.yZoom;
      const oldMid = v.yZoom === 1 ? (fitLo + fitHi) / 2 : (v.mid ?? (fitLo + fitHi) / 2);
      const oldLo = oldMid - oldSpan / 2;
      let t = 0.5;
      if (clientY != null) {
        t = (clientY - wrap.getBoundingClientRect().top - padT) / plotH;
        t = Math.min(1, Math.max(0, t));
      }
      const price = oldLo + (1 - t) * oldSpan;
      v.xZoom = Math.min(6, Math.max(0.4, v.xZoom * factor));
      v.yZoom = Math.min(10, Math.max(0.4, v.yZoom * factor));
      if (Math.abs(v.yZoom - 1) < 0.03 && Math.abs(v.xZoom - 1) < 0.03 && factor < 1) {
        v.xZoom = 1;
        v.yZoom = 1;
        v.mid = null;
      } else {
        const newSpan = (fitHi - fitLo) / v.yZoom;
        v.mid = price - (0.5 - t) * newSpan;
      }
      draw();
    };

    zoomRef.current = zoomAt;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientY);
    };
    const onDbl = () => {
      view.current = { xZoom: 1, yZoom: 1, mid: null };
      draw();
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    wrap.addEventListener("wheel", onWheel, { passive: false });
    wrap.addEventListener("dblclick", onDbl);
    return () => {
      ro.disconnect();
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("dblclick", onDbl);
    };
  }, [series, strike, liveOpenI, candles, crowd, theme]);

  return (
    <div className="relative h-full w-full min-h-0" ref={wrapRef}>
      <canvas className="block h-full w-full" ref={canvasRef} />
      <div className="absolute right-2 bottom-3 z-10 flex flex-col overflow-hidden rounded-full border border-white/15 bg-black/55 max-md:bottom-2 max-md:right-1">
        <button
          type="button"
          className="h-10 w-10 text-lg leading-none text-white/80 hover:bg-white/10 hover:text-white md:h-8 md:w-8"
          onClick={() => zoomRef.current(1.18)}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="h-10 w-10 text-lg leading-none text-white/80 hover:bg-white/10 hover:text-white md:h-8 md:w-8"
          onClick={() => zoomRef.current(1 / 1.18)}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
    </div>
  );
}

function drawCrowd(
  ctx: CanvasRenderingContext2D,
  x: (i: number) => number,
  y: (v: number) => number,
  b: CrowdBet,
  len: number,
) {
  if (b.i < 0 || b.i >= len) return;
  const px = x(b.i);
  const py = y(b.price);
  const color = b.side === "up" ? LIVE_UP : LIVE_DOWN;
  const label = `$${b.amount}`;
  const above = b.above;
  ctx.font = '600 9px "IBM Plex Sans", Inter, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = above ? "bottom" : "top";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = "rgba(0,0,0,0.9)";
  const ty = above ? py - 3 : py + 3;
  ctx.strokeText(label, px, ty);
  ctx.fillStyle = color;
  ctx.fillText(label, px, ty);
  ctx.textBaseline = "alphabetic";
}

function drawRoundPosition(
  ctx: CanvasRenderingContext2D,
  x: (i: number) => number,
  y: (v: number) => number,
  c: TradeCandle,
  len: number,
  visStart: number,
  light: boolean,
) {
  const openI = Math.max(visStart, Math.min(c.openI ?? c.i, len - 1));
  const closeI = Math.max(0, Math.min(c.i, len - 1));
  const x0 = x(openI);
  const x1 = Math.max(x(closeI), x0 + 10);
  const yIn = y(c.open);
  const yOut = y(c.close);
  const color = c.tone === "win" ? "#22c55e" : c.tone === "lose" ? "#ef4444" : "#9ca3af";
  const top = Math.min(yIn, yOut);
  const height = Math.max(3, Math.abs(yOut - yIn));

  ctx.fillStyle =
    c.tone === "win" ? "rgba(34,197,94,0.16)" : c.tone === "lose" ? "rgba(239,68,68,0.16)" : "rgba(156,163,175,0.12)";
  ctx.fillRect(x0, top, x1 - x0, height);

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(x0, yIn);
  ctx.lineTo(x1, yIn);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x0, yOut);
  ctx.lineTo(x1, yOut);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x0, yIn);
  ctx.lineTo(x0, yOut);
  ctx.moveTo(x1, yIn);
  ctx.lineTo(x1, yOut);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x0, yIn, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x1, yOut, 4.2, 0, Math.PI * 2);
  ctx.fill();

  const ink = light ? "#fff" : "#000";
  priceTag(ctx, x0 + 6, yIn - 14, `IN ${c.open.toFixed(5)}`, color, ink);
  priceTag(ctx, x1 - 6, yOut + 14, `EXP ${c.close.toFixed(5)}`, color, ink, "right");
}

function priceTag(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  text: string,
  bg: string,
  fg: string,
  align: "left" | "right" = "left",
) {
  ctx.font = '600 10px "IBM Plex Sans", Inter, sans-serif';
  const tw = ctx.measureText(text).width + 14;
  const th = 18;
  const x = align === "right" ? px - tw : px;
  const y = py - th / 2;
  ctx.fillStyle = bg;
  roundFill(ctx, x, y, tw, th, 9);
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + tw / 2, y + th / 2);
  ctx.textBaseline = "alphabetic";
}

function roundFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}
