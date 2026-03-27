/*
 * Desaturate → Recolor — transition
 * Library: GSAP (CSS filter)
 *
 * The settings panel drains to greyscale, then the new mode's palette
 * bleeds back in. Works in both directions: stripping the Work blue or
 * restoring it. The brand name swaps at the greyscale peak.
 */

export default {
  id: 'desaturate',
  title: 'Desaturate',
  description: 'The panel drains to greyscale, then recolors into the new mode palette.',

  play(els, from, to, done) {
    const { panel, sidebar, content, brand, avatar, toggle, dot, modes } = els;
    const toMode = modes[to];

    gsap.timeline({ onComplete: done })
      // Drain colour out of the panel
      .to(panel, {
        filter: 'saturate(0) brightness(0.92)',
        duration: 0.5,
        ease: 'power2.inOut',
      })
      // At greyscale peak: snap values — still invisible because filter is applied
      .call(() => {
        sidebar.style.background  = toMode.sidebarBg;
        content.style.background  = toMode.contentBg;
        content.style.borderColor = toMode.contentBorder;
        avatar.style.background   = toMode.avatarBg;
        toggle.style.background   = toMode.toggleBg;
        toggle.classList.toggle('is-on', toMode.toggleOn);
        gsap.set(dot, { x: toMode.toggleOn ? 14 : 0 });
        brand.textContent = toMode.brand;
      })
      // Recolor — filter lifts and new palette blooms in
      .to(panel, {
        filter: 'saturate(1) brightness(1)',
        duration: 0.6,
        ease: 'power2.inOut',
      })
      // Clean up filter so it doesn't linger
      .call(() => {
        panel.style.filter = '';
      });
  },
};
