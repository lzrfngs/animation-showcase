/*
 * Scan Line — transition
 * Library: GSAP
 *
 * A bright horizontal line sweeps from the top to the bottom of the settings
 * panel. Above the line the new mode colour bleeds in; below remains the old
 * state. A message box in the content area fades in as the line passes through.
 */

export default {
  id: 'scanline',
  title: 'Scan Line',
  description: 'A bright line sweeps top-to-bottom. Content above has already transitioned; below has not.',

  play(els, from, to, done) {
    const { panel, overlay, sidebar, content, brand, avatar, toggle, dot, msgBox, msgPrim, msgSec, modes } = els;
    const toMode  = modes[to];
    const fromMsg = modes[from].leaving;

    const panelRect = panel.getBoundingClientRect();
    const W = panelRect.width;
    const H = panelRect.height;

    // The colour that bleeds in above the scan line (new mode's dominant tone)
    const newColor = toMode.contentBg;

    overlay.innerHTML = `
      <!-- Bleed layer: new mode colour, clipped to grow from top -->
      <div id="scan-bleed" style="
        position: absolute;
        top: ${panelRect.top}px;
        left: ${panelRect.left}px;
        width: ${W}px;
        height: ${H}px;
        border-radius: 8px;
        background: ${newColor};
        clip-path: inset(0 0 100% 0);
        opacity: 0.55;
      "></div>

      <!-- The scan line itself -->
      <div id="scan-line" style="
        position: absolute;
        left: ${panelRect.left}px;
        width: ${W}px;
        height: 1.5px;
        top: ${panelRect.top}px;
        background: linear-gradient(90deg, transparent, #e8e8e8 20%, #ffffff 50%, #e8e8e8 80%, transparent);
        box-shadow: 0 0 8px rgba(255,255,255,0.7);
      "></div>
    `;

    gsap.set(overlay, { display: 'block', background: 'transparent' });

    const bleed    = overlay.querySelector('#scan-bleed');
    const scanLine = overlay.querySelector('#scan-line');
    const duration = 0.9;

    // Set up message content (shown in panel, not overlay)
    msgPrim.textContent = fromMsg.primary;
    msgSec.textContent  = fromMsg.secondary;

    gsap.timeline({ onComplete: done })
      // Sweep line from top to bottom, bleed follows
      .to(scanLine, {
        y: H,
        duration,
        ease: 'power1.inOut',
      })
      .to(bleed, {
        clipPath: 'inset(0 0 0% 0)',
        duration,
        ease: 'power1.inOut',
      }, '<')
      // Show message mid-sweep
      .call(() => {
        msgBox.style.display = 'flex';
        gsap.fromTo(msgBox, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      }, null, duration * 0.35)
      // Snap underlying state while bleed covers the panel
      .call(() => {
        sidebar.style.background  = toMode.sidebarBg;
        content.style.background  = toMode.contentBg;
        content.style.borderColor = toMode.contentBorder;
        avatar.style.background   = toMode.avatarBg;
        toggle.style.background   = toMode.toggleBg;
        toggle.classList.toggle('is-on', toMode.toggleOn);
        gsap.set(dot, { x: toMode.toggleOn ? 14 : 0 });
        brand.textContent = toMode.brand;
      }, null, duration * 0.9)
      // Hold so message is readable
      .to({}, { duration: 0.6 })
      // Fade out the overlay
      .to(overlay, { opacity: 0, duration: 0.3, ease: 'power1.in' });
  },
};
