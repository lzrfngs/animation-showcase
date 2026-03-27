/*
 * Clockwise Ring — transition
 * Library: GSAP (SVG stroke-dashoffset)
 *
 * A bright stroke traces the panel perimeter clockwise. Mode snaps at the
 * halfway point. Ring fades out on completion.
 * Overlay is position:fixed — SVG uses getBoundingClientRect() directly.
 */

export default {
  id: 'ring',
  title: 'Clockwise Ring',
  description: 'A stroke traces the panel edge clockwise. Mode snaps at the halfway point.',

  play(els, from, to, done) {
    const { panel, overlay, sidebar, content, brand, avatar, toggle, dot, msgBox, msgPrim, msgSec, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    const pr = panel.getBoundingClientRect();
    const W  = pr.width;
    const H  = pr.height;
    const R  = 8;

    // Approximate perimeter of a rounded rect
    const perimeter = 2 * (W + H) - 8 * R + 2 * Math.PI * R;

    // Clockwise path from top-left corner
    const pathD = [
      `M ${R},0`,
      `H ${W - R} A ${R},${R} 0 0 1 ${W},${R}`,
      `V ${H - R} A ${R},${R} 0 0 1 ${W - R},${H}`,
      `H ${R}     A ${R},${R} 0 0 1 0,${H - R}`,
      `V ${R}     A ${R},${R} 0 0 1 ${R},0 Z`,
    ].join(' ');

    overlay.innerHTML = `
      <svg style="
        position:fixed;
        left:${pr.left}px; top:${pr.top}px;
        width:${W}px; height:${H}px;
        overflow:visible; pointer-events:none;
      ">
        <path id="ring-path"
          d="${pathD}" fill="none"
          stroke="#e8e8e8" stroke-width="2"
          stroke-dasharray="${perimeter}" stroke-dashoffset="${perimeter}"
        />
      </svg>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const path    = overlay.querySelector('#ring-path');
    const dur     = 1.0;
    let   snapped = false;

    msgPrim.textContent = fromMsg.primary;
    msgSec.textContent  = fromMsg.secondary;

    gsap.timeline({ onComplete: done })
      .to(path, {
        attr: { 'stroke-dashoffset': 0 },
        duration: dur,
        ease: 'power2.inOut',
        onUpdate() {
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
            msgBox.style.display = 'flex';
            gsap.fromTo(msgBox, { opacity: 0 }, { opacity: 1, duration: 0.2 });
          }
        },
      })
      .to({}, { duration: 0.4 })
      .call(() => {
        gsap.to(msgBox, { opacity: 0, duration: 0.15 });
      })
      .to(path, { opacity: 0, duration: 0.25, ease: 'power1.in' });
  },
};
