/*
 * Desaturate → Recolor — transition
 * Library: GSAP (CSS filter)
 *
 * The panel drains to greyscale. Mode snaps at peak grey, message appears,
 * then the new palette blooms back in as the filter lifts.
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
      .to(panel, { filter: 'saturate(0) brightness(0.88)', duration: 0.4, ease: 'power2.inOut' })
      .call(() => {
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
      })
      .to({}, { duration: 0.5 })
      .call(() => {
        gsap.to(msgBox, { opacity: 0, duration: 0.15 });
      })
      .to(panel, { filter: 'saturate(1) brightness(1)', duration: 0.45, ease: 'power2.inOut' })
      .call(() => { panel.style.filter = ''; });
  },
};
