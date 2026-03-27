// Animation library registry
// To add a new library: import its demos array and add an entry below.

import gsapDemos from './demos/gsap/index.js';

const registry = [
  {
    id:    'gsap',
    name:  'GSAP',
    demos: gsapDemos,
  },
  // Future libraries:
  // { id: 'threejs', name: 'Three.js', demos: threejsDemos },
  // { id: 'p5',      name: 'p5.js',    demos: p5Demos      },
];

export default registry;
