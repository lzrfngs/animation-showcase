/*
 * Horizontal Wipe — transition
 * Library: GSAP
 *
 * A "window" div grows from left-to-right (overflow:hidden + width animation).
 * The new-mode panel sits inside at full size — the growing window reveals it.
 * No clip-path: avoids GSAP interpolation issues with inset() values.
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

    // Outer "window" — starts at zero width, grows right. overflow:hidden clips it.
    // Inner "layer"  — full size, sits at final position. Revealed as window grows.
    overlay.innerHTML = `
      <div id="wipe-window" style="
        position:fixed;
        left:${pr.left}px; top:${pr.top}px;
        width:0; height:${pr.height}px;
        border-radius:8px; overflow:hidden;
        box-shadow:0 24px 80px rgba(0,0,0,0.35);
      ">
        <div id="wipe-layer" style="
          position:absolute; left:0; top:0;
          width:${pr.width}px; height:${pr.height}px;
          display:flex;
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
      </div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const window_ = overlay.querySelector('#wipe-window');

    return gsap.timeline({ onComplete: done })
      // Grow window left-to-right — content is revealed as edge sweeps across
      .to(window_, { width: pr.width, duration: 0.55, ease: 'power2.out' })
      // Snap underlying panel while fully covered
      .call(() => { els.snap(to); })
      // Hold so message reads
      .to({}, { duration: 0.55 })
      // Fade out — reveals already-snapped panel underneath
      .to(window_, { opacity: 0, duration: 0.2, ease: 'power1.in' });
  },
};
