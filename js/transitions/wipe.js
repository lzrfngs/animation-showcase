/*
 * Horizontal Wipe — transition
 * Library: GSAP (clip-path)
 *
 * A hard vertical edge sweeps left-to-right across the panel, dragging the
 * new mode state in behind it. The handoff message is visible in the new
 * panel as it reveals.
 *
 * Positioning: all child elements use coords relative to the overlay,
 * calculated from getBoundingClientRect deltas.
 */

export default {
  id: 'wipe',
  title: 'Horizontal Wipe',
  description: 'A hard edge sweeps left-to-right, dragging the new mode in behind it.',

  play(els, from, to, done) {
    const { panel, overlay, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    // Panel position relative to the overlay (same coordinate space)
    const or = overlay.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const left   = pr.left   - or.left;
    const top    = pr.top    - or.top;
    const width  = pr.width;
    const height = pr.height;

    // A copy of the panel in the new mode, clipped to sweep in from the left
    overlay.innerHTML = `
      <div id="wipe-layer" style="
        position:absolute;
        left:${left}px; top:${top}px;
        width:${width}px; height:${height}px;
        border-radius:8px; overflow:hidden;
        display:flex;
        clip-path:inset(0 100% 0 0 round 8px);
        box-shadow:0 24px 80px rgba(0,0,0,0.35);
      ">
        <div style="width:26%;flex-shrink:0;background:${toMode.sidebarBg};"></div>
        <div style="
          flex:1; background:${toMode.contentBg};
          border:1px solid ${toMode.contentBorder}; border-left:none;
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; padding:28px;
        ">
          <p style="
            font-family:Inter,system-ui,sans-serif; font-size:13px;
            font-weight:500; color:#555; margin-bottom:6px; text-align:center;
          ">${fromMsg.primary}</p>
          <p style="
            font-family:Inter,system-ui,sans-serif; font-size:11px;
            color:#888; text-align:center;
          ">${fromMsg.secondary}</p>
        </div>
      </div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const layer = overlay.querySelector('#wipe-layer');

    gsap.timeline({ onComplete: done })
      // Sweep in — hard edge, decisive pace
      .to(layer, {
        clipPath: 'inset(0 0% 0 0 round 8px)',
        duration: 0.6,
        ease: 'power3.inOut',
      })
      // Brief hold so message reads
      .to({}, { duration: 0.7 });
  },
};
