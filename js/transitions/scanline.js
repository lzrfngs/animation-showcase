/*
 * Scan Line — transition
 * Library: GSAP
 *
 * A bright horizontal line sweeps the full width of the viewport from top
 * to bottom. Above the line the new mode colour is already present; below
 * is still old. The mode snaps when the line exits the panel.
 *
 * Positioning: all overlay children use coords relative to the overlay.
 */

export default {
  id: 'scanline',
  title: 'Scan Line',
  description: 'A bright line sweeps top-to-bottom. Content above has already transitioned.',

  play(els, from, to, done) {
    const { panel, overlay, sidebar, content, brand, avatar, toggle, dot, msgBox, msgPrim, msgSec, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    const or = overlay.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();

    // All coords relative to overlay
    const panelTop    = pr.top    - or.top;
    const panelBottom = pr.bottom - or.top;
    const panelLeft   = pr.left   - or.left;
    const panelWidth  = pr.width;
    const totalH      = or.height;

    overlay.innerHTML = `
      <!-- Colour bleed: new-mode tint, clipped to grow downward from top of panel -->
      <div id="scan-bleed" style="
        position:absolute;
        left:${panelLeft}px; top:${panelTop}px;
        width:${panelWidth}px; height:${pr.height}px;
        border-radius:8px;
        background:${toMode.contentBg};
        clip-path:inset(0 0 100% 0 round 8px);
        opacity:0.5;
      "></div>

      <!-- The scan line: full viewport width, starts at top of panel -->
      <div id="scan-line" style="
        position:absolute;
        left:0; width:100%; height:2px;
        top:${panelTop}px;
        background:linear-gradient(90deg,transparent,#d0d0d0 15%,#ffffff 50%,#d0d0d0 85%,transparent);
        box-shadow:0 0 10px rgba(255,255,255,0.6), 0 0 2px rgba(255,255,255,0.9);
      "></div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const bleed    = overlay.querySelector('#scan-bleed');
    const scanLine = overlay.querySelector('#scan-line');
    const travelY  = panelBottom - panelTop; // distance line travels (panel height)
    const duration = 0.75;

    // Message in the panel content area
    msgPrim.textContent = fromMsg.primary;
    msgSec.textContent  = fromMsg.secondary;

    gsap.timeline({ onComplete: done })
      // Line sweeps down, bleed follows
      .to(scanLine, { y: travelY, duration, ease: 'power1.inOut' })
      .to(bleed, { clipPath: 'inset(0 0 0% 0 round 8px)', duration, ease: 'power1.inOut' }, '<')
      // Show message as line reaches lower half
      .call(() => {
        msgBox.style.display = 'flex';
        gsap.fromTo(msgBox, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      }, null, duration * 0.5)
      // Snap underlying state just before line exits
      .call(() => {
        sidebar.style.background  = toMode.sidebarBg;
        content.style.background  = toMode.contentBg;
        content.style.borderColor = toMode.contentBorder;
        avatar.style.background   = toMode.avatarBg;
        toggle.style.background   = toMode.toggleBg;
        toggle.classList.toggle('is-on', toMode.toggleOn);
        gsap.set(dot, { x: toMode.toggleOn ? 14 : 0 });
        brand.textContent = toMode.brand;
      }, null, duration * 0.92)
      // Hold — message readable
      .to({}, { duration: 0.6 })
      // Fade overlay out
      .to(overlay, { opacity: 0, duration: 0.3, ease: 'power1.in' });
  },
};
