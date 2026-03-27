/*
 * Pixelated Iris — transition
 * Library: GSAP + Canvas API
 *
 * A mosaic of square pixels expands outward from the center of the viewport,
 * covering the screen. The mode snaps underneath, then the pixels retract
 * back to center — revealing the new state.
 *
 * Pixel size and color can be tuned below.
 */

const PIXEL_SIZE    = 20;   // px per mosaic cell
const COVER_COLOR   = '#1a1a1a';  // color of expanding pixels
const COVER_DUR     = 0.55; // seconds to fully cover
const UNCOVER_DUR   = 0.55; // seconds to fully uncover
const HOLD_DUR      = 0.1;  // pause at full coverage

export default {
  id: 'iris',
  title: 'Pixelated Iris',
  description: 'Mosaic pixels expand from center outward, covering the screen. Mode snaps underneath, then pixels retract.',

  play(els, from, to, done) {
    const { overlay, sidebar, content, brand, avatar, toggle, dot, modes } = els;
    const toMode = modes[to];

    const W = overlay.offsetWidth  || window.innerWidth;
    const H = overlay.offsetHeight || window.innerHeight;

    const cols = Math.ceil(W / PIXEL_SIZE) + 1;
    const rows = Math.ceil(H / PIXEL_SIZE) + 1;

    // Build canvas
    const canvas = document.createElement('canvas');
    canvas.width  = cols * PIXEL_SIZE;
    canvas.height = rows * PIXEL_SIZE;
    canvas.style.cssText = 'position:absolute;top:0;left:0;display:block;';
    const ctx = canvas.getContext('2d');

    overlay.innerHTML = '';
    overlay.appendChild(canvas);
    gsap.set(overlay, { display: 'block', background: 'transparent' });

    // Build cell list with distance from center
    const cx = cols / 2;
    const cy = rows / 2;
    const cells = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const dx = col - cx;
        const dy = row - cy;
        cells.push({ col, row, dist: Math.sqrt(dx * dx + dy * dy) });
      }
    }

    const maxDist = Math.max(...cells.map(c => c.dist));

    // Draw cells up to a given normalised radius (0–1)
    function drawCover(radius) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = COVER_COLOR;
      for (const cell of cells) {
        if (cell.dist / maxDist <= radius) {
          ctx.fillRect(
            cell.col * PIXEL_SIZE,
            cell.row * PIXEL_SIZE,
            PIXEL_SIZE,
            PIXEL_SIZE
          );
        }
      }
    }

    // Draw cells OUTSIDE a given radius (for uncover phase)
    function drawUncover(radius) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = COVER_COLOR;
      for (const cell of cells) {
        if (cell.dist / maxDist > radius) {
          ctx.fillRect(
            cell.col * PIXEL_SIZE,
            cell.row * PIXEL_SIZE,
            PIXEL_SIZE,
            PIXEL_SIZE
          );
        }
      }
    }

    const obj = { r: 0 };

    gsap.timeline({ onComplete: done })
      // Phase 1: cover — pixels spread outward from center
      .to(obj, {
        r: 1,
        duration: COVER_DUR,
        ease: 'power2.in',
        onUpdate() { drawCover(obj.r); },
        onComplete() { drawCover(1); },
      })
      // Snap underlying state while fully covered
      .call(() => {
        sidebar.style.background  = toMode.sidebarBg;
        content.style.background  = toMode.contentBg;
        content.style.borderColor = toMode.contentBorder;
        avatar.style.background   = toMode.avatarBg;
        toggle.style.background   = toMode.toggleBg;
        toggle.classList.toggle('is-on', toMode.toggleOn);
        gsap.set(dot, { x: toMode.toggleOn ? 14 : 0 });
        brand.textContent = toMode.brand;
        obj.r = 0; // reset for uncover phase
      })
      .to({}, { duration: HOLD_DUR })
      // Phase 2: uncover — pixels retract back to center
      .to(obj, {
        r: 1,
        duration: UNCOVER_DUR,
        ease: 'power2.out',
        onUpdate() { drawUncover(obj.r); },
        onComplete() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
      });
  },
};
