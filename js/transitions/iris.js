/*
 * Pixelated Iris — transition
 * Library: GSAP + Canvas API
 *
 * Single-phase reveal with directional diamond wipe.
 * Two canvas layers:
 *   1. Echo layer  — horizontal rectangles of varied length, soft twinkling alpha.
 *                    These fade as the iris reveals the new mode.
 *   2. Iris layer  — diamond pixel wipe with 16-level grey dither at the boundary.
 * Message appears above both layers with a dark backing box.
 *
 * Direction:
 *   personal → work  : centre outward
 *   work → personal  : edge inward
 */

const PIXEL_SIZE  = 18;
const STEPS       = 14;
const FPS         = 9;
const DUR         = STEPS / FPS;
const HOLD_DUR    = 0.8;
const GREY_LEVELS = 16;
const BAND        = 0.20;

export default {
  id: 'iris',
  title: 'Pixelated Iris',
  description: 'Diamond pixel reveal with dithered grey levels and twinkling echo layer.',

  play(els, from, to, done) {
    const { panel, overlay, content, modes } = els;
    const fromMsg    = modes[from].leaving;
    const pixelColor = modes[from].sidebarBg;
    const pr = panel.getBoundingClientRect();

    const cols = Math.ceil(pr.width  / PIXEL_SIZE) + 1;
    const rows = Math.ceil(pr.height / PIXEL_SIZE) + 1;
    const cw   = cols * PIXEL_SIZE;
    const ch   = rows * PIXEL_SIZE;

    // ── Echo canvas (below iris) ─────────────────────────────────────────────
    // Horizontal rectangles of varied length scattered across the panel.
    // They twinkle with smooth sine animation and fade as the iris reveals.
    const echoCanvas = document.createElement('canvas');
    echoCanvas.width  = cw;
    echoCanvas.height = ch;
    echoCanvas.style.cssText = `
      position:fixed; top:${pr.top}px; left:${pr.left}px;
      width:${pr.width}px; height:${pr.height}px;
      display:block; pointer-events:none; border-radius:8px;
    `;
    const echoCtx = echoCanvas.getContext('2d');

    // Generate deterministic echo segments — no Math.random(), same every time
    const echoes = [];
    for (let row = 0; row < rows; row++) {
      const numPerRow = 3 + (row % 3); // 3–5 per row
      for (let e = 0; e < numPerRow; e++) {
        const seed = row * 11 + e * 17;
        echoes.push({
          x:         ((Math.sin(seed * 0.61) * 0.5 + 0.5)) * (cw - PIXEL_SIZE * 4),
          y:         row * PIXEL_SIZE,
          w:         (Math.sin(seed * 1.37) * 0.5 + 0.5) * PIXEL_SIZE * 3.5 + PIXEL_SIZE,
          baseAlpha: (Math.sin(seed * 2.09) * 0.5 + 0.5) * 0.12 + 0.04,
          phase:     seed * 0.94,
          speed:     (Math.sin(seed * 3.71) * 0.5 + 0.5) * 2.5 + 0.8,
        });
      }
    }

    // ── Iris canvas (above echo) ─────────────────────────────────────────────
    const irisCanvas = document.createElement('canvas');
    irisCanvas.width  = cw;
    irisCanvas.height = ch;
    irisCanvas.style.cssText = echoCanvas.style.cssText; // same position/size
    const irisCtx = irisCanvas.getContext('2d');

    // ── Message — centred to the full panel, backed with a dark pill ─────────
    const msgEl = document.createElement('div');
    msgEl.style.cssText = `
      position:fixed;
      left:${pr.left}px; top:${pr.top}px;
      width:${pr.width}px; height:${pr.height}px;
      display:flex; align-items:center; justify-content:center;
      pointer-events:none; opacity:0;
    `;
    msgEl.innerHTML = `
      <div style="
        background:rgba(8,8,8,0.72);
        border:1px solid rgba(255,255,255,0.07);
        border-radius:7px;
        padding:10px 20px;
        display:flex; flex-direction:column; align-items:center; gap:5px;
        backdrop-filter:blur(4px);
      ">
        <p style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:500;color:#e0e0e0;text-align:center;margin:0;">${fromMsg.primary}</p>
        <p style="font-family:Inter,system-ui,sans-serif;font-size:11px;color:#888;text-align:center;margin:0;">${fromMsg.secondary}</p>
      </div>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(echoCanvas);  // bottom
    overlay.appendChild(irisCanvas);  // middle
    overlay.appendChild(msgEl);       // top
    gsap.set(overlay, { display: 'block', background: 'transparent' });

    // Snap new mode immediately — canvases cover it during the reveal
    els.snap(to);

    // ── Cell sort (diamond distance) ─────────────────────────────────────────
    const cx = cols / 2;
    const cy = rows / 2;
    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        cells.push({ c, r, dist: Math.abs(c - cx) + Math.abs(r - cy) });

    const centreFirst = to === 'work';
    cells.sort((a, b) => centreFirst ? a.dist - b.dist : b.dist - a.dist);
    const n = cells.length;

    // ── Draw functions ────────────────────────────────────────────────────────
    irisCtx.fillStyle = pixelColor;

    function drawIris(t) {
      irisCtx.clearRect(0, 0, cw, ch);
      for (let i = 0; i < n; i++) {
        const diff = (i / n) - t;
        let raw = diff <= 0 ? 0 : diff >= BAND ? 1 : diff / BAND;
        // Deterministic per-cell noise to break uniform rings
        raw = Math.max(0, Math.min(1, raw + (Math.sin(cells[i].c * 6.1 + cells[i].r * 9.7) * 0.5 - 0.25) * 0.07));
        const level = Math.round(raw * (GREY_LEVELS - 1)) / (GREY_LEVELS - 1);
        if (level === 0) continue;
        irisCtx.globalAlpha = level;
        irisCtx.fillRect(cells[i].c * PIXEL_SIZE, cells[i].r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
      irisCtx.globalAlpha = 1;
    }

    // Echo twinkling — called on every gsap tick while the iris is active
    echoCtx.fillStyle = pixelColor;
    let irisProgress = 0; // tracked so echoes fade with the reveal

    function drawEchoes(time) {
      echoCtx.clearRect(0, 0, cw, ch);
      const fadeOut = 1 - irisProgress; // echoes dim as iris reveals
      for (const e of echoes) {
        const alpha = e.baseAlpha * (0.5 + 0.5 * Math.sin(time * e.speed + e.phase)) * fadeOut;
        if (alpha < 0.01) continue;
        echoCtx.globalAlpha = alpha;
        echoCtx.fillRect(e.x, e.y, e.w, PIXEL_SIZE - 1);
      }
      echoCtx.globalAlpha = 1;
    }

    // Register ticker — runs every frame for smooth twinkling
    const tickerStart = gsap.ticker.time;
    const tickerFn = () => drawEchoes(gsap.ticker.time - tickerStart);
    gsap.ticker.add(tickerFn);

    // Start fully covered
    drawIris(0);

    const obj = { t: 0 };

    return gsap.timeline({
      onComplete() {
        gsap.ticker.remove(tickerFn);
        done();
      },
    })
      .to(msgEl, { opacity: 1, duration: 0.25, ease: 'power1.out' })
      .to(obj, {
        t: 1,
        duration: DUR,
        ease: `steps(${STEPS})`,
        onUpdate() {
          irisProgress = obj.t;
          drawIris(obj.t);
        },
        onComplete() {
          irisProgress = 1;
          irisCtx.clearRect(0, 0, cw, ch);
          echoCtx.clearRect(0, 0, cw, ch);
        },
      }, '<+=0.15')
      .to({}, { duration: HOLD_DUR })
      .to(msgEl, { opacity: 0, duration: 0.25, ease: 'power1.in' });
  },
};
