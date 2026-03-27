/*
 * GSAP Demo — Tween
 * gsap.fromTo() — animate any set of properties from a start state to an end state.
 * This is the fundamental GSAP building block.
 */

export default {
  id: 'tween',
  label: '01',
  title: 'Tween',
  description: 'The fundamental building block. Animate any property from a defined start state to an end state. Multiple properties change simultaneously within one call.',

  code: `gsap.fromTo(element,
  // FROM
  { x: -160, opacity: 0, rotation: -45, scale: 0.6 },
  // TO
  {
    x: 160,
    opacity: 1,
    rotation: 0,
    scale: 1,
    duration: 1.6,
    ease: 'power3.inOut',
    yoyo: true,
    repeat: -1,
    repeatDelay: 0.6,
  }
)`,

  init(container) {
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Square element
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute',
      width:  '64px',
      height: '64px',
      background: '#d8d8d8',
      top:  `${h / 2}px`,
      left: `${w / 2}px`,
    });
    container.appendChild(el);

    // Center via GSAP, then animate
    gsap.set(el, { xPercent: -50, yPercent: -50 });

    const range = Math.min(140, w * 0.30);

    // Fade in once, then loop the positional tween
    gsap.fromTo(el,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
    );

    const tween = gsap.fromTo(el,
      { x: -range, rotation: -30 },
      {
        x: range,
        rotation: 30,
        duration: 1.6,
        ease: 'power3.inOut',
        yoyo: true,
        repeat: -1,
        repeatDelay: 0.3,
        delay: 0.6,
      }
    );

    return () => {
      tween.kill();
      el.remove();
    };
  },
};
