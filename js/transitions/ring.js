/*
 * Clockwise Ring — transition
 * Library: GSAP (SVG stroke-dashoffset)
 *
 * A bright stroke traces the panel perimeter clockwise. At the halfway point
 * the mode snaps underneath. The ring fades out once complete.
 *
 * Positioning: SVG is placed at the panel's position relative to the overlay.
 */

export default {
  id: 'ring',
  title: 'Clockwise Ring',
  description: 'A stroke traces the panel edge clockwise. Mode snaps at the halfway point.',

  play(els, from, to, done) {
    const { panel, overlay, sidebar, content, brand, avatar, toggle, dot, msgBox, msgPrim, msgSec, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    // Panel position relative to overlay
    const or = overlay.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const left   = pr.left   - or.left;
    const top    = pr.top    - or.top;
    const W      = pr.width;
    const H      = pr.height;
    const R      = 8;

    // Approximate perimeter of rounded rect
    const perimeter = 2 * (W + H) - 8 * R + 2 * Math.PI * R;

    // Clockwise path from top-left
    const pathD = [
      `M ${R},0`,
      `H ${W - R} A ${R},${R} 0 0 1 ${W},${R}`,
      `V ${H - R} A ${R},${R} 0 0 1 ${W - R},${H}`,
      `H ${R}     A ${R},${R} 0 0 1 0,${H - R}`,
      `V ${R}     A ${R},${R} 0 0 1 ${R},0 Z`,
    ].join(' ');

    overlay.innerHTML = `
      <svg style="
        position:absolute; left:${left}px; top:${top}px;
        width:${W}px; height:${H}px; overflow:visible; pointer-events:none;
      ">
        <path id="ring-path"
          d="${pathD}" fill="none"
          stroke="#e8e8e8" stroke-width="2"
          stroke-dasharray="${perimeter}" stroke-dashoffset="${perimeter}"
          stroke-linecap="butt"
        />
      </svg>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const path     = overlay.querySelector('#ring-path');
    const duration = 1.0;
    let   snapped  = false;

    // Set up message in the panel content area
    msgPrim.textContent = fromMsg.primary;
    msgSec.textContent  = fromMsg.secondary;

    gsap.timeline({ onComplete: done })
      .to(path, {
        attr: { 'stroke-dashoffset': 0 },
        duration,
        ease: 'power2.inOut',
        onUpdate() {
          // Snap state at the halfway point of the draw
          if (!snapped && this.progress() >= 0.5) {
            snapped = true;
            sidebar.style.background  = toMode.sidebarBg;
            content.style.background  = toMode.contentBg;
            content.style.borderColor = toMode.contentBorder;
            avatar.style.background   = toMode.avatarBg;
            toggle.style.background   = toMode.toggleBg;
            toggle.classList.toggle('is-on', toMode.toggleOn);
            gsap.set(dot, { x: toMode.toggleOn ? 14 : 0 });
            brand.textContent = toMode.brand;
            // Show message as ring crosses the panel
            msgBox.style.display = 'flex';
            gsap.fromTo(msgBox, { opacity: 0 }, { opacity: 1, duration: 0.2 });
          }
        },
      })
      // Hold so message reads
      .to({}, { duration: 0.5 })
      // Fade ring out
      .to(path, { opacity: 0, duration: 0.25, ease: 'power1.in' });
  },
};
