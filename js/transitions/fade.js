/*
 * Fade Hold — transition
 * Library: GSAP
 */

export default {
  id: 'fade',
  title: 'Fade Hold',
  description: 'Snaps to near-black. A status message confirms the handoff. Fades back to reveal the new mode.',

  play(els, from, to, done) {
    const { overlay, modes } = els;
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

    return gsap.timeline({ onComplete: done })
      .to(overlay, { opacity: 1, duration: 0.25, ease: 'power2.in' })
      .call(() => { els.snap(to); })
      .to([mp, ms], { opacity: 1, duration: 0.2, stagger: 0.07, ease: 'power1.out' })
      .to({}, { duration: 0.85 })
      .to([mp, ms], { opacity: 0, duration: 0.15, ease: 'power1.in' })
      .to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.out' });
  },
};
