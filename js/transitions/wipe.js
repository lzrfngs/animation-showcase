/*
 * Horizontal Wipe — transition
 * Library: GSAP (clip-path)
 */

export default {
  id: 'wipe',
  title: 'Horizontal Wipe',
  description: 'A hard edge sweeps left-to-right, dragging the new mode in behind it.',

  play(els, from, to, done) {
    const { panel, overlay, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;
    const pr      = panel.getBoundingClientRect();

    overlay.innerHTML = `
      <div id="wipe-layer" style="
        position:fixed;
        left:${pr.left}px; top:${pr.top}px;
        width:${pr.width}px; height:${pr.height}px;
        border-radius:8px; overflow:hidden; display:flex;
        clip-path:inset(0 100% 0 0 round 8px);
        box-shadow:0 24px 80px rgba(0,0,0,0.35);
      ">
        <div style="width:26%;flex-shrink:0;background:${toMode.sidebarBg};"></div>
        <div style="
          flex:1; background:${toMode.contentBg};
          border:1px solid ${toMode.contentBorder}; border-left:none;
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; padding:28px; gap:6px;
        ">
          <p style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:500;color:#555;text-align:center;">
            ${fromMsg.primary}
          </p>
          <p style="font-family:Inter,system-ui,sans-serif;font-size:11px;color:#888;text-align:center;">
            ${fromMsg.secondary}
          </p>
        </div>
      </div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    return gsap.timeline({ onComplete: done })
      .to(overlay.querySelector('#wipe-layer'), {
        clipPath: 'inset(0 0% 0 0 round 8px)',
        duration: 0.65,
        ease: 'power3.inOut',
      })
      .to({}, { duration: 0.7 });
  },
};
