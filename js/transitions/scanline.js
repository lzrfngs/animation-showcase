/*
 * Threshold — transition
 * Library: GSAP
 *
 * Both screens are visible simultaneously during the transition.
 * A ghost div (old mode colours) departs while the real panel (new mode)
 * arrives from the opposite direction — they overlap the entire time.
 *
 * personal → work : ghost shrinks back, new screen enters from in front
 * work → personal : ghost advances forward, new screen rises from behind
 *
 * The ghost lives in the overlay (on top). The panel is snapped to the new
 * mode immediately underneath it. Both animate in parallel so neither
 * disappears completely — one pushes the other, or pulls it forward.
 */

const CROSS_DUR = 1.15;  // duration of the simultaneous cross
const HOLD_DUR  = 0.85;

export default {
  id: 'scanline',
  title: 'Threshold',
  description: 'Both screens coexist. One recedes as the other advances, moving through a threshold.',

  play(els, from, to, done) {
    const { panel, overlay, modes } = els;
    const fromMode = modes[from];
    const fromMsg  = fromMode.leaving;
    const pr       = panel.getBoundingClientRect();

    // personal→work: ghost recedes (shrinks), new panel enters from front (large→1)
    // work→personal: ghost advances (grows),  new panel rises from behind (small→1)
    const recede      = to === 'work';
    const ghostTarget = recede ? 0.82 : 1.18;   // where the ghost ends up
    const panelStart  = recede ? 1.18 : 0.82;   // where the panel starts

    // Ghost: a flat reproduction of the old mode's two-column layout.
    // It sits in the overlay on top of the panel throughout the transition.
    overlay.innerHTML = `
      <div id="thresh-ghost" style="
        position:fixed;
        left:${pr.left}px; top:${pr.top}px;
        width:${pr.width}px; height:${pr.height}px;
        border-radius:8px; overflow:hidden;
        display:flex;
      ">
        <div style="width:26%;flex-shrink:0;background:${fromMode.sidebarBg};"></div>
        <div style="flex:1;background:${fromMode.contentBg};border:1px solid ${fromMode.contentBorder};border-left:none;"></div>
      </div>

      <div style="
        position:fixed;
        left:${pr.left}px; top:${pr.top}px;
        width:${pr.width}px; height:${pr.height}px;
        display:flex; align-items:center; justify-content:center;
        pointer-events:none;
      ">
        <div id="thresh-msg" style="
          background:rgba(8,8,8,0.72);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:7px;
          padding:10px 20px;
          display:flex; flex-direction:column; align-items:center; gap:5px;
          backdrop-filter:blur(4px);
          opacity:0;
        ">
          <p style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:500;color:#e0e0e0;text-align:center;margin:0;">${fromMsg.primary}</p>
          <p style="font-family:Inter,system-ui,sans-serif;font-size:11px;color:#888;text-align:center;margin:0;">${fromMsg.secondary}</p>
        </div>
      </div>
    `;
    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const ghost = overlay.querySelector('#thresh-ghost');
    const msg   = overlay.querySelector('#thresh-msg');

    // Snap panel to new mode immediately — it sits behind the ghost
    els.snap(to);

    // Hand the panel transform to GSAP. xPercent/yPercent replicate the CSS
    // translate(-50%,-50%) so scale animates cleanly around the panel centre.
    gsap.set(panel, { xPercent: -50, yPercent: -50, scale: panelStart, opacity: 0 });

    return gsap.timeline({ onComplete: done })

      // Ghost and panel animate in parallel — both screens visible at once
      .to(ghost, {
        scale:   ghostTarget,
        opacity: 0,
        duration: CROSS_DUR,
        ease: 'power3.inOut',
      })
      .to(panel, {
        scale:   1,
        opacity: 1,
        duration: CROSS_DUR,
        ease: 'power3.inOut',
      }, '<')

      // Message comes up as the cross begins and holds until after
      .to(msg, { opacity: 1, duration: 0.3, ease: 'power1.out' }, '<+=0.1')

      // Hold, then message out
      .to({}, { duration: HOLD_DUR })
      .to(msg, { opacity: 0, duration: 0.3, ease: 'power1.in' })

      // Return transform control to CSS so subsequent transitions aren't affected
      .call(() => { gsap.set(panel, { clearProps: 'transform,opacity' }); });
  },
};
