/*
 * Horizontal Wipe — transition
 * Library: GSAP (clip-path)
 *
 * A hard edge sweeps left-to-right across the panel, revealing the new mode.
 * clip-path uses plain inset() values (no 'round' keyword) — GSAP can't
 * reliably interpolate the round shorthand. Rounded corners come from
 * border-radius + overflow:hidden on the layer itself.
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

    const layer = overlay.querySelector('#wipe-layer');

    // Set initial clip-path via gsap.set so GSAP knows the start value for sure.
    // No 'round' keyword — rounded corners handled by border-radius above.
    gsap.set(layer, { clipPath: 'inset(0 100% 0 0)' });

    return gsap.timeline({ onComplete: done })
      // Sweep in — power2.out starts immediately and visibly, decelerates at end
      .to(layer, { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power2.out' })
      // Snap underlying panel while it's covered by the wipe-layer
      .call(() => { els.snap(to); })
      // Hold so message is readable
      .to({}, { duration: 0.55 })
      // Fade wipe-layer out — reveals the already-snapped panel underneath
      .to(layer, { opacity: 0, duration: 0.2, ease: 'power1.in' });
  },
};
