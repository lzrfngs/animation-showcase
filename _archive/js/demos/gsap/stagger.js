/*
 * GSAP Demo — Stagger
 * The stagger option offsets the start time of each element in an array.
 * 'from' controls which element starts first: 'start', 'end', 'center', 'random', or an index.
 */

export default {
  id: 'stagger',
  label: '03',
  title: 'Stagger',
  description: 'Offset the start time of each element in an array. The "from" option controls which element leads — start, center, end, or random.',

  code: `gsap.from(elements, {
  scaleY:  0,
  opacity: 0,
  duration: 0.5,
  ease: 'power3.out',
  stagger: {
    amount: 0.8,   // total stagger spread in seconds
    from: 'center', // which element starts first
    grid: [6, 10], // tell GSAP about the grid layout
  },
  transformOrigin: 'bottom center',
});`,

  init(container) {
    const w = container.clientWidth;
    const h = container.clientHeight;

    const COLS    = 10;
    const ROWS    = 6;
    const BAR_W   = 28;
    const BAR_H   = 6;
    const GAP_X   = 10;
    const GAP_Y   = 18;

    const gridW = COLS * BAR_W + (COLS - 1) * GAP_X;
    const gridH = ROWS * BAR_H + (ROWS - 1) * GAP_Y;
    const startX = (w - gridW) / 2;
    const startY = (h - gridH) / 2;

    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      position: 'absolute',
      left: `${startX}px`,
      top:  `${startY}px`,
      width:  `${gridW}px`,
      height: `${gridH}px`,
    });
    container.appendChild(wrapper);

    const bars = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const bar = document.createElement('div');
        Object.assign(bar.style, {
          position:  'absolute',
          width:     `${BAR_W}px`,
          height:    `${BAR_H}px`,
          background: '#ccc',
          left: `${c * (BAR_W + GAP_X)}px`,
          top:  `${r * (BAR_H + GAP_Y)}px`,
        });
        wrapper.appendChild(bar);
        bars.push(bar);
      }
    }

    // Sequence through different 'from' values
    const froms = ['center', 'start', 'end', 'random'];
    let phase = 0;

    // Label
    const fromLabel = document.createElement('div');
    Object.assign(fromLabel.style, {
      position:    'absolute',
      fontFamily:  'IBM Plex Mono, monospace',
      fontSize:    '9px',
      letterSpacing: '0.12em',
      color:       '#444',
      left:        `${startX}px`,
      top:         `${startY + gridH + 20}px`,
    });
    container.appendChild(fromLabel);

    const master = gsap.timeline({ repeat: -1 });

    function buildPhase(fromVal) {
      const tl = gsap.timeline();
      tl.call(() => { fromLabel.textContent = `from: '${fromVal}'`; })
        .from(bars, {
          scaleY:  0,
          opacity: 0,
          duration: 0.45,
          ease: 'power3.out',
          stagger: {
            amount: 0.7,
            from: fromVal,
            grid: [ROWS, COLS],
          },
          transformOrigin: 'bottom center',
        })
        .to(bars, {
          scaleY:  0,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.in',
          stagger: {
            amount: 0.5,
            from: fromVal,
            grid: [ROWS, COLS],
          },
          transformOrigin: 'top center',
        }, '+=0.6');
      return tl;
    }

    froms.forEach(from => master.add(buildPhase(from), '+=0.2'));

    return () => {
      master.kill();
      wrapper.remove();
      fromLabel.remove();
    };
  },
};
