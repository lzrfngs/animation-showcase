/*
 * Clockwise Ring — transition
 * Library: GSAP (SVG stroke-dashoffset)
 *
 * A bright stroke traces the perimeter of the settings panel clockwise.
 * At the halfway point the brand name swaps. When the trace completes,
 * the ring fades out and the new mode is revealed.
 */

export default {
  id: 'ring',
  title: 'Clockwise Ring',
  description: 'A stroke traces the panel edge clockwise. The brand name flips at the halfway point.',

  play(els, from, to, done) {
    const { panel, overlay, sidebar, content, brand, avatar, toggle, dot, modes } = els;
    const toMode = modes[to];

    const panelRect = panel.getBoundingClientRect();
    const W = panelRect.width;
    const H = panelRect.height;
    const R = 8; // border-radius

    // Perimeter of a rounded rect (approximate)
    const perimeter = 2 * (W + H) - 8 * R + 2 * Math.PI * R;

    // Clockwise path starting from top-left corner, going right along top
    const pathD = `
      M ${R},0
      H ${W - R} A ${R},${R} 0 0 1 ${W},${R}
      V ${H - R} A ${R},${R} 0 0 1 ${W - R},${H}
      H ${R}     A ${R},${R} 0 0 1 0,${H - R}
      V ${R}     A ${R},${R} 0 0 1 ${R},0
      Z
    `;

    overlay.innerHTML = `
      <svg style="
        position: absolute;
        top: ${panelRect.top}px;
        left: ${panelRect.left}px;
        width: ${W}px;
        height: ${H}px;
        overflow: visible;
        pointer-events: none;
      ">
        <path
          id="ring-path"
          d="${pathD}"
          fill="none"
          stroke="#e8e8e8"
          stroke-width="1.5"
          stroke-dasharray="${perimeter}"
          stroke-dashoffset="${perimeter}"
          stroke-linecap="round"
        />
      </svg>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const path     = overlay.querySelector('#ring-path');
    const duration = 1.1;

    gsap.timeline({ onComplete: done })
      // Draw the ring
      .to(path, {
        attr: { 'stroke-dashoffset': 0 },
        duration,
        ease: 'power2.inOut',
        // Swap brand name and snap state at the halfway point
        onUpdate() {
          const progress = this.progress();
          if (progress >= 0.5 && brand.textContent !== toMode.brand) {
            sidebar.style.background  = toMode.sidebarBg;
            content.style.background  = toMode.contentBg;
            content.style.borderColor = toMode.contentBorder;
            avatar.style.background   = toMode.avatarBg;
            toggle.style.background   = toMode.toggleBg;
            toggle.classList.toggle('is-on', toMode.toggleOn);
            gsap.set(dot, { x: toMode.toggleOn ? 14 : 0 });
            brand.textContent = toMode.brand;
          }
        },
      })
      // Brief hold at completion
      .to({}, { duration: 0.15 })
      // Fade the ring out
      .to(path, { opacity: 0, duration: 0.3, ease: 'power1.in' });
  },
};
