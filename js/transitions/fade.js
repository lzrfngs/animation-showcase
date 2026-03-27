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

    // The veil covers the full panel but is translucent — you can see the UI shifting.
    // The message div sits after the veil in the DOM so it renders on top of it.
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
      <div id="fade-msg" style="
        position:fixed;
        left:${pr.left}px; top:${pr.top}px;
        width:${pr.width}px; height:${pr.height}px;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:6px;
        opacity:0; pointer-events:none;
      ">
        <p style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:500;color:#e0e0e0;text-align:center;">${fromMsg.primary}</p>
        <p style="font-family:Inter,system-ui,sans-serif;font-size:11px;color:#888;text-align:center;">${fromMsg.secondary}</p>
      </div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const veil   = overlay.querySelector('#fade-veil');
    const fadeMsg = overlay.querySelector('#fade-msg');

    return gsap.timeline({ onComplete: done })
      // Veil drops — partial opacity so the panel is still faintly visible
      .to(veil, { opacity: 0.82, duration: 0.45, ease: 'power2.inOut' })

      // Message appears above the veil
      .to(fadeMsg, { opacity: 1, duration: 0.25, ease: 'power1.out' }, '<+=0.3')

      // Animate panel elements to new mode — visible through the translucent veil
      .to(sidebar,  { backgroundColor: toMode.sidebarBg, duration: 0.55, ease: 'power1.inOut' }, '<')
      .to(content,  { backgroundColor: toMode.contentBg, duration: 0.55, ease: 'power1.inOut' }, '<')
      .to(avatar,   { backgroundColor: toMode.avatarBg,  duration: 0.55, ease: 'power1.inOut' }, '<')
      .to(toggle,   { backgroundColor: toMode.toggleBg,  duration: 0.4,  ease: 'power1.inOut' }, '<')
      .to(dot,      { x: toMode.toggleOn ? 14 : 0,       duration: 0.4,  ease: 'power2.inOut' }, '<')
      .call(() => { brand.textContent = toMode.brand; }, null, '<+=0.28')

      // Hold so message reads
      .to({}, { duration: 1.1 })

      // Message out
      .to(fadeMsg, { opacity: 0, duration: 0.2, ease: 'power1.in' })

      // Veil lifts — new mode fully revealed
      .to(veil, { opacity: 0, duration: 0.45, ease: 'power2.inOut' }, '<+=0.1');
  },
};
