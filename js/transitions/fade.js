/*
 * Fade Hold — transition
 * Library: GSAP
 *
 * Snaps to near-black. Handoff message appears, holds, then reveals new mode.
 * Overlay is position:fixed so it covers everything regardless of stacking.
 */

export default {
  id: 'fade',
  title: 'Fade Hold',
  description: 'Snaps to near-black. A status message confirms the handoff. Fades back to reveal the new mode.',

  play(els, from, to, done) {
    const { overlay, sidebar, content, brand, avatar, toggle, dot, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    overlay.innerHTML = `
      <div style="
        display:flex; flex-direction:column; align-items:center;
        justify-content:center; height:100%; gap:8px; padding:40px;
        text-align:center; font-family:Inter,system-ui,sans-serif; pointer-events:none;
      ">
        <p id="fp" style="font-size:13px;font-weight:500;color:#c8c8c8;opacity:0;">${fromMsg.primary}</p>
        <p id="fs" style="font-size:11px;color:#666;opacity:0;">${fromMsg.secondary}</p>
      </div>
    `;

    const mp = overlay.querySelector('#fp');
    const ms = overlay.querySelector('#fs');

    gsap.set(overlay, { display: 'block', background: '#0a0a0a', opacity: 0 });

    gsap.timeline({ onComplete: done })
      .to(overlay, { opacity: 1, duration: 0.25, ease: 'power2.in' })
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
      .to([mp, ms], { opacity: 1, duration: 0.2, stagger: 0.07, ease: 'power1.out' })
      .to({}, { duration: 0.85 })
      .to([mp, ms], { opacity: 0, duration: 0.15, ease: 'power1.in' })
      .to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.out' });
  },
};
