/*
 * Fade Hold — transition
 * Library: GSAP
 *
 * Viewport snaps to near-black immediately. The handoff message appears,
 * holds, then fades away to reveal the new mode.
 */

export default {
  id: 'fade',
  title: 'Fade Hold',
  description: 'Snaps to near-black. A status message confirms the handoff. Fades back to reveal the new mode.',

  play(els, from, to, done) {
    const { overlay, sidebar, content, brand, avatar, toggle, dot, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    // Build message inside overlay so it sits above the dark layer
    overlay.innerHTML = `
      <div style="
        display:flex; flex-direction:column; align-items:center;
        justify-content:center; height:100%; gap:8px; padding:40px;
        text-align:center; font-family:Inter,system-ui,sans-serif;
        pointer-events:none;
      ">
        <p id="fp" style="font-size:13px;font-weight:500;color:#c8c8c8;opacity:0;">
          ${fromMsg.primary}
        </p>
        <p id="fs" style="font-size:11px;color:#666;opacity:0;">
          ${fromMsg.secondary}
        </p>
      </div>
    `;

    const mp = overlay.querySelector('#fp');
    const ms = overlay.querySelector('#fs');

    gsap.set(overlay, { display: 'block', background: '#080808', opacity: 0 });

    gsap.timeline({ onComplete: done })
      // Snap to black — fast and decisive
      .to(overlay, { opacity: 1, duration: 0.3, ease: 'power3.in' })
      // Snap underlying state while completely hidden
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
      // Message fades in
      .to([mp, ms], { opacity: 1, duration: 0.2, stagger: 0.08, ease: 'power1.out' })
      // Hold
      .to({}, { duration: 0.85 })
      // Message out, then overlay out
      .to([mp, ms], { opacity: 0, duration: 0.15, ease: 'power1.in' })
      .to(overlay, { opacity: 0, duration: 0.35, ease: 'power2.out' });
  },
};
