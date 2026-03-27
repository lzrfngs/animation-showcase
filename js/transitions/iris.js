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
 * Distance metric: Manhattan (|dx|+|dy|) gives a diamond shape.
 * GSAP steps() ease → chunky LED-matrix frames.
 * Each frame, pixels near the reveal boundary get 16-level grey alpha —
 * the wipe edge looks dithered and alive rather than a hard binary line.
 */

const PIXEL_SIZE  = 18;
const STEPS       = 14;          // discrete frames — lower = choppier
const FPS         = 9;
const DUR         = STEPS / FPS; // ~1.55 s
const HOLD_DUR    = 0.8;
const GREY_LEVELS = 16;          // alpha quantization levels at the boundary
const BAND        = 0.20;        // fraction of the sorted-cell range that transitions

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
    // Each cell's opacity is determined by how far it sits from the reveal boundary.
    // Within a band of BAND width, alpha is quantized to GREY_LEVELS discrete steps.
    // Deterministic per-cell noise breaks up the perfectly uniform gradient edge.
    const n = cells.length;
    ctx.fillStyle = pixelColor;

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < n; i++) {
        // cellProgress: 0 = first to reveal, 1 = last to reveal
        const cellProgress = i / n;
        // How far ahead of the current reveal front is this cell?
        // positive → still covered, negative → already revealed
        const diff = cellProgress - t;

        let raw; // 0 = fully revealed, 1 = fully covered
        if (diff <= 0)    raw = 0;
        else if (diff >= BAND) raw = 1;
        else raw = diff / BAND;

        // Subtle deterministic noise per cell — breaks uniform banding
        const noise = (Math.sin(cells[i].c * 6.1 + cells[i].r * 9.7) * 0.5 + 0.5 - 0.5) * 0.07;
        raw = Math.max(0, Math.min(1, raw + noise));

        // Quantize to GREY_LEVELS
        const level = Math.round(raw * (GREY_LEVELS - 1)) / (GREY_LEVELS - 1);
        if (level === 0) continue;

        ctx.globalAlpha = level;
        ctx.fillRect(cells[i].c * PIXEL_SIZE, cells[i].r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
      ctx.globalAlpha = 1;
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
