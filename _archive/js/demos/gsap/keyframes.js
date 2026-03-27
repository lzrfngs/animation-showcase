/*
 * GSAP Demo — Keyframes
 * The keyframes array lets you define multiple intermediate states in one tween.
 * Each keyframe can have its own ease and duration, giving fine-grained control
 * over each segment independently.
 */

export default {
  id: 'keyframes',
  label: '05',
  title: 'Keyframes',
  description: 'Define multiple intermediate states in one tween. Each keyframe segment can have its own ease and duration — not just the overall animation.',

  code: `gsap.to(element, {
  keyframes: [
    { x: -180, y:    0, rotation:   0, duration: 0.9, ease: 'power2.in'    },
    { x:    0, y: -100, rotation:  90, duration: 0.7, ease: 'power2.inOut' },
    { x:  180, y:    0, rotation: 180, duration: 0.9, ease: 'power2.out'   },
    { x:    0, y:  100, rotation: 270, duration: 0.7, ease: 'power2.inOut' },
    { x: -180, y:    0, rotation: 360, duration: 0.9, ease: 'power2.in'    },
  ],
  repeat: -1,
  repeatDelay: 0.5,
});`,

  init(container) {
    const w = container.clientWidth;
    const h = container.clientHeight;

    const cx = w / 2;
    const cy = h / 2;

    // Diamond path guide (very subtle)
    const RX = 180;
    const RY = 100;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.assign(svg.style, {
      position: 'absolute',
      left: '0', top: '0',
      width: '100%',
      height: '100%',
      overflow: 'visible',
      pointerEvents: 'none',
    });
    svg.setAttribute('width',  w);
    svg.setAttribute('height', h);

    // Diamond path
    const pathPoints = [
      `${cx - RX},${cy}`,
      `${cx},${cy - RY}`,
      `${cx + RX},${cy}`,
      `${cx},${cy + RY}`,
    ];
    const pathD = `M ${pathPoints[0]} L ${pathPoints[1]} L ${pathPoints[2]} L ${pathPoints[3]} Z`;

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', pathD);
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke', '#1c1c1c');
    pathEl.setAttribute('stroke-width', '1');
    svg.appendChild(pathEl);

    // Corner dots
    pathPoints.forEach(pt => {
      const [px, py] = pt.split(',').map(Number);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', px);
      circle.setAttribute('cy', py);
      circle.setAttribute('r',  3);
      circle.setAttribute('fill', '#2a2a2a');
      svg.appendChild(circle);
    });

    container.appendChild(svg);

    // Animated square
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute',
      width:  '20px',
      height: '20px',
      background: '#d8d8d8',
      left: `${cx}px`,
      top:  `${cy}px`,
    });
    container.appendChild(el);

    gsap.set(el, { xPercent: -50, yPercent: -50, x: -RX, y: 0 });

    const tween = gsap.to(el, {
      keyframes: [
        { x: -RX,  y:   0, rotation:   0, duration: 0.9, ease: 'power2.in'    },
        { x:    0, y: -RY, rotation:  90, duration: 0.7, ease: 'power2.inOut' },
        { x:  RX,  y:   0, rotation: 180, duration: 0.9, ease: 'power2.out'   },
        { x:    0, y:  RY, rotation: 270, duration: 0.7, ease: 'power2.inOut' },
        { x: -RX,  y:   0, rotation: 360, duration: 0.9, ease: 'power2.in'    },
      ],
      repeat: -1,
      repeatDelay: 0.5,
    });

    return () => {
      tween.kill();
      el.remove();
      svg.remove();
    };
  },
};
