/*
 * Clockwise Ring — transition
 * Library: GSAP (SVG stroke-dashoffset)
 */

export default {
  id: 'ring',
  title: 'Clockwise Ring',
  description: 'A stroke traces the panel edge clockwise. Mode snaps at the halfway point.',

  play(els, from, to, done) {
    const { panel, overlay, msgBox, msgPrim, msgSec, modes } = els;
    const fromMsg = modes[from].leaving;

    const pr = panel.getBoundingClientRect();
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

    overlay.innerHTML = `
      <svg style="position:fixed;left:${pr.left}px;top:${pr.top}px;width:${W}px;height:${H}px;overflow:visible;pointer-events:none;">
        <path id="ring-path"
          d="${pathD}" fill="none"
          stroke="#e8e8e8" stroke-width="2"
          stroke-dasharray="${perimeter}" stroke-dashoffset="${perimeter}"
        />
      </svg>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const path    = overlay.querySelector('#ring-path');
    let   snapped = false;

    msgPrim.textContent = fromMsg.primary;
    msgSec.textContent  = fromMsg.secondary;

    return gsap.timeline({ onComplete: done })
      .to(path, {
        attr: { 'stroke-dashoffset': 0 },
        duration: 1.0,
        ease: 'power2.inOut',
        onUpdate() {
          if (!snapped && this.progress() >= 0.5) {
            snapped = true;
            els.snap(to);
            msgBox.style.display = 'flex';
            gsap.fromTo(msgBox, { opacity: 0 }, { opacity: 1, duration: 0.2 });
          }
        },
      })
      .to({}, { duration: 0.4 })
      .call(() => { gsap.to(msgBox, { opacity: 0, duration: 0.15 }); })
      .to(path, { opacity: 0, duration: 0.25, ease: 'power1.in' });
  },
};
