/*
 * Scan Line — transition
 * Library: GSAP
 *
 * A bright horizontal line sweeps the full viewport width from the top of the
 * panel to its bottom. A colour bleed follows above. Mode snaps as the line
 * exits. Overlay is position:fixed — all coords from getBoundingClientRect().
 */

export default {
  id: 'scanline',
  title: 'Scan Line',
  description: 'A bright line sweeps top-to-bottom. Content above has already transitioned.',

  play(els, from, to, done) {
    const { panel, overlay, sidebar, content, brand, avatar, toggle, dot, msgBox, msgPrim, msgSec, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    const pr = panel.getBoundingClientRect();

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
        box-shadow:0 0 10px rgba(255,255,255,0.5), 0 0 2px #fff;
      "></div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const bleed    = overlay.querySelector('#scan-bleed');
    const scanLine = overlay.querySelector('#scan-line');
    const travelY  = pr.height;
    const duration = 0.75;

    msgPrim.textContent = fromMsg.primary;
    msgSec.textContent  = fromMsg.secondary;

    gsap.timeline({ onComplete: done })
      .to(scanLine, { y: travelY, duration, ease: 'power1.inOut' })
      .to(bleed, { clipPath: 'inset(0 0 0% 0 round 8px)', duration, ease: 'power1.inOut' }, '<')
      .call(() => {
        msgBox.style.display = 'flex';
        gsap.fromTo(msgBox, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      }, null, duration * 0.45)
      .call(() => {
        sidebar.style.background  = toMode.sidebarBg;
        content.style.background  = toMode.contentBg;
        content.style.borderColor = toMode.contentBorder;
        avatar.style.background   = toMode.avatarBg;
        toggle.style.background   = toMode.toggleBg;
        toggle.classList.toggle('is-on', toMode.toggleOn);
        gsap.set(dot, { x: toMode.toggleOn ? 14 : 0 });
        brand.textContent = toMode.brand;
      }, null, duration * 0.92)
      .to({}, { duration: 0.55 })
      .call(() => {
        gsap.to(msgBox, { opacity: 0, duration: 0.15 });
      })
      .to(overlay, { opacity: 0, duration: 0.25, ease: 'power1.in' });
  },
};
