/*
 * Fade Hold — transition
 * Library: GSAP
 *
 * Fades the viewport to near-black. The handoff message appears over the dark
 * overlay, then the overlay fades out to reveal the new mode.
 * Message text lives inside the overlay so it sits above everything.
 */

export default {
  id: 'fade',
  title: 'Fade Hold',
  description: 'Fades to near-black. A status message confirms the handoff. Fades back to reveal the new mode.',

  play(els, from, to, done) {
    const { overlay, sidebar, content, brand, avatar, toggle, dot, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    // Build message markup inside the overlay so it sits above everything
    overlay.innerHTML = `
      <div style="
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; height: 100%; gap: 8px; padding: 40px;
        text-align: center; font-family: Inter, system-ui, sans-serif;
        pointer-events: none;
      ">
        <p id="fade-msg-primary" style="
          font-size: 13px; font-weight: 500; color: #c8c8c8; opacity: 0;
        ">${fromMsg.primary}</p>
        <p id="fade-msg-secondary" style="
          font-size: 11px; color: #666; opacity: 0;
        ">${fromMsg.secondary}</p>
      </div>
    `;

    const msgPrim = overlay.querySelector('#fade-msg-primary');
    const msgSec  = overlay.querySelector('#fade-msg-secondary');

    gsap.set(overlay, { display: 'block', background: '#080808', opacity: 0 });

    gsap.timeline({ onComplete: done })
      // Fade to black
      .to(overlay, { opacity: 1, duration: 0.4, ease: 'power2.inOut' })
      // Snap underlying state while fully hidden
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
      // Reveal message over black
      .to([msgPrim, msgSec], { opacity: 1, duration: 0.25, stagger: 0.1, ease: 'power1.out' })
      // Hold
      .to({}, { duration: 1.0 })
      // Dismiss message
      .to([msgPrim, msgSec], { opacity: 0, duration: 0.2, ease: 'power1.in' })
      // Fade overlay out — reveals new mode
      .to(overlay, { opacity: 0, duration: 0.4, ease: 'power2.inOut' });
      // done() fires via onComplete, which calls applyMode for final cleanup
  },
};
