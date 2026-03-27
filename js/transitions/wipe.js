/*
 * Horizontal Wipe — transition
 * Library: GSAP
 *
 * A hard vertical edge sweeps left-to-right across the settings panel,
 * dragging the new mode in behind it. The message box is revealed briefly
 * in the new-state content area as the edge passes through.
 */

export default {
  id: 'wipe',
  title: 'Horizontal Wipe',
  description: 'A hard edge sweeps left-to-right across the panel, dragging the new mode in behind it.',

  play(els, from, to, done) {
    const { panel, overlay, msgBox, msgPrim, msgSec, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    const panelRect = panel.getBoundingClientRect();

    // Build a full-panel overlay that looks like the new mode state.
    // It starts clipped to zero width on the left and sweeps right.
    overlay.innerHTML = `
      <div id="wipe-layer" style="
        position: absolute;
        top: ${panelRect.top}px;
        left: ${panelRect.left}px;
        width: ${panelRect.width}px;
        height: ${panelRect.height}px;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        clip-path: inset(0 100% 0 0);
        box-shadow: 0 24px 80px rgba(0,0,0,0.35);
      ">
        <div style="
          width: 170px; flex-shrink: 0;
          background: ${toMode.sidebarBg};
        "></div>
        <div style="
          flex: 1;
          background: ${toMode.contentBg};
          border: 1px solid ${toMode.contentBorder};
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="text-align: center; font-family: Inter, system-ui, sans-serif;">
            <p style="font-size: 12px; font-weight: 500; color: #555; margin-bottom: 6px;">
              ${fromMsg.primary}
            </p>
            <p style="font-size: 10px; color: #888;">
              ${fromMsg.secondary}
            </p>
          </div>
        </div>
      </div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const wipeLayer = overlay.querySelector('#wipe-layer');

    gsap.timeline({ onComplete: done })
      .to(wipeLayer, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.65,
        ease: 'power3.inOut',
      })
      // Hold briefly so message is readable
      .to({}, { duration: 0.7 });
  },
};
