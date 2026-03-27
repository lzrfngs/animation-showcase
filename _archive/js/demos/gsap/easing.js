/*
 * GSAP Demo — Easing
 * Compare 8 ease functions side by side.
 * All start simultaneously — the shape of each curve determines
 * how the element accelerates and decelerates over the same duration.
 */

export default {
  id: 'easing',
  label: '04',
  title: 'Easing',
  description: 'Eight ease functions running simultaneously over the same duration. The curve determines how velocity changes over time — from linear to extreme acceleration.',

  code: `// Each track uses the same duration — only ease changes
gsap.to(el, { x: trackWidth, duration: 2, ease: 'power1.out', repeat: -1, repeatDelay: 0.8 });
gsap.to(el, { x: trackWidth, duration: 2, ease: 'power2.out', repeat: -1, repeatDelay: 0.8 });
gsap.to(el, { x: trackWidth, duration: 2, ease: 'power4.out', repeat: -1, repeatDelay: 0.8 });
gsap.to(el, { x: trackWidth, duration: 2, ease: 'expo.out',   repeat: -1, repeatDelay: 0.8 });
gsap.to(el, { x: trackWidth, duration: 2, ease: 'circ.out',   repeat: -1, repeatDelay: 0.8 });
gsap.to(el, { x: trackWidth, duration: 2, ease: 'back.out',   repeat: -1, repeatDelay: 0.8 });
gsap.to(el, { x: trackWidth, duration: 2, ease: 'sine.out',   repeat: -1, repeatDelay: 0.8 });
gsap.to(el, { x: trackWidth, duration: 2, ease: 'linear',     repeat: -1, repeatDelay: 0.8 });`,

  init(container) {
    const w = container.clientWidth;
    const h = container.clientHeight;

    const eases = [
      { name: 'power1.out', label: 'power1.out' },
      { name: 'power2.out', label: 'power2.out' },
      { name: 'power3.out', label: 'power3.out' },
      { name: 'power4.out', label: 'power4.out' },
      { name: 'expo.out',   label: 'expo.out'   },
      { name: 'circ.out',   label: 'circ.out'   },
      { name: 'back.out(1.4)', label: 'back.out'  },
      { name: 'none',       label: 'linear'     },
    ];

    const LABEL_W  = 80;
    const PADDING  = 24;
    const DOT_SIZE = 10;
    const DURATION = 2;
    const DELAY    = 0.9;

    const trackW = w - PADDING * 2 - LABEL_W - 24;
    const totalH = eases.length * (h - PADDING * 2) / eases.length;
    const rowH   = (h - PADDING * 2) / eases.length;

    const tweens = [];
    const elements = [];

    eases.forEach((ease, i) => {
      const y = PADDING + i * rowH + rowH / 2;

      // Label
      const label = document.createElement('div');
      Object.assign(label.style, {
        position:    'absolute',
        fontFamily:  'IBM Plex Mono, monospace',
        fontSize:    '10px',
        letterSpacing: '0.06em',
        color:       '#484848',
        top:         `${y - 6}px`,
        left:        `${PADDING}px`,
        width:       `${LABEL_W}px`,
      });
      label.textContent = ease.label;
      container.appendChild(label);
      elements.push(label);

      const trackLeft = PADDING + LABEL_W + 16;

      // Track line
      const track = document.createElement('div');
      Object.assign(track.style, {
        position: 'absolute',
        left:     `${trackLeft}px`,
        top:      `${y}px`,
        width:    `${trackW}px`,
        height:   '1px',
        background: '#1e1e1e',
      });
      container.appendChild(track);
      elements.push(track);

      // End tick
      const endTick = document.createElement('div');
      Object.assign(endTick.style, {
        position: 'absolute',
        left:     `${trackLeft + trackW}px`,
        top:      `${y - 4}px`,
        width:    '1px',
        height:   '8px',
        background: '#2a2a2a',
      });
      container.appendChild(endTick);
      elements.push(endTick);

      // Indicator dot
      const dot = document.createElement('div');
      Object.assign(dot.style, {
        position:   'absolute',
        width:      `${DOT_SIZE}px`,
        height:     `${DOT_SIZE}px`,
        background: '#d8d8d8',
        left:       `${trackLeft - DOT_SIZE / 2}px`,
        top:        `${y - DOT_SIZE / 2}px`,
      });
      container.appendChild(dot);
      elements.push(dot);

      // Animate
      const tween = gsap.fromTo(dot,
        { x: 0 },
        {
          x: trackW,
          duration: DURATION,
          ease: ease.name,
          repeat: -1,
          repeatDelay: DELAY,
        }
      );
      tweens.push(tween);
    });

    return () => {
      tweens.forEach(t => t.kill());
      elements.forEach(el => el.remove());
    };
  },
};
