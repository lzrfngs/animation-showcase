/*
 * Desaturate → Recolor — transition
 * Library: GSAP (CSS filter)
 */

export default {
  id: 'desaturate',
  title: 'Desaturate',
  description: 'Panel drains to greyscale, then recolors into the new mode palette.',

  play(els, from, to, done) {
    const { panel, msgBox, msgPrim, msgSec, modes } = els;
    const fromMsg = modes[from].leaving;

    msgPrim.textContent = fromMsg.primary;
    msgSec.textContent  = fromMsg.secondary;

    return gsap.timeline({ onComplete: done })
      .to(panel, { filter: 'saturate(0) brightness(0.88)', duration: 0.4, ease: 'power2.inOut' })
      .call(() => {
        els.snap(to);
        msgBox.style.display = 'flex';
        gsap.fromTo(msgBox, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      })
      .to({}, { duration: 0.5 })
      .call(() => { gsap.to(msgBox, { opacity: 0, duration: 0.15 }); })
      .to(panel, { filter: 'saturate(1) brightness(1)', duration: 0.45, ease: 'power2.inOut' })
      .call(() => { panel.style.filter = ''; });
  },
};
