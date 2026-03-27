/*
 * Transition Registry
 *
 * To add a new transition:
 *   1. Create js/transitions/your-transition.js
 *      — export default { id, title, description, play(els, from, to, done) {} }
 *   2. Import it below
 *   3. Add it to the array — order determines sidebar order
 */

import fade       from './transitions/fade.js';
import wipe       from './transitions/wipe.js';
import ring       from './transitions/ring.js';
import iris       from './transitions/iris.js';
import scanline   from './transitions/scanline.js';
import desaturate from './transitions/desaturate.js';

export default [fade, wipe, ring, iris, scanline, desaturate];
