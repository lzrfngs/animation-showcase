/*
 * Cipher — transition
 * Library: GSAP + Canvas API
 *
 * Each panel element is individually encrypted in staggered sequence:
 *   — Brand text scrambles through hex characters
 *   — Sidebar fills with flickering grey columns (corrupted scan data)
 *   — Content area floods with a monospace character grid (live code stream)
 *   — Avatar pulses with concentric pixel rings
 *   — Toggle glitches between both mode states
 *
 * Everything locks. Mode snaps underneath. The canvas fades away cleanly,
 * revealing the new space as if it was always there behind the encryption.
 */

const CRYPTO = '0123456789ABCDEFabcdef.:_-|=+/\\';
const CHAR_W = 5;   // monospace grid cell width  (px)
const CHAR_H = 9;   // monospace grid cell height (px)
const COL_W  = 3;   // sidebar noise column width (px)
const RING_W = 4;   // avatar ring strip thickness (px)

function rchar() {
  return CRYPTO[Math.floor(Math.random() * CRYPTO.length)];
}

export default {
  id: 'cipher',
  title: 'Cipher',
  description: 'Each element encrypts individually. Old space locks and closes. New space reveals clean.',

  play(els, from, to, done) {
    const { panel, overlay, sidebar, content, avatar, toggle, dot, brand, modes } = els;
    const fromMode = modes[from];
    const toMode   = modes[to];
    const fromMsg  = fromMode.leaving;
    const pr       = panel.getBoundingClientRect();
    const cw = pr.width, ch = pr.height;

    // ── Canvas ───────────────────────────────────────────────────────────────
    const canvas = document.createElement('canvas');
    canvas.width  = cw;
    canvas.height = ch;
    canvas.style.cssText = `
      position:fixed; top:${pr.top}px; left:${pr.left}px;
      width:${cw}px; height:${ch}px;
      display:block; pointer-events:none; border-radius:8px;
    `;
    const ctx = canvas.getContext('2d');
    ctx.font = `${CHAR_H}px "IBM Plex Mono", monospace`;

    // ── Message ──────────────────────────────────────────────────────────────
    const msgEl = document.createElement('div');
    msgEl.style.cssText = `
      position:fixed; left:${pr.left}px; top:${pr.top}px;
      width:${cw}px; height:${ch}px;
      display:flex; align-items:center; justify-content:center;
      pointer-events:none; opacity:0;
    `;
    msgEl.innerHTML = `
      <div style="
        background:rgba(8,8,8,0.75);
        border:1px solid rgba(255,255,255,0.07);
        border-radius:7px; padding:10px 20px;
        display:flex; flex-direction:column; align-items:center; gap:5px;
        backdrop-filter:blur(4px);
      ">
        <p style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:500;color:#d0d0d0;text-align:center;margin:0;">${fromMsg.primary}</p>
        <p style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#555;text-align:center;margin:0;">${fromMsg.secondary}</p>
      </div>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(canvas);
    overlay.appendChild(msgEl);
    gsap.set(overlay, { display: 'block', background: 'transparent' });

    // ── Element rects in canvas space ─────────────────────────────────────────
    function toCanvas(el) {
      const r = el.getBoundingClientRect();
      return { x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height };
    }
    const sRect = toCanvas(sidebar);
    const cRect = toCanvas(content);
    const aRect = toCanvas(avatar);

    // ── Per-element encryption progress (0–1), driven by GSAP tweens ─────────
    const ep = { side: 0, cont: 0, avat: 0 };

    // ── Brand scramble ────────────────────────────────────────────────────────
    const origBrand = brand.textContent;
    let brandTimer  = null;

    function startBrandScramble() {
      brandTimer = setInterval(() => {
        brand.textContent = Array.from({ length: origBrand.length }, rchar).join('');
      }, 55);
    }

    function stopBrandScramble(resolvedText) {
      clearInterval(brandTimer);
      brand.textContent = resolvedText;
    }

    // ── Toggle glitch ─────────────────────────────────────────────────────────
    let toggleTimer = null;

    function startToggleGlitch() {
      toggleTimer = setInterval(() => {
        gsap.set(dot, { x: Math.floor(Math.random() * 15) });
        gsap.set(toggle, {
          backgroundColor: Math.random() > 0.5 ? fromMode.toggleBg : toMode.toggleBg,
        });
      }, 70);
    }

    function stopToggleGlitch() {
      clearInterval(toggleTimer);
    }

    // ── Canvas draw functions (called every gsap.ticker frame) ────────────────
    function drawSide(p) {
      // Flickering grey columns — corrupted scan data
      for (let x = sRect.x; x < sRect.x + sRect.w; x += COL_W) {
        const g = Math.floor(Math.random() * 35 + 8);
        ctx.fillStyle = `rgba(${g},${g},${g},${p})`;
        ctx.fillRect(x, sRect.y, COL_W, sRect.h);
      }
    }

    function drawContent(p) {
      // Dark backing
      ctx.fillStyle = `rgba(10,10,10,${p * 0.9})`;
      ctx.fillRect(cRect.x, cRect.y, cRect.w, cRect.h);
      // Monospace character stream — live hex data
      ctx.fillStyle = `rgba(65,65,65,${p * 0.8})`;
      for (let y = cRect.y + CHAR_H; y < cRect.y + cRect.h; y += CHAR_H + 1) {
        for (let x = cRect.x + 2; x < cRect.x + cRect.w - 2; x += CHAR_W) {
          ctx.fillText(rchar(), x, y);
        }
      }
    }

    function drawAvatar(p) {
      // Concentric pixel rings radiating from the avatar centre
      const ax = aRect.x + aRect.w / 2;
      const ay = aRect.y + aRect.h / 2;
      const maxR = Math.max(aRect.w, aRect.h) / 2 + 2;
      ctx.lineWidth = RING_W - 1;
      for (let r = RING_W; r <= maxR; r += RING_W) {
        const g = Math.floor(Math.random() * 55 + 15);
        ctx.strokeStyle = `rgba(${g},${g},${g},${p})`;
        ctx.beginPath();
        ctx.arc(ax, ay, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ── gsap.ticker — redraws every frame while encrypting ───────────────────
    const tickerFn = () => {
      ctx.clearRect(0, 0, cw, ch);
      if (ep.side > 0) drawSide(ep.side);
      if (ep.avat > 0) drawAvatar(ep.avat);
      if (ep.cont > 0) drawContent(ep.cont);
    };
    gsap.ticker.add(tickerFn);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    function cleanup() {
      gsap.ticker.remove(tickerFn);
      stopBrandScramble(toMode.brand);
      stopToggleGlitch();
    }

    // ── Timeline ──────────────────────────────────────────────────────────────
    return gsap.timeline({ onComplete() { cleanup(); done(); } })

      // Message appears as the process begins
      .to(msgEl, { opacity: 1, duration: 0.3, ease: 'power1.out' })

      // Elements encrypt in staggered sequence
      .call(() => startBrandScramble())
      .to(ep, { side: 1, duration: 0.55, ease: 'power1.in' }, '<+=0.05')
      .call(() => startToggleGlitch(), null, '<+=0.12')
      .to(ep, { avat: 1, duration: 0.4,  ease: 'power2.in' }, '<+=0.08')
      .to(ep, { cont: 1, duration: 0.65, ease: 'power1.in' }, '<+=0.1')

      // Hold at full encryption — everything locked
      .to({}, { duration: 0.3 })

      // Lock: snap mode, stop glitches, brand resolves to new name
      .call(() => {
        els.snap(to);
        stopToggleGlitch();
        stopBrandScramble(toMode.brand);
      })

      // Canvas fades — new mode reveals cleanly underneath
      .to(canvas, { opacity: 0, duration: 0.55, ease: 'power2.out' })

      // Hold, then message out
      .to({}, { duration: 0.85 })
      .to(msgEl, { opacity: 0, duration: 0.3, ease: 'power1.in' });
  },
};
