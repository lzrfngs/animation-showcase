/*
 * Pixelated Iris — transition
 * Library: GSAP + Canvas API
 *
 * Mosaic pixels expand from the panel centre outward, covering only the panel.
 * GSAP steps() ease creates a low-frame-rate, LED-matrix feel (Nothing Phone).
 * Mode snaps while fully covered, then pixels retract the same way.
 */

const PIXEL_SIZE  = 18;
const COVER_COLOR = '#1a1a1a';
const STEPS       = 14;          // discrete frames — lower = choppier
const FPS         = 9;           // target frame rate for the stepped animation
const COVER_DUR   = STEPS / FPS; // ~1.55 s
const UNCOVER_DUR = STEPS / FPS;
const HOLD_DUR    = 1.0;

export default {
  id: 'iris',
  title: 'Pixelated Iris',
  description: 'LED-matrix pixels expand from centre in discrete steps. Mode snaps underneath, then retracts.',

  play(els, from, to, done) {
    const { panel, overlay, content, modes } = els;
    const fromMsg = modes[from].leaving;
    const pr = panel.getBoundingClientRect();
    const cr = content.getBoundingClientRect();

    const cols = Math.ceil(pr.width  / PIXEL_SIZE) + 1;
    const rows = Math.ceil(pr.height / PIXEL_SIZE) + 1;

    // Canvas sits exactly over the panel. CSS border-radius clips the corners.
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

    // Message centered over the content pane, above the canvas in DOM order
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
      <p style="font-size:13px;font-weight:500;color:#c8c8c8;text-align:center;">${fromMsg.primary}</p>
      <p style="font-size:11px;color:#666;text-align:center;">${fromMsg.secondary}</p>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(canvas);
    overlay.appendChild(msgEl);
    gsap.set(overlay, { display: 'block', background: 'transparent' });

    // Sort cells by distance from panel centre — nearest drawn first (iris out)
    const cx = cols / 2;
    const cy = rows / 2;
    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        cells.push({ c, r, dist: Math.hypot(c - cx, r - cy) });
    cells.sort((a, b) => a.dist - b.dist);

    // Draw exactly the first `count` cells (cover) or all except them (uncover)
    function drawCover(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = COVER_COLOR;
      const count = Math.round(t * cells.length);
      for (let i = 0; i < count; i++)
        ctx.fillRect(cells[i].c * PIXEL_SIZE, cells[i].r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }

    function drawUncover(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = COVER_COLOR;
      const count = Math.round((1 - t) * cells.length);
      for (let i = 0; i < count; i++)
        ctx.fillRect(cells[i].c * PIXEL_SIZE, cells[i].r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }

    const coverObj   = { t: 0 };
    const uncoverObj = { t: 0 };

    return gsap.timeline({ onComplete: done })
      // Cover: pixels march outward in discrete steps
      .to(coverObj, {
        t: 1,
        duration: COVER_DUR,
        ease: `steps(${STEPS})`,
        onUpdate()  { drawCover(coverObj.t); },
        onComplete(){ drawCover(1); },
      })

      // Snap mode while fully covered
      .call(() => { els.snap(to); })

      // Message fades in above the pixel field
      .to(msgEl, { opacity: 1, duration: 0.2, ease: 'power1.out' })
      .to({}, { duration: HOLD_DUR })
      .to(msgEl, { opacity: 0, duration: 0.2, ease: 'power1.in' })

      // Uncover: pixels retract inward in discrete steps
      .to(uncoverObj, {
        t: 1,
        duration: UNCOVER_DUR,
        ease: `steps(${STEPS})`,
        onUpdate()  { drawUncover(uncoverObj.t); },
        onComplete(){ ctx.clearRect(0, 0, canvas.width, canvas.height); },
      });
  },
};
