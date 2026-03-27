/*
 * GSAP Demo — Timeline
 * gsap.timeline() — chain animations in precise sequence.
 * Each .to()/.from() call is placed after the previous by default.
 * Use position parameter (e.g. '-=0.2') for overlap.
 */

export default {
  id: 'timeline',
  label: '02',
  title: 'Timeline',
  description: 'Chain animations in sequence with precise control. Each step plays after the last — use the position parameter to create overlaps or gaps.',

  code: `const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power2.inOut',
    transformOrigin: 'left center' })
  .from(dot, { scale: 0, opacity: 0, duration: 0.3, ease: 'back.out(2)' })
  .to(dot, { x: trackWidth, duration: 1.4, ease: 'power3.inOut' })
  .from(label, { opacity: 0, y: 8, duration: 0.4, ease: 'power2.out' }, '-=0.3')
  .to([dot, label, line], { opacity: 0, duration: 0.4, stagger: 0.08 }, '+=0.6');`,

  init(container) {
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Track metrics
    const trackW  = Math.min(w * 0.62, 560);
    const trackX  = (w - trackW) / 2;
    const trackY  = h / 2;
    const dotSize = 10;

    // Horizontal track line
    const line = document.createElement('div');
    Object.assign(line.style, {
      position: 'absolute',
      width:  `${trackW}px`,
      height: '1px',
      background: '#333',
      left: `${trackX}px`,
      top:  `${trackY}px`,
    });
    container.appendChild(line);

    // Start cap
    const capStart = document.createElement('div');
    Object.assign(capStart.style, {
      position: 'absolute',
      width:  `${dotSize}px`,
      height: `${dotSize}px`,
      background: '#555',
      left: `${trackX - dotSize / 2}px`,
      top:  `${trackY - dotSize / 2}px`,
    });
    container.appendChild(capStart);

    // Traveling dot
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position: 'absolute',
      width:  `${dotSize}px`,
      height: `${dotSize}px`,
      background: '#e8e8e8',
      left: `${trackX - dotSize / 2}px`,
      top:  `${trackY - dotSize / 2}px`,
    });
    container.appendChild(dot);

    // End label
    const label = document.createElement('div');
    Object.assign(label.style, {
      position: 'absolute',
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize:   '10px',
      letterSpacing: '0.12em',
      color: '#888',
      left: `${trackX + trackW + 16}px`,
      top:  `${trackY - 6}px`,
      whiteSpace: 'nowrap',
    });
    label.textContent = 'COMPLETE';
    container.appendChild(label);

    // Step labels below the track
    const steps = [
      { pct: 0,    text: 'line draws' },
      { pct: 0,    text: 'dot appears' },
      { pct: 1,    text: 'dot travels' },
    ];

    const stepEls = steps.map(({ pct, text }) => {
      const el = document.createElement('div');
      Object.assign(el.style, {
        position: 'absolute',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize:   '9px',
        letterSpacing: '0.08em',
        color: '#333',
        left: `${trackX + pct * trackW}px`,
        top:  `${trackY + 20}px`,
      });
      el.textContent = text;
      container.appendChild(el);
      return el;
    });

    // Set initial states
    gsap.set(line,     { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(dot,      { scale: 0, opacity: 0 });
    gsap.set(label,    { opacity: 0 });
    gsap.set(capStart, { opacity: 0 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });

    tl.to(line, { scaleX: 1, duration: 1, ease: 'power2.inOut' })
      .to(capStart, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }, '-=0.15')
      .to(dot, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' })
      .to(dot, { x: trackW, duration: 1.4, ease: 'power3.inOut' })
      .to(label, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.35')
      .to([dot, label, capStart, line], { opacity: 0, duration: 0.4, stagger: 0.06 }, '+=0.7');

    return () => {
      tl.kill();
      [line, capStart, dot, label, ...stepEls].forEach(el => el.remove());
    };
  },
};
