/*
 * Scan Line — transition
 * Library: GSAP
 */

const MSG_APPEAR_AT = 0.45; // show message at this fraction of the sweep duration

export default {
  id: 'scanline',
  title: 'Scan Line',
  description: 'A bright line sweeps top-to-bottom. Content above has already transitioned.',

  play(els, from, to, done) {
    const { panel, overlay, msgBox, msgPrim, msgSec, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;
    const pr      = panel.getBoundingClientRect();

    overlay.innerHTML = `
      <div id="scan-bleed" style="
        position:fixed;
        left:${pr.left}px; top:${pr.top}px;
        width:${pr.width}px; height:${pr.height}px;
        border-radius:8px;
        background:${toMode.contentBg};
        clip-path:inset(0 0 100% 0 round 8px);
        opacity:0.55;
      "></div>
      <div id="scan-line" style="
        position:fixed;
        left:0; width:100%; height:2px;
        top:${pr.top}px;
        background:linear-gradient(90deg,transparent,#c8c8c8 15%,#ffffff 50%,#c8c8c8 85%,transparent);
        box-shadow:0 0 10px rgba(255,255,255,0.5),0 0 2px #fff;
      "></div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const bleed    = overlay.querySelector('#scan-bleed');
    const scanLine = overlay.querySelector('#scan-line');
    const duration = 0.75;

    msgPrim.textContent = fromMsg.primary;
    msgSec.textContent  = fromMsg.secondary;

    return gsap.timeline({ onComplete: done })
      .to(scanLine, { y: pr.height, duration, ease: 'power1.inOut' })
      .to(bleed, { clipPath: 'inset(0 0 0% 0 round 8px)', duration, ease: 'power1.inOut' }, '<')
      .call(() => {
        msgBox.style.display = 'flex';
        gsap.fromTo(msgBox, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      }, null, duration * MSG_APPEAR_AT)
      .call(() => { els.snap(to); }, null, duration * 0.92)
      .to({}, { duration: 0.55 })
      .call(() => { gsap.to(msgBox, { opacity: 0, duration: 0.15 }); })
      .to(overlay, { opacity: 0, duration: 0.25, ease: 'power1.in' });
  },
};
