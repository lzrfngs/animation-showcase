/*
 * Bloom — transition
 * Library: GSAP + Canvas API
 *
 * A radial light blooms from the centre of the panel, flooding it with warm
 * or cool white light depending on the destination mode. The mode snaps at
 * full bloom — completely hidden under the light — then the light recedes to
 * reveal the new state.
 *
 * Two overlapping radial gradients give the bloom depth:
 *   Outer halo  — wide, soft, low opacity  (ambient wash)
 *   Inner bloom — tight, bright, full opacity at peak (the light source)
 *
 * Bloom colour:
 *   → work     : cool white  rgba(248, 252, 255)
 *   → personal : warm amber  rgba(255, 250, 238)
 */

const RISE_DUR = 0.9;   // bloom expanding to full coverage
const FALL_DUR = 0.9;   // bloom receding
const HOLD_DUR = 0.85;  // pause after reveal before message fades

export default {
  id: 'desaturate',
  title: 'Bloom',
  description: 'A radial light floods the panel. Mode snaps underneath at peak. Light recedes to reveal it.',

  play(els, from, to, done) {
    const { panel, overlay, modes } = els;
    const fromMsg = modes[from].leaving;
    const pr      = panel.getBoundingClientRect();

    const cw  = pr.width;
    const ch  = pr.height;
    const cx  = cw / 2;
    const cy  = ch / 2;
    // Diagonal from centre to corner — radius at which bloom fully covers the panel
    const maxR = Math.hypot(cx, cy);

    // Bloom tint — subtle colour shift signals which world you're moving into
    const tint = to === 'work'
      ? { r: 245, g: 250, b: 255 }   // cool white — professional, digital
      : { r: 255, g: 249, b: 236 };  // warm amber — personal, organic
    const { r, g, b } = tint;

    const canvas = document.createElement('canvas');
    canvas.width  = cw;
    canvas.height = ch;
    canvas.style.cssText = `
      position:fixed; top:${pr.top}px; left:${pr.left}px;
      width:${cw}px; height:${ch}px;
      display:block; pointer-events:none; border-radius:8px;
    `;
    const ctx = canvas.getContext('2d');

    // Message — centred to the full panel, dark pill, above the canvas
    const msgEl = document.createElement('div');
    msgEl.style.cssText = `
      position:fixed; left:${pr.left}px; top:${pr.top}px;
      width:${cw}px; height:${ch}px;
      display:flex; align-items:center; justify-content:center;
      pointer-events:none; opacity:0;
    `;
    msgEl.innerHTML = `
      <div style="
        background:rgba(8,8,8,0.68);
        border:1px solid rgba(255,255,255,0.07);
        border-radius:7px; padding:10px 20px;
        display:flex; flex-direction:column; align-items:center; gap:5px;
        backdrop-filter:blur(4px);
      ">
        <p style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:500;color:#e0e0e0;text-align:center;margin:0;">${fromMsg.primary}</p>
        <p style="font-family:Inter,system-ui,sans-serif;font-size:11px;color:#888;text-align:center;margin:0;">${fromMsg.secondary}</p>
      </div>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(canvas);
    overlay.appendChild(msgEl);
    gsap.set(overlay, { display: 'block', background: 'transparent' });

    // p: 0 = no light, 1 = full bloom
    function draw(p) {
      ctx.clearRect(0, 0, cw, ch);
      if (p <= 0) return;

      const outerR = maxR * p;
      const innerR = maxR * p * 0.5;

      // Outer halo — wide ambient wash, soft falloff
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      halo.addColorStop(0,    `rgba(${r},${g},${b},${0.6 * p})`);
      halo.addColorStop(0.4,  `rgba(${r},${g},${b},${0.35 * p})`);
      halo.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, cw, ch);

      // Inner bloom — the light source itself, saturated and bright
      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
      bloom.addColorStop(0,    `rgba(${r},${g},${b},${p})`);
      bloom.addColorStop(0.2,  `rgba(${r},${g},${b},${0.98 * p})`);
      bloom.addColorStop(0.55, `rgba(${r},${g},${b},${0.72 * p})`);
      bloom.addColorStop(0.85, `rgba(${r},${g},${b},${0.2 * p})`);
      bloom.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, cw, ch);
    }

    // Two separate tween objects so onUpdate closures are clean
    const riseObj = { p: 0 };
    const fallObj = { p: 1 };

    return gsap.timeline({ onComplete: done })

      // Bloom rises — light builds from centre outward
      .to(riseObj, {
        p: 1,
        duration: RISE_DUR,
        ease: 'power2.in',
        onUpdate()  { draw(riseObj.p); },
        onComplete(){ draw(1); },
      })

      // Message appears as the bloom peaks — legible against the washed-out panel
      .to(msgEl, { opacity: 1, duration: 0.3, ease: 'power1.out' }, `<+=${RISE_DUR * 0.55}`)

      // Snap at full bloom — the mode change is invisible under the light
      .call(() => { els.snap(to); })

      // Bloom falls — light recedes back to centre, new mode revealed
      .to(fallObj, {
        p: 0,
        duration: FALL_DUR,
        ease: 'power3.out',
        onUpdate()  { draw(fallObj.p); },
        onComplete(){ ctx.clearRect(0, 0, cw, ch); },
      })

      // Hold, then message out
      .to({}, { duration: HOLD_DUR })
      .to(msgEl, { opacity: 0, duration: 0.3, ease: 'power1.in' });
  },
};
