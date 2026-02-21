import { useEffect, useRef } from "react";

// Pure JSX — no TypeScript annotations anywhere in this file

export default function FeedbackCarAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId, lastTs = 0;

    // roundRect polyfill for older browsers
    if (!ctx.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        const rad = Array.isArray(r) ? (r[0] || 0) : (r || 0);
        this.moveTo(x + rad, y); this.lineTo(x + w - rad, y);
        this.quadraticCurveTo(x + w, y, x + w, y + rad);
        this.lineTo(x + w, y + h - rad);
        this.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
        this.lineTo(x + rad, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - rad);
        this.lineTo(x, y + rad);
        this.quadraticCurveTo(x, y, x + rad, y);
        this.closePath();
      };
    }

    const syncSize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(canvas);

    const rnd = (a, b) => a + Math.random() * (b - a);

    // ── SPEED CONFIG ──
    const BASE_SPEED    = 600;
    const TAP_ADD       = 380;
    const TAP_MAX_BOOST = 2800;
    const BOOST_DECAY   = 950;
    const ACCEL         = 3500;
    const DECEL         = 650;

    let speed       = BASE_SPEED;
    let tapBoost    = 0;
    let lastTapTime = -999;

    let nitroActive = false, nitroLeft = 0, nitroExtra = 0;
    let nextNitro   = 3.5 + rnd(0, 2);
    let nitroPulse  = 0;

    let wheelAngle  = 0, groundScroll = 0, bldgScroll = 0;
    let totalTime   = 0, score = 0;
    let particles   = [];
    let roadBottles = [];
    let nextBottle  = 2.0 + rnd(0, 1.5);

    let shakePhaseX = rnd(0, Math.PI * 2);
    let shakePhaseY = rnd(0, Math.PI * 2);
    let shakeX = 0, shakeY = 0;

    let carHitbox = { x1: 0, y1: 0, x2: 0, y2: 0 };
    let labelPulse = 0;

    function getSpeedTier(sp) {
      if (sp < 900)  return { label: "",               color: "#22c55e" };
      if (sp < 1400) return { label: "BOOST!",         color: "#22c55e" };
      if (sp < 2000) return { label: "SUPER!!",        color: "#4ade80" };
      if (sp < 2700) return { label: "ULTRA!!!",       color: "#a3e635" };
      return               { label: "\u26A1GODMODE\u26A1", color: "#fff176" };
    }

    function addTapBoost(px, py) {
      tapBoost    = Math.min(tapBoost + TAP_ADD, TAP_MAX_BOOST);
      lastTapTime = totalTime;
      nitroLeft   = Math.max(nitroLeft, 1.0);
      nitroActive = true;
      nitroPulse  = Math.min(nitroPulse + 0.55, 1);
      labelPulse  = 1.4;
      spawnParticles(px, py, 22, true);
    }

    const handlePointer = (e) => {
      e.preventDefault();
      const rect   = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      const src    = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
      const px     = (src.clientX - rect.left) * scaleX;
      const py     = (src.clientY - rect.top)  * scaleY;
      if (px >= carHitbox.x1 && px <= carHitbox.x2 &&
          py >= carHitbox.y1 && py <= carHitbox.y2) {
        addTapBoost(px, py);
      }
    };

    const handleMouseMove = (e) => {
      const rect   = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx     = (e.clientX - rect.left) * scaleX;
      const my     = (e.clientY - rect.top)  * scaleY;
      canvas.style.cursor =
        (mx >= carHitbox.x1 && mx <= carHitbox.x2 &&
         my >= carHitbox.y1 && my <= carHitbox.y2)
          ? "pointer" : "default";
    };

    canvas.addEventListener("click",      handlePointer);
    canvas.addEventListener("touchstart", handlePointer, { passive: false });
    canvas.addEventListener("mousemove",  handleMouseMove);

    // ── BUILDINGS ──
    let buildings = [], WORLD_W = 0;
    const TOPS = ["flat", "step", "antenna", "cube"];

    function initBuildings() {
      buildings = [];
      let wx = 20;
      while (wx < 5000) {
        const w  = Math.round(rnd(38, 108));
        const h  = Math.round(rnd(55, 172));
        const sh = Math.round(rnd(10, 23));
        const wins = [];
        const cols = Math.floor(w / 15), rows = Math.floor(h / 19);
        for (let r = 1; r < rows; r++)
          for (let c = 0; c < cols; c++)
            if (Math.random() < 0.42)
              wins.push({ c, r, lit: Math.random() < 0.5, ph: rnd(0, Math.PI * 2) });
        buildings.push({ wx, w, h, sh, top: TOPS[Math.floor(rnd(0, 4))], wins });
        wx += w + Math.round(rnd(12, 52));
      }
      WORLD_W = wx;
    }
    initBuildings();

    // ── PARTICLES ──
    function spawnParticles(x, y, n, blast) {
      const C = blast
        ? ["#22c55e","#86efac","#fff176","#a3e635","#ffffff","#4ade80","#fbbf24"]
        : ["#22c55e","#86efac","#4ade80"];
      for (let i = 0; i < n; i++)
        particles.push({
          x, y,
          vx:   rnd(blast ? -750 : -310, blast ? -65 : -52),
          vy:   rnd(-130, 130),
          life: rnd(0.18, blast ? 1.15 : 0.65),
          sz:   rnd(2, blast ? 14 : 6),
          col:  C[Math.floor(rnd(0, C.length))],
        });
    }

    // ── BUILDINGS DRAW ──
    function drawBuildings(groundY) {
      const CW = canvas.width;
      const smod = bldgScroll % WORLD_W;
      for (const b of buildings) {
        let sx = b.wx - smod;
        if (sx < -b.w - 130) sx += WORLD_W;
        if (sx > CW + 130) continue;
        const by = groundY - b.h;
        const sh = b.sh;

        ctx.save(); ctx.globalAlpha = 0.07;
        ctx.fillStyle = "#000"; ctx.fillRect(sx + 5, by + 5, b.w, b.h);
        ctx.restore();

        ctx.fillStyle = `rgb(${sh},${sh + 2},${sh})`;
        ctx.fillRect(sx, by, b.w, b.h);

        ctx.save(); ctx.globalAlpha = 0.055;
        ctx.fillStyle = "#22c55e"; ctx.fillRect(sx + b.w - 3, by, 3, b.h);
        ctx.restore();

        ctx.strokeStyle = "rgba(34,197,94,0.16)"; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, groundY); ctx.lineTo(sx, by);
        ctx.lineTo(sx + b.w, by); ctx.lineTo(sx + b.w, groundY);
        ctx.stroke();

        if (b.top === "step") {
          ctx.fillStyle = `rgb(${sh - 2},${sh},${sh - 2})`;
          ctx.fillRect(sx + 7, by - 16, b.w - 14, 16);
          ctx.strokeStyle = "rgba(34,197,94,0.11)";
          ctx.strokeRect(sx + 7, by - 16, b.w - 14, 16);
        } else if (b.top === "antenna") {
          ctx.save();
          ctx.strokeStyle = "rgba(34,197,94,0.38)"; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(sx + b.w / 2, by); ctx.lineTo(sx + b.w / 2, by - 25); ctx.stroke();
          ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 9;
          ctx.fillStyle = "#22c55e";
          ctx.beginPath(); ctx.arc(sx + b.w / 2, by - 27, 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        } else if (b.top === "cube") {
          ctx.fillStyle = `rgb(${sh + 4},${sh + 6},${sh + 4})`;
          ctx.fillRect(sx + b.w * 0.2, by - 13, b.w * 0.6, 13);
          ctx.strokeStyle = "rgba(34,197,94,0.1)";
          ctx.strokeRect(sx + b.w * 0.2, by - 13, b.w * 0.6, 13);
        }

        for (const win of b.wins) {
          const wx2 = sx + 7 + win.c * 14;
          const wy2 = by + 8 + win.r * 19;
          if (wy2 + 8 > groundY - 2) continue;
          ctx.save();
          if (win.lit) {
            ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 4;
            ctx.fillStyle = `rgba(34,197,94,${0.30 + Math.sin(totalTime * 0.72 + win.ph) * 0.04})`;
          } else {
            ctx.fillStyle = "rgba(34,197,94,0.04)";
          }
          ctx.fillRect(Math.round(wx2), Math.round(wy2), 8, 7);
          ctx.restore();
        }
      }
    }

    // ── ROAD ──
    function drawRoad(groundY, scroll, spdRatio) {
      const W = canvas.width;
      ctx.fillStyle = "#0a0f0a";
      ctx.fillRect(0, groundY, W, 22);
      ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 1.8; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
      ctx.strokeStyle = "rgba(34,197,94,0.28)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, groundY + 20); ctx.lineTo(W, groundY + 20); ctx.stroke();

      const dashLen = Math.min(20 + spdRatio * 9, 48);
      ctx.setLineDash([dashLen, 14]);
      ctx.strokeStyle = "rgba(34,197,94,0.12)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, groundY + 10); ctx.lineTo(W, groundY + 10); ctx.stroke();
      ctx.setLineDash([]);

      for (let x = -(scroll % 32); x < W + 32; x += 32)
        (ctx.fillStyle = "#0d1a0d", ctx.fillRect(Math.round(x), groundY + 22, 5, 3));
      for (let x = -(scroll % 54); x < W + 54; x += 54)
        (ctx.fillStyle = "#0a140a", ctx.fillRect(Math.round(x + 16), groundY + 26, 3, 2));
    }

    // ── ROAD BOTTLE ──
    function drawRoadBottle(x, groundY, s) {
      const bh = 20 * s, bw = 9 * s, by = groundY - bh;
      ctx.save();
      ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 18;
      const aura = ctx.createRadialGradient(x, groundY - bh * 0.5, 0, x, groundY - bh * 0.5, bw * 2.2);
      aura.addColorStop(0, "rgba(34,197,94,0.22)");
      aura.addColorStop(1, "rgba(34,197,94,0)");
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.ellipse(x, groundY - bh * 0.5, bw * 2.2, bh * 0.65, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#15803d";
      ctx.beginPath(); ctx.roundRect(x - bw / 2, by, bw, bh, [2 * s, 2 * s, 3 * s, 3 * s]); ctx.fill();
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(Math.round(x - bw * 0.3), Math.round(by - 4 * s), Math.round(bw * 0.6), Math.round(4 * s));
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(Math.round(x - bw / 2 + 1), Math.round(by + bh * 0.35), Math.round(bw - 2), Math.round(3 * s));
      ctx.fillStyle = "#fff";
      ctx.font = `900 ${Math.round(7 * s)}px monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("N", x, by + bh * 0.62);
      ctx.globalAlpha = 0.22; ctx.fillStyle = "#fff";
      ctx.fillRect(Math.round(x - bw * 0.35), Math.round(by + 2 * s), Math.round(bw * 0.3), Math.round(bh * 0.28));
      ctx.globalAlpha = 1; ctx.fillStyle = "#0f5132";
      ctx.beginPath(); ctx.roundRect(x - bw / 2, by + bh - 4 * s, bw, 5 * s, [0, 0, 3 * s, 3 * s]); ctx.fill();
      ctx.restore();
    }

    // ── WHEEL ──
    function drawWheel(cx, cy, r, ang, glow) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "#0d0d0d"; ctx.fill();
      ctx.strokeStyle = "#050505"; ctx.lineWidth = Math.max(2.5, r * 0.17);
      for (let i = 0; i < 9; i++) {
        const a = ang + (i / 9) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, a, a + 0.19); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = "#1e1e1e"; ctx.lineWidth = Math.max(1.5, r * 0.11); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "#1e1e1e"; ctx.fill();
      ctx.strokeStyle = "#3c3c3c"; ctx.lineWidth = Math.max(1.5, r * 0.1);
      for (let i = 0; i < 5; i++) {
        const a = ang + (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.22, cy + Math.sin(a) * r * 0.22);
        ctx.lineTo(cx + Math.cos(a) * r * 0.54, cy + Math.sin(a) * r * 0.54);
        ctx.stroke();
      }
      ctx.save();
      if (glow) { ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 18; }
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e"; ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#181818"; ctx.lineWidth = 1; ctx.stroke();
    }

    // ── DRIVER ──
    function drawDriver(cabinL, cTop, CW_, CH_, s) {
      const dx = cabinL + CW_ * 0.57, dy = cTop + CH_ * 0.09;
      const dw = 13 * s, dh = 14 * s;
      ctx.fillStyle = "#181818";
      ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 3.5 * s); ctx.fill();
      ctx.fillStyle = "rgba(80,80,80,0.3)";
      ctx.fillRect(Math.round(dx + 2 * s), Math.round(dy + 1 * s), Math.round(dw - 4 * s), Math.round(2.5 * s));
      ctx.save();
      ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 5;
      ctx.fillStyle = "rgba(34,197,94,0.62)";
      ctx.beginPath(); ctx.roundRect(dx + 2 * s, dy + 4 * s, dw - 4 * s, CH_ * 0.34, 1.5 * s); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = "#fff";
      ctx.fillRect(Math.round(dx + 2.5 * s), Math.round(dy + 4.5 * s), Math.round(3 * s), Math.round(1.5 * s));
      ctx.restore();
      ctx.fillStyle = "#121212";
      ctx.fillRect(Math.round(dx - 1.5 * s), Math.round(dy + dh), Math.round(dw + 3 * s), Math.round(5 * s));
      ctx.save(); ctx.globalAlpha = 0.48;
      ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(dx + dw - 2 * s, dy + 6 * s); ctx.lineTo(dx + 4 * s, dy + dh + 4 * s); ctx.stroke();
      ctx.restore();
    }

    // ── NITRO BOTTLES ON CAR ──
    function drawNitroBottles(bx, by, s, active) {
      for (let i = 0; i < 2; i++) {
        const nx = bx + 3 * s, ny = by + (i === 0 ? 3 * s : 13.5 * s);
        const bw = 5.5 * s, bh = 9 * s;
        ctx.save();
        if (active) { ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 13; }
        ctx.fillStyle = active ? "#15803d" : "#1c1c1c";
        ctx.beginPath(); ctx.roundRect(nx, ny, bw, bh, 2 * s); ctx.fill();
        ctx.fillStyle = active ? "#22c55e" : "#2a2a2a";
        ctx.fillRect(Math.round(nx), Math.round(ny), Math.round(bw), Math.round(2.5 * s));
        ctx.fillStyle = "#111";
        ctx.fillRect(Math.round(nx + bw * 0.25), Math.round(ny + bh), Math.round(bw * 0.5), Math.round(3 * s));
        ctx.save(); ctx.globalAlpha = active ? 0.55 : 0.14;
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(Math.round(nx + 1), Math.round(ny + bh * 0.42), Math.round(bw - 2), Math.round(2 * s));
        ctx.restore(); ctx.restore();
      }
    }

    // ── CAR ──
    function drawCar(cx, groundY, s, ang, isNitro, shX, shY, spdRatio) {
      const W = 148 * s, H = 42 * s, CW_ = 66 * s, CH_ = 28 * s, WR = 24 * s;
      const L = cx - W / 2 + shX;
      const wcy  = groundY - WR + shY;
      const bBot = groundY - WR * 1.36 + shY;
      const bTop = bBot - H;
      const cTop = bTop - CH_;
      const cabinL = L + W * 0.315;
      const fwx = L + W * 0.80, rwx = L + W * 0.18;

      carHitbox = { x1: cx - W / 2 - 10, y1: cTop - 20 * s, x2: cx + W / 2 + 12 * s, y2: groundY + 5 };

      const tiltRad = -Math.min((spdRatio - 1) * 0.018, 0.028);
      ctx.save();
      if (Math.abs(tiltRad) > 0.001) {
        ctx.translate(cx + shX, groundY); ctx.rotate(tiltRad); ctx.translate(-(cx + shX), -groundY);
      }

      // Shadow
      ctx.save(); ctx.globalAlpha = 0.1;
      ctx.beginPath(); ctx.ellipse(cx + shX, groundY + 5, W * 0.42, 8 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#000"; ctx.fill(); ctx.restore();

      // Spoiler
      ctx.fillStyle = "#181818";
      ctx.fillRect(Math.round(L + 5 * s), Math.round(bTop - 17 * s), Math.round(4.5 * s), Math.round(18 * s));
      ctx.fillStyle = "#111";
      ctx.fillRect(Math.round(L - 5 * s), Math.round(bTop - 17 * s), Math.round(34 * s), Math.round(8 * s));
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(Math.round(L - 5 * s), Math.round(bTop - 17 * s), Math.round(34 * s), Math.round(2.5 * s));
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(Math.round(L - 5 * s), Math.round(bTop - 9.5 * s), Math.round(34 * s), Math.round(1.5 * s));

      // Body
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath(); ctx.roundRect(L, bTop, W, H, [0, 4 * s, 4 * s, 0]); ctx.fill();

      // Stripe
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(Math.round(L + 9 * s), Math.round(bTop + H * 0.38), Math.round(W - 18 * s), Math.round(5 * s));

      // Plate
      ctx.fillStyle = "#111";
      ctx.fillRect(Math.round(cx + shX - 17 * s), Math.round(bTop + H * 0.54), Math.round(34 * s), Math.round(14 * s));
      ctx.fillStyle = "#22c55e";
      ctx.font = `bold ${Math.round(9 * s)}px "Courier New", monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("F2R", cx + shX, bTop + H * 0.64);

      // Chassis
      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(Math.round(L + 14 * s), Math.round(bBot - 5 * s), Math.round(W - 28 * s), Math.round(6.5 * s));

      // Wheel arches
      ctx.fillStyle = "#0e0e0e";
      ctx.beginPath(); ctx.arc(fwx, wcy, WR + 3.5 * s, 0, Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(rwx, wcy, WR + 3.5 * s, 0, Math.PI); ctx.fill();

      // Cabin
      ctx.fillStyle = "#131313";
      ctx.beginPath(); ctx.roundRect(cabinL, cTop, CW_, CH_, [5 * s, 5 * s, 0, 0]); ctx.fill();
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = "rgba(34,197,94,0.07)";
      ctx.beginPath(); ctx.roundRect(cabinL + 2.5 * s, cTop + 3 * s, CW_ * 0.30, CH_ - 4 * s, [2 * s, 2 * s, 0, 0]); ctx.fill(); ctx.restore();
      ctx.save();
      ctx.shadowColor = "rgba(34,197,94,0.22)"; ctx.shadowBlur = 4;
      ctx.fillStyle = "rgba(34,197,94,0.15)";
      ctx.beginPath(); ctx.roundRect(cabinL + CW_ * 0.53, cTop + 2.5 * s, CW_ * 0.43, CH_ - 3 * s, [2 * s, 2 * s, 0, 0]); ctx.fill();
      ctx.strokeStyle = "rgba(34,197,94,0.32)"; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(Math.round(cabinL), Math.round(cTop), Math.round(CW_), Math.round(3 * s));
      ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.round(cabinL), Math.round(bTop + 2));
      ctx.lineTo(Math.round(cabinL), Math.round(bBot - 3)); ctx.stroke();

      drawDriver(cabinL, cTop, CW_, CH_, s);

      // Front bumper
      ctx.fillStyle = "#1c1c1c";
      ctx.fillRect(Math.round(L + W - 1 * s), Math.round(bTop + H * 0.18), Math.round(10 * s), Math.round(H * 0.64));
      ctx.fillStyle = "#141414";
      ctx.fillRect(Math.round(L + W + 8 * s), Math.round(bTop + H * 0.28), Math.round(5 * s), Math.round(H * 0.44));
      ctx.strokeStyle = "#222"; ctx.lineWidth = 1;
      for (let g = 0; g < 3; g++) {
        const gy = bTop + H * (0.30 + g * 0.14);
        ctx.beginPath(); ctx.moveTo(L + W, gy); ctx.lineTo(L + W + 9 * s, gy); ctx.stroke();
      }

      // Headlights
      ctx.save();
      if (isNitro) { ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 28 + spdRatio * 6; }
      ctx.fillStyle = isNitro ? "#ffffff" : "#fffde7";
      ctx.fillRect(Math.round(L + W + 1 * s), Math.round(bTop + H * 0.10), Math.round(10 * s), Math.round(10 * s));
      ctx.fillStyle = "#ffca28";
      ctx.fillRect(Math.round(L + W + 1 * s), Math.round(bTop + H * 0.56), Math.round(10 * s), Math.round(7 * s));
      ctx.restore();

      // Rear lights
      ctx.fillStyle = "#111";
      ctx.fillRect(Math.round(L - 7 * s), Math.round(bTop + H * 0.18), Math.round(8 * s), Math.round(H * 0.64));
      ctx.save();
      ctx.shadowColor = "#ff1744"; ctx.shadowBlur = 8 + Math.min(spdRatio * 5, 20);
      ctx.fillStyle = "#ff1744";
      ctx.fillRect(Math.round(L - 7 * s), Math.round(bTop + H * 0.10), Math.round(5 * s), Math.round(10 * s));
      ctx.fillStyle = "#ff6d00";
      ctx.fillRect(Math.round(L - 7 * s), Math.round(bTop + H * 0.56), Math.round(5 * s), Math.round(7 * s));
      ctx.restore();

      // Exhaust
      ctx.fillStyle = "#2c2c2c";
      ctx.fillRect(Math.round(L + 2 * s), Math.round(bBot - 4 * s), Math.round(20 * s), Math.round(5 * s));
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(Math.round(L - 10 * s), Math.round(bBot - 1 * s), Math.round(13 * s), Math.round(5 * s));

      drawNitroBottles(L - 7 * s, bTop + H * 0.12, s, isNitro);

      // Nitro flame
      if (nitroPulse > 0.04) {
        const fs = 1 + (tapBoost / TAP_MAX_BOOST) * 0.9;
        const fx = L - 16 * s, fy = bBot + 2 * s;
        const g = ctx.createRadialGradient(fx - 3 * s, fy, 0, fx - 3 * s, fy, 44 * s * nitroPulse * fs + 8);
        g.addColorStop(0,    `rgba(255,255,120,${0.96 * nitroPulse})`);
        g.addColorStop(0.22, `rgba(34,197,94,${0.90 * nitroPulse})`);
        g.addColorStop(0.60, `rgba(34,197,94,${0.20 * nitroPulse})`);
        g.addColorStop(1,    "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.ellipse(fx - 6 * s, fy, 42 * s * nitroPulse * fs + 9, 11 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }

      drawWheel(fwx, wcy, WR, ang, isNitro);
      drawWheel(rwx, wcy, WR, ang + 0.45, isNitro);

      ctx.restore();

      return {
        flagPoleX:    L + W * 0.062,
        flagPoleTopY: bTop - 17 * s,
        flagPoleBotY: bTop + 3 * s,
      };
    }

    // ── FLAG ──
    function drawFlag(poleX, poleTopY, poleBotY, s, t, spdRatio) {
      const FW = 175 * s, FH = poleBotY - poleTopY;
      const SEG = 20;
      const wAmp = Math.min((2.8 + spdRatio * 6.5) * s, 15 * s);
      const pts = [];
      for (let i = 0; i <= SEG; i++) {
        const u = i / SEG, x = poleX - u * FW;
        const droop = u * u * FH * 0.045;
        const wave = Math.sin(u * 2.9 * Math.PI + t * 6.4) * wAmp * Math.sqrt(u) +
                     Math.sin(u * 5.6 * Math.PI + t * 10.2) * wAmp * 0.32 * u;
        pts.push([{ x, y: poleTopY + wave + droop }, { x, y: poleBotY + wave * 0.70 + droop }]);
      }

      const top = pts.map(p => p[0]);
      const bot = pts.map(p => p[1]);

      ctx.save(); ctx.globalAlpha = 0.06;
      ctx.beginPath(); ctx.moveTo(top[0].x + 5, top[0].y + 7);
      for (let i = 1; i <= SEG; i++) ctx.lineTo(top[i].x + 5, top[i].y + 7);
      for (let i = SEG; i >= 0; i--) ctx.lineTo(bot[i].x + 5, bot[i].y + 7);
      ctx.closePath(); ctx.fillStyle = "#000"; ctx.fill(); ctx.restore();

      ctx.beginPath(); ctx.moveTo(top[0].x, top[0].y);
      for (let i = 1; i <= SEG; i++) ctx.lineTo(top[i].x, top[i].y);
      for (let i = SEG; i >= 0; i--) ctx.lineTo(bot[i].x, bot[i].y);
      ctx.closePath(); ctx.fillStyle = "#efefef"; ctx.fill();
      ctx.strokeStyle = "#d2d2d2"; ctx.lineWidth = 0.75; ctx.stroke();

      const ST = 0.23;
      ctx.beginPath(); ctx.moveTo(top[0].x, top[0].y);
      for (let i = 1; i <= SEG; i++) ctx.lineTo(top[i].x, top[i].y);
      for (let i = SEG; i >= 0; i--) {
        const { x: tx, y: ty } = top[i], { x: bx, y: by } = bot[i];
        ctx.lineTo(tx + (bx - tx) * ST, ty + (by - ty) * ST);
      }
      ctx.closePath(); ctx.fillStyle = "#22c55e"; ctx.fill();

      const SB = 0.88;
      ctx.beginPath();
      for (let i = 0; i <= SEG; i++) {
        const { x: tx, y: ty } = top[i], { x: bx, y: by } = bot[i];
        const px = tx + (bx - tx) * SB, py = ty + (by - ty) * SB;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      for (let i = SEG; i >= 0; i--) ctx.lineTo(bot[i].x, bot[i].y);
      ctx.closePath(); ctx.fillStyle = "#16a34a"; ctx.fill();

      const TEXT = "FEEDBACK";
      const fsize = Math.max(12, Math.round(FH * 0.52));
      ctx.font = `900 ${fsize}px "Courier New", monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";

      for (let c = 0; c < TEXT.length; c++) {
        const u = 0.84 - (c / (TEXT.length - 1)) * 0.75;
        const fi = u * SEG, si = Math.min(Math.floor(fi), SEG - 1), sf = fi - si, sn = si + 1;
        const tx = top[si].x + (top[sn].x - top[si].x) * sf;
        const ty = top[si].y + (top[sn].y - top[si].y) * sf;
        const bx_ = bot[si].x + (bot[sn].x - bot[si].x) * sf;
        const by_ = bot[si].y + (bot[sn].y - bot[si].y) * sf;
        const mx = tx + (bx_ - tx) * 0.60, my = ty + (by_ - ty) * 0.60;
        const nu = Math.max(u - 0.058, 0), nfi = nu * SEG;
        const nsi = Math.min(Math.floor(nfi), SEG - 1), nsf = nfi - nsi, nsn = nsi + 1;
        const ntx = top[nsi].x + (top[nsn].x - top[nsi].x) * nsf;
        const nty = top[nsi].y + (top[nsn].y - top[nsi].y) * nsf;
        ctx.save();
        ctx.translate(mx, my); ctx.rotate(Math.atan2(nty - ty, ntx - tx));
        ctx.shadowColor = "rgba(255,255,255,0.6)"; ctx.shadowBlur = 2.5;
        ctx.fillStyle = "#111"; ctx.fillText(TEXT[c], 0, 0);
        ctx.restore();
      }

      ctx.save();
      ctx.strokeStyle = "#6b7280"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(poleX, poleTopY - 2 * s); ctx.lineTo(poleX, poleBotY + 3 * s); ctx.stroke();
      ctx.fillStyle = "#9ca3af"; ctx.fillRect(Math.round(poleX - 3), Math.round(poleBotY - 3), 6, 8);
      ctx.fillStyle = "#d1d5db";
      ctx.beginPath(); ctx.arc(poleX, poleTopY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // ── MAIN LOOP ──
    function loop(ts) {
      const dt  = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs    = ts;
      totalTime += dt;
      score     += speed * dt * 0.1;

      const CW      = canvas.width, CH = canvas.height;
      const groundY = Math.round(CH * 0.80); // pushed lower — gives flag+car more room at top
      const s       = Math.max(0.42, Math.min(CW / 460, 1.20));
      const carCX   = CW * 0.58;
      const carFront = carCX + 148 * s / 2;

      // Tap boost decay
      const timeSinceTap = totalTime - lastTapTime;
      if (timeSinceTap > 0.18) tapBoost = Math.max(tapBoost - BOOST_DECAY * dt, 0);
      if (tapBoost <= 0 && nitroLeft <= 0) nitroActive = false;

      // Auto nitro
      if (!nitroActive && tapBoost <= 0 && totalTime >= nextNitro) {
        nitroLeft   = 1.2;
        nitroActive = true;
        nextNitro   = totalTime + rnd(4.5, 8.5);
        spawnParticles(carCX - 72 * s, groundY - 28 * s, 12, true);
      }
      if (nitroActive) {
        nitroLeft  = Math.max(nitroLeft - dt, 0);
        nitroPulse = Math.min(nitroPulse + dt * 6, 1);
        nitroExtra = 180;
        if (Math.random() < 0.50) spawnParticles(carCX - 72 * s, groundY - 28 * s, 1, false);
      } else {
        nitroPulse = Math.max(nitroPulse - dt * 3.5, 0);
        nitroExtra = 0;
      }

      const targetSpeed_ = BASE_SPEED + tapBoost + nitroExtra;
      speed = speed < targetSpeed_
        ? Math.min(speed + ACCEL * dt, targetSpeed_)
        : Math.max(speed - DECEL * dt, targetSpeed_);

      const spdRatio = speed / BASE_SPEED;

      groundScroll = (groundScroll + speed * dt) % 400;
      bldgScroll  += speed * dt * (0.22 + Math.max(spdRatio - 1, 0) * 0.32);
      wheelAngle  += (speed * dt) / (24 * s);

      labelPulse = Math.max(labelPulse - dt * 1.6, 0);

      const shakeAmp = 0.7 + Math.pow(Math.max(spdRatio - 1, 0), 1.5) * 2.8;
      shakePhaseX += dt * (9 + spdRatio * 8);
      shakePhaseY += dt * (13 + spdRatio * 5);
      shakeX = Math.sin(shakePhaseX) * shakeAmp * s;
      shakeY = Math.sin(shakePhaseY) * shakeAmp * s * 0.55;

      // Road bottles
      if (totalTime >= nextBottle) {
        roadBottles.push({ x: CW + 75, collected: false });
        nextBottle = totalTime + rnd(2.8, 6.0);
      }
      for (const b of roadBottles) { if (!b.collected) b.x -= speed * dt; }
      for (const b of roadBottles) {
        if (!b.collected && b.x <= carFront + 18 * s && b.x >= carCX - 35 * s) {
          b.collected = true;
          addTapBoost(carCX - 74 * s, groundY - 32 * s);
        }
      }
      roadBottles = roadBottles.filter(b => !b.collected && b.x > -80);

      // Particles
      for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 95 * dt; p.life -= dt; }
      particles = particles.filter(p => p.life > 0);

      // ── RENDER ──
      ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, CW, CH);

      // Grid
      ctx.save();
      ctx.globalAlpha = 0.024 + Math.min((spdRatio - 1) * 0.009, 0.014);
      ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 0.5;
      const gridOff = spdRatio > 2 ? Math.sin(totalTime * 45) * 2 : 0;
      for (let x = gridOff; x < CW; x += 46) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke(); }
      for (let y = 0; y < CH; y += 46) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }
      ctx.restore();

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, "rgba(0,10,0,0.52)"); skyGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, CW, groundY);

      // Buildings
      ctx.save();
      if (spdRatio > 2.8) {
        const smear = Math.min((spdRatio - 2.8) * 20, 55);
        ctx.save(); ctx.globalAlpha = 0.16; ctx.translate(smear, 0); drawBuildings(groundY); ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.08; ctx.translate(smear * 1.8, 0); drawBuildings(groundY); ctx.restore();
      }
      ctx.globalAlpha = 0.58;
      drawBuildings(groundY);
      ctx.restore();

      // Speed lines
      const lineAlpha = Math.min(0.04 + Math.max(spdRatio - 1, 0) * 0.065, 0.28);
      if (lineAlpha > 0.035) {
        ctx.save(); ctx.globalAlpha = lineAlpha;
        ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 1;
        const lineCount = Math.min(Math.floor(5 + (spdRatio - 1) * 9), 26);
        for (let i = 0; i < lineCount; i++) {
          const ly = CH * (0.03 + i * (0.92 / lineCount));
          const lx = ((totalTime * (280 + speed * 0.12) + i * 179) % (CW * 0.85));
          const ll = Math.min(16 + spdRatio * 24 + (i % 3) * 30, 200);
          ctx.beginPath(); ctx.moveTo(lx - ll, ly); ctx.lineTo(lx, ly); ctx.stroke();
        }
        ctx.restore();
      }

      drawRoad(groundY, groundScroll, spdRatio);
      for (const b of roadBottles) drawRoadBottle(b.x, groundY, s);

      // Particles
      for (const p of particles) {
        ctx.save(); ctx.globalAlpha = Math.min(p.life, 0.95);
        ctx.fillStyle = p.col;
        if (p.sz > 4) { ctx.shadowColor = p.col; ctx.shadowBlur = 8; }
        ctx.fillRect(p.x - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz);
        ctx.restore();
      }

      const info = drawCar(carCX, groundY, s, wheelAngle, nitroActive, shakeX, shakeY, spdRatio);
      drawFlag(info.flagPoleX, info.flagPoleTopY, info.flagPoleBotY, s, totalTime, spdRatio);

      // ── HUD ──
      const tier = getSpeedTier(speed);
      const scoreStr = Math.floor(score).toString().padStart(5, "0");
      const hiStr    = Math.floor(score * 1.18 + 3142).toString().padStart(5, "0");
      const hudSz    = Math.round(Math.max(10, Math.min(15, CW * 0.022)));

      // Score — top right
      ctx.font = `bold ${hudSz}px "Courier New", monospace`;
      ctx.textBaseline = "top"; ctx.textAlign = "right";
      ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = "#22c55e";
      ctx.fillText(`HI ${hiStr}`, CW - 12, 8); ctx.restore();
      ctx.fillStyle = "#22c55e"; ctx.fillText(scoreStr, CW - 12, 8 + hudSz + 3);

      // Speed tier label — top left
      if (tier.label && (tapBoost > 0 || nitroActive)) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.3 + tapBoost / TAP_MAX_BOOST + nitroPulse * 0.4, 1);
        ctx.shadowColor = tier.color; ctx.shadowBlur = 20;
        ctx.font = `bold ${Math.round(hudSz * 0.85)}px "Courier New", monospace`;
        ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillStyle = tier.color;
        ctx.fillText(tier.label, 10, 8);
        ctx.restore();
      }

      // Nitro bar — top left, below tier label
      const barW = Math.round(Math.min(CW * 0.15, 90));
      const barX = 10, barY = 8 + hudSz * 2 + 4;
      const fillR = Math.min(tapBoost / TAP_MAX_BOOST, 1);
      ctx.save();
      ctx.globalAlpha = 0.35; ctx.fillStyle = "#111";
      ctx.fillRect(barX, barY, barW, 4);
      if (fillR > 0) {
        ctx.globalAlpha = 0.92;
        ctx.shadowColor = tier.color; ctx.shadowBlur = 7;
        ctx.fillStyle = tier.color;
        ctx.fillRect(barX, barY, Math.round(barW * fillR), 4);
      }
      ctx.restore();

      // ── "TAP CAR" hint — TOP CENTER, pulsing ──
      // Moved from bottom to top so no dead space at bottom of canvas
      const helpSz = Math.round(Math.max(7, Math.min(10, CW * 0.018)));
      const helpA  = tapBoost > 100 ? 0.18 : 0.55 + Math.sin(totalTime * 2.4) * 0.32;
      ctx.save();
      ctx.globalAlpha = helpA;
      ctx.fillStyle = "#22c55e";
      ctx.font = `bold ${helpSz}px "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";         // anchored to top
      ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 5;
      ctx.fillText("[ TAP CAR TO GO FASTER! ]", CW / 2, 8);  // y=8 → top strip
      ctx.restore();

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(ts => { lastTs = ts; loop(ts); });

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener("click",      handlePointer);
      canvas.removeEventListener("touchstart", handlePointer);
      canvas.removeEventListener("mousemove",  handleMouseMove);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "190px",
        background: "#050505",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: "2px solid rgba(34,197,94,0.25)",
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}