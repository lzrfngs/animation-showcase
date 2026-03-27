/*
 * Pixelated Iris — transition
 * Library: GSAP + Canvas API
 *
 * Single-phase reveal: new mode is snapped first, then canvas pixels dissolve
 * away to expose it. No cover-then-uncover — just one directional wipe.
 *
 * Direction:
 *   personal → work  : centre outward  (pixels vanish from middle first)
 *   work → personal  : edge inward     (pixels vanish from outside first)
 *
 * Distance metric: Manhattan (|dx|+|dy|) gives a diamond shape instead of
 * a circle. GSAP steps() ease makes it low-frame-rate / LED-matrix.
 */

const PIXEL_SIZE = 18;
const STEPS      = 14;        // discrete animation frames — lower = choppier
const FPS        = 9;         // effective frame rate for the reveal
const DUR        = STEPS / FPS; // ~1.55 s
const HOLD_DUR   = 0.8;

export default {
  id: 'iris',
  title: 'Pixelated Iris',
  description: 'Diamond-shaped pixel reveal. Direction and message persist above.',

  play(els, from, to, done) {
    const { panel, overlay, content, modes } = els;
    const fromMsg    = modes[from].leaving;
    const pixelColor = modes[from].sidebarBg; // old mode colour — not pure black
    const pr = panel.getBoundingClientRect();
    const cr = content.getBoundingClientRect();

    const cols = Math.ceil(pr.width  / PIXEL_SIZE) + 1;
    const rows = Math.ceil(pr.height / PIXEL_SIZE) + 1;

    // Canvas sits exactly over the panel — CSS border-radius clips the corners
    const canvas = document.createElement('canvas');
    canvas.width  = cols * PIXEL_SIZE;
    canvas.height = rows * PIXEL_SIZE;
    canvas.style.cssText = `
      position:fixed;
      top:${pr.top}px; left:${pr.left}px;
      width:${pr.width}px; height:${pr.height}px;
      display:block; pointer-events:none;
      border-radius:8px;
    `;
    const ctx = canvas.getContext('2d');

    // Message sits above the canvas in DOM — visible throughout the transition
    const msgEl = document.createElement('div');
    msgEl.style.cssText = `
      position:fixed;
      left:${cr.left}px; top:${cr.top}px;
      width:${cr.width}px; height:${cr.height}px;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:8px;
      font-family:Inter,system-ui,sans-serif; pointer-events:none; opacity:0;
    `;
    msgEl.innerHTML = `
      <p style="font-size:13px;font-weight:500;color:#e0e0e0;text-align:center;">${fromMsg.primary}</p>
      <p style="font-size:11px;color:#888;text-align:center;">${fromMsg.secondary}</p>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(canvas);   // drawn first — sits below message
    overlay.appendChild(msgEl);
    gsap.set(overlay, { display: 'block', background: 'transparent' });

    // Snap the new mode immediately — canvas covers it while the reveal plays
    els.snap(to);

    // Sort cells by Manhattan (diamond) distance from panel centre
    const cx = cols / 2;
    const cy = rows / 2;
    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        cells.push({ c, r, dist: Math.abs(c - cx) + Math.abs(r - cy) });

    // personal→work: reveal from centre out (nearest cells disappear first)
    // work→personal: reveal from edge in  (furthest cells disappear first)
    const centreFirst = to === 'work';
    cells.sort((a, b) => centreFirst ? a.dist - b.dist : b.dist - a.dist);

    // draw: t=0 → fully covered, t=1 → fully revealed
    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = pixelColor;
      const keep = Math.round((1 - t) * cells.length);
      for (let i = 0; i < keep; i++)
        ctx.fillRect(cells[i].c * PIXEL_SIZE, cells[i].r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }

    // Start fully covered
    draw(0);

    const obj = { t: 0 };

    return gsap.timeline({ onComplete: done })
      // Message comes up immediately so it's legible throughout
      .to(msgEl, { opacity: 1, duration: 0.25, ease: 'power1.out' })

      // Pixel reveal — stepped for LED-matrix feel
      .to(obj, {
        t: 1,
        duration: DUR,
        ease: `steps(${STEPS})`,
        onUpdate()  { draw(obj.t); },
        onComplete(){ ctx.clearRect(0, 0, canvas.width, canvas.height); },
      }, '<+=0.15')

      // Hold, then message out
      .to({}, { duration: HOLD_DUR })
      .to(msgEl, { opacity: 0, duration: 0.25, ease: 'power1.in' });
  },
};
