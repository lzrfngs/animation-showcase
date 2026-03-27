/*
 * Pixelated Iris — transition
 * Library: GSAP + Canvas API
 *
 * Mosaic pixels expand from center outward covering the screen,
 * mode snaps underneath, then pixels retract back to center.
 * Tune PIXEL_SIZE and COVER_COLOR below.
 */

const PIXEL_SIZE  = 20;
const COVER_COLOR = '#1a1a1a';
const COVER_DUR   = 0.5;
const UNCOVER_DUR = 0.5;

export default {
  id: 'iris',
  title: 'Pixelated Iris',
  description: 'Mosaic pixels expand from center outward. Mode snaps underneath, then pixels retract.',

  play(els, from, to, done) {
    const { overlay, msgBox, msgPrim, msgSec, modes } = els;
    const fromMsg = modes[from].leaving;

    const W    = window.innerWidth;
    const H    = window.innerHeight;
    const cols = Math.ceil(W / PIXEL_SIZE) + 1;
    const rows = Math.ceil(H / PIXEL_SIZE) + 1;

    const canvas = document.createElement('canvas');
    canvas.width  = cols * PIXEL_SIZE;
    canvas.height = rows * PIXEL_SIZE;
    // position:fixed so it aligns with the viewport-relative overlay
    canvas.style.cssText = 'position:fixed;top:0;left:0;display:block;pointer-events:none;';
    const ctx = canvas.getContext('2d');

    const msgEl = document.createElement('div');
    msgEl.style.cssText = `
      position:fixed; inset:0; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:8px;
      font-family:Inter,system-ui,sans-serif; pointer-events:none; opacity:0;
    `;
    msgEl.innerHTML = `
      <p style="font-size:13px;font-weight:500;color:#c8c8c8;">${fromMsg.primary}</p>
      <p style="font-size:11px;color:#666;">${fromMsg.secondary}</p>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(canvas);
    overlay.appendChild(msgEl);
    gsap.set(overlay, { display: 'block', background: 'transparent' });

    // Pre-compute cells sorted by distance from viewport centre
    const cx = cols / 2;
    const cy = rows / 2;
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ c, r, dist: Math.hypot(c - cx, r - cy) });
      }
    }
    const maxDist = Math.max(...cells.map(cell => cell.dist));

    function draw(radius, mode) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = COVER_COLOR;
      for (const cell of cells) {
        const norm = cell.dist / maxDist;
        if (mode === 'cover' ? norm <= radius : norm > radius) {
          ctx.fillRect(cell.c * PIXEL_SIZE, cell.r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    }

    const obj = { r: 0 };

    return gsap.timeline({ onComplete: done })
      .to(obj, {
        r: 1, duration: COVER_DUR, ease: 'power2.in',
        onUpdate() { draw(obj.r, 'cover'); },
        onComplete() { draw(1, 'cover'); },
      })
      .call(() => {
        els.snap(to);
        obj.r = 0;
      })
      .to(msgEl, { opacity: 1, duration: 0.15, ease: 'power1.out' })
      .to({}, { duration: 0.6 })
      .to(msgEl, { opacity: 0, duration: 0.15, ease: 'power1.in' })
      .to(obj, {
        r: 1, duration: UNCOVER_DUR, ease: 'power2.out',
        onUpdate() { draw(obj.r, 'uncover'); },
        onComplete() { ctx.clearRect(0, 0, canvas.width, canvas.height); },
      });
  },
};
