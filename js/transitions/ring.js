/*
 * Clockwise Ring — transition
 * Library: GSAP (SVG stroke-dashoffset)
 */

export default {
  id: 'ring',
  title: 'Clockwise Ring',
  description: 'A stroke traces the panel edge clockwise. Mode snaps at the halfway point.',

  play(els, from, to, done) {
    const { panel, overlay, content, msgBox, msgPrim, msgSec, modes } = els;
    const fromMsg = modes[from].leaving;

    const pr = panel.getBoundingClientRect();
    const cr = content.getBoundingClientRect();
    const W  = pr.width;
    const H  = pr.height;
    const R  = 8;

    // Exact perimeter: straight segments + quarter-circle arcs
    const perimeter = 2 * (W - 2 * R) + 2 * (H - 2 * R) + 2 * Math.PI * R;

    const pathD = [
      `M ${R},0`,
      `H ${W - R} A ${R},${R} 0 0 1 ${W},${R}`,
      `V ${H - R} A ${R},${R} 0 0 1 ${W - R},${H}`,
      `H ${R}     A ${R},${R} 0 0 1 0,${H - R}`,
      `V ${R}     A ${R},${R} 0 0 1 ${R},0 Z`,
    ].join(' ');

    // SVG first, message div on top (later in DOM = higher stacking order)
    overlay.innerHTML = `
      <svg style="position:fixed;left:${pr.left}px;top:${pr.top}px;width:${W}px;height:${H}px;overflow:visible;pointer-events:none;">
        <defs>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path id="ring-path"
          d="${pathD}" fill="none"
          stroke="#d8d8d8" stroke-width="3.5"
          stroke-dasharray="${perimeter}" stroke-dashoffset="${perimeter}"
          filter="url(#ring-glow)"
        />
      </svg>
      <div id="ring-msg" style="
        position:fixed;
        left:${cr.left}px; top:${cr.top}px;
        width:${cr.width}px; height:${cr.height}px;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:6px;
        opacity:0; pointer-events:none;
      ">
        <p style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:500;color:#e0e0e0;text-align:center;">${fromMsg.primary}</p>
        <p style="font-family:Inter,system-ui,sans-serif;font-size:11px;color:#888;text-align:center;">${fromMsg.secondary}</p>
      </div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const path    = overlay.querySelector('#ring-path');
    const ringMsg = overlay.querySelector('#ring-msg');
    let   snapped = false;

    return gsap.timeline({ onComplete: done })
      .to(path, {
        attr: { 'stroke-dashoffset': 0 },
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate() {
          if (!snapped && this.progress() >= 0.5) {
            snapped = true;
            els.snap(to);
            gsap.to(ringMsg, { opacity: 1, duration: 0.3, ease: 'power1.out' });
          }
        },
      })
      .to({}, { duration: 1.0 })
      .to(ringMsg, { opacity: 0, duration: 0.2, ease: 'power1.in' })
      .to(path,    { opacity: 0, duration: 0.35, ease: 'power1.in' }, '<+=0.1');
  },
};
