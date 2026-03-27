/*
 * Pixelated Iris — transition
 * Library: GSAP + Canvas API
 *
 * Mosaic pixels expand from center outward, covering the screen.
 * Mode snaps underneath at full coverage, then pixels retract to center.
 * Overlay is position:fixed — canvas fills the full viewport.
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
    const { overlay, sidebar, content, brand, avatar, toggle, dot, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const cols = Math.ceil(W / PIXEL_SIZE) + 1;
    const rows = Math.ceil(H / PIXEL_SIZE) + 1;

    const canvas = document.createElement('canvas');
    canvas.width  = cols * PIXEL_SIZE;
    canvas.height = rows * PIXEL_SIZE;
    canvas.style.cssText = 'position:absolute;top:0;left:0;display:block;';
    const ctx = canvas.getContext('2d');

    const msgEl = document.createElement('div');
    msgEl.style.cssText = `
      position:absolute; inset:0; display:flex; flex-direction:column;
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
      // mode 'cover': fill cells inside radius; 'uncover': fill cells outside radius
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

    gsap.timeline({ onComplete: done })
      .to(obj, {
        r: 1, duration: COVER_DUR, ease: 'power2.in',
        onUpdate() { draw(obj.r, 'cover'); },
        onComplete() { draw(1, 'cover'); },
      })
      .call(() => {
        sidebar.style.background  = toMode.sidebarBg;
        content.style.background  = toMode.contentBg;
        content.style.borderColor = toMode.contentBorder;
        avatar.style.background   = toMode.avatarBg;
        toggle.style.background   = toMode.toggleBg;
        toggle.classList.toggle('is-on', toMode.toggleOn);
        gsap.set(dot, { x: toMode.toggleOn ? 14 : 0 });
        brand.textContent = toMode.brand;
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
