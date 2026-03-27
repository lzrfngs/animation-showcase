/*
 * Threshold — transition
 * Library: GSAP
 *
 * The whole panel moves through a threshold — one screen departs in one
 * direction while the new one arrives from the opposite direction.
 *
 * personal → work : old screen recedes (shrinks away), new enters from front
 * work → personal : old screen advances (grows toward viewer), new from behind
 *
 * Implemented by animating scale + opacity on the panel element directly.
 * GSAP takes control of the panel transform (xPercent/yPercent preserve
 * the CSS centering) and cleans up at the end.
 */

const DEPART_DUR = 0.62;
const ARRIVE_DUR = 0.62;
const HOLD_DUR   = 0.75;

export default {
  id: 'scanline',   // keep id so registry doesn't need changing
  title: 'Threshold',
  description: 'The UI recedes or advances through a threshold. New screen enters from the opposite direction.',

  play(els, from, to, done) {
    const { panel, overlay, modes } = els;
    const fromMsg = modes[from].leaving;
    const pr      = panel.getBoundingClientRect();

    // personal→work: old screen recedes (scale down), new arrives from front (scale down to 1)
    // work→personal: old screen advances (scale up),  new arrives from behind (scale up to 1)
    const recede       = to === 'work';
    const departScale  = recede ? 0.84 : 1.16;
    const arrivalScale = recede ? 1.16 : 0.84;

    // Message with dark pill backdrop — centered to full panel, above everything
    overlay.innerHTML = `
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

    const msg = overlay.querySelector('#thresh-msg');

    // Hand the panel transform to GSAP — xPercent/yPercent replicate the CSS
    // translate(-50%,-50%) centering so scale animates around the panel centre
    gsap.set(panel, { xPercent: -50, yPercent: -50, scale: 1, opacity: 1 });

    return gsap.timeline({ onComplete: done })

      // Message appears as departure begins
      .to(msg, { opacity: 1, duration: 0.25, ease: 'power1.out' })

      // Old screen departs
      .to(panel, {
        scale:   departScale,
        opacity: 0,
        duration: DEPART_DUR,
        ease: 'power2.inOut',
      }, '<')

      // Snap new mode; reposition panel at the opposite end of the z-axis
      .call(() => {
        els.snap(to);
        gsap.set(panel, { scale: arrivalScale, opacity: 0 });
      })

      // New screen arrives — settles into place
      .to(panel, {
        scale:   1,
        opacity: 1,
        duration: ARRIVE_DUR,
        ease: 'power2.inOut',
      })

      // Hold, then message out
      .to({}, { duration: HOLD_DUR })
      .to(msg, { opacity: 0, duration: 0.25, ease: 'power1.in' })

      // Return transform control to CSS
      .call(() => { gsap.set(panel, { clearProps: 'transform,opacity' }); });
  },
};
