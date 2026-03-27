/*
 * Fade Hold — transition
 * Library: GSAP
 *
 * A dark translucent veil drops over the panel (not full-black — the UI is
 * still faintly visible beneath it). While the veil is down, the panel
 * element colours animate to the new mode so the change is visible through
 * the overlay. A status message appears, then the veil lifts to reveal the
 * fully-transitioned state.
 */

export default {
  id: 'fade',
  title: 'Fade Hold',
  description: 'A dark veil drops. The UI transitions visibly beneath it. Veil lifts to reveal the new mode.',

  play(els, from, to, done) {
    const { panel, overlay, sidebar, content, avatar, toggle, dot, brand, msgBox, msgPrim, msgSec, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    // The veil covers the full panel but is translucent — you can see the UI shifting
    const pr = panel.getBoundingClientRect();
    overlay.innerHTML = `
      <div id="fade-veil" style="
        position:fixed;
        left:${pr.left}px; top:${pr.top}px;
        width:${pr.width}px; height:${pr.height}px;
        border-radius:8px;
        background:#111;
        opacity:0;
      "></div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const veil = overlay.querySelector('#fade-veil');

    msgPrim.textContent = fromMsg.primary;
    msgSec.textContent  = fromMsg.secondary;

    return gsap.timeline({ onComplete: done })
      // Veil drops — partial opacity so the panel is still faintly visible
      .to(veil, { opacity: 0.82, duration: 0.35, ease: 'power2.inOut' })

      // Message appears in content area
      .call(() => {
        msgBox.style.display = 'flex';
        gsap.fromTo(msgBox, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      })

      // Animate panel elements to new mode — visible through the translucent veil
      .to(sidebar,  { backgroundColor: toMode.sidebarBg, duration: 0.45, ease: 'power1.inOut' }, '<')
      .to(content,  { backgroundColor: toMode.contentBg, duration: 0.45, ease: 'power1.inOut' }, '<')
      .to(avatar,   { backgroundColor: toMode.avatarBg,  duration: 0.45, ease: 'power1.inOut' }, '<')
      .to(toggle,   { backgroundColor: toMode.toggleBg,  duration: 0.3,  ease: 'power1.inOut' }, '<')
      .to(dot,      { x: toMode.toggleOn ? 14 : 0,       duration: 0.3,  ease: 'power2.inOut' }, '<')
      .call(() => { brand.textContent = toMode.brand; }, null, '<+=0.22')

      // Hold so message reads
      .to({}, { duration: 0.45 })

      // Message out
      .call(() => { gsap.to(msgBox, { opacity: 0, duration: 0.15 }); })
      .to({}, { duration: 0.15 })

      // Veil lifts — new mode fully revealed
      .to(veil, { opacity: 0, duration: 0.35, ease: 'power2.inOut' });
  },
};
