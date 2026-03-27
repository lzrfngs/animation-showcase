/*
 * Desaturate → Recolor — transition
 * Library: GSAP (CSS filter)
 *
 * The panel drains to greyscale. At the grey peak the mode snaps and a
 * message appears in the content area. Then the filter lifts and the new
 * palette blooms back in.
 */

export default {
  id: 'desaturate',
  title: 'Desaturate',
  description: 'Panel drains to greyscale, then recolors into the new mode palette.',

  play(els, from, to, done) {
    const { panel, sidebar, content, brand, avatar, toggle, dot, msgBox, msgPrim, msgSec, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    msgPrim.textContent = fromMsg.primary;
    msgSec.textContent  = fromMsg.secondary;

    gsap.timeline({ onComplete: done })
      // Drain colour
      .to(panel, { filter: 'saturate(0) brightness(0.9)', duration: 0.45, ease: 'power2.inOut' })
      // At greyscale peak: snap values + show message
      .call(() => {
        sidebar.style.background  = toMode.sidebarBg;
        content.style.background  = toMode.contentBg;
        content.style.borderColor = toMode.contentBorder;
        avatar.style.background   = toMode.avatarBg;
        toggle.style.background   = toMode.toggleBg;
        toggle.classList.toggle('is-on', toMode.toggleOn);
        gsap.set(dot, { x: toMode.toggleOn ? 14 : 0 });
        brand.textContent = toMode.brand;
        // Message appears during the grey hold
        msgBox.style.display = 'flex';
        gsap.fromTo(msgBox, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      })
      // Hold at grey so message reads
      .to({}, { duration: 0.55 })
      // Recolor — new palette blooms in
      .to(panel, { filter: 'saturate(1) brightness(1)', duration: 0.5, ease: 'power2.inOut' })
      // Clean up filter property
      .call(() => { panel.style.filter = ''; });
  },
};
