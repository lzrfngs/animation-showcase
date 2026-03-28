/*
 * Cipher — transition
 * Library: GSAP
 *
 * Each panel region is sealed behind a clean dark plane in staggered sequence:
 * sidebar first, then the avatar, then the content area. No noise, no scramble —
 * information becomes featureless, locked behind geometric absence.
 *
 * Mode snaps while everything is sealed. All planes release simultaneously,
 * revealing the new space clean.
 */

const LOCK_COLOR = '#111111';

export default {
  id: 'cipher',
  title: 'Cipher',
  description: 'Each region locks behind a clean plane. Old space sealed. New space revealed.',

  play(els, from, to, done) {
    const { panel, overlay, sidebar, content, avatar, modes } = els;
    const fromMsg = modes[from].leaving;
    const pr = panel.getBoundingClientRect();
    const sR = sidebar.getBoundingClientRect();
    const cR = content.getBoundingClientRect();
    const aR = avatar.getBoundingClientRect();

    // Clean geometric cover elements — no texture, no noise
    function makeCover(r, extraStyle = '') {
      const d = document.createElement('div');
      d.style.cssText = `
        position:fixed;
        left:${r.left}px; top:${r.top}px;
        width:${r.width}px; height:${r.height}px;
        background:${LOCK_COLOR};
        ${extraStyle}
      `;
      return d;
    }

    const cvSide = makeCover(sR, 'border-radius:8px 0 0 8px;');
    const cvCont = makeCover(cR, 'border-radius:0 8px 8px 0;');
    const cvAvat = makeCover(aR, 'border-radius:50%;');

    // Message — centred to full panel, above the covers
    const msgWrap = document.createElement('div');
    msgWrap.style.cssText = `
      position:fixed; left:${pr.left}px; top:${pr.top}px;
      width:${pr.width}px; height:${pr.height}px;
      display:flex; align-items:center; justify-content:center;
      pointer-events:none;
    `;
    msgWrap.innerHTML = `
      <div id="cv-msg" style="
        background:rgba(8,8,8,0.72);
        border:1px solid rgba(255,255,255,0.07);
        border-radius:7px; padding:10px 20px;
        display:flex; flex-direction:column; align-items:center; gap:5px;
        backdrop-filter:blur(4px); opacity:0;
      ">
        <p style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:500;color:#e0e0e0;text-align:center;margin:0;">${fromMsg.primary}</p>
        <p style="font-family:Inter,system-ui,sans-serif;font-size:11px;color:#888;text-align:center;margin:0;">${fromMsg.secondary}</p>
      </div>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(cvSide);
    overlay.appendChild(cvCont);
    overlay.appendChild(cvAvat);  // avatar cover above content cover
    overlay.appendChild(msgWrap); // message always on top
    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const msgEl = msgWrap.querySelector('#cv-msg');

    // Covers start collapsed — will slide in from their left edge
    gsap.set(cvSide, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(cvCont, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(cvAvat, { scale:  0, transformOrigin: 'center center' });

    return gsap.timeline({ onComplete: done })

      // Message appears as the process begins
      .to(msgEl, { opacity: 1, duration: 0.3, ease: 'power1.out' })

      // Sidebar seals — slides in from its left edge
      .to(cvSide, { scaleX: 1, duration: 0.5, ease: 'power3.inOut' }, '<+=0.05')

      // Avatar locks — circle closes over it while content is still open
      .to(cvAvat, { scale: 1, duration: 0.4, ease: 'power2.out' }, '<+=0.25')

      // Content area seals last — the space itself closes
      .to(cvCont, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, '<+=0.12')

      // Hold — everything sealed
      .to({}, { duration: 0.3 })

      // Snap mode underneath — invisible behind the planes
      .call(() => { els.snap(to); })

      // All planes release simultaneously — new space simply appears
      .to([cvSide, cvCont, cvAvat], {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      })

      // Hold, then message out
      .to({}, { duration: 0.85 })
      .to(msgEl, { opacity: 0, duration: 0.3, ease: 'power1.in' });
  },
};
