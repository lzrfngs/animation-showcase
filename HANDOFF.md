# Animation Showcase — Handoff Notes

## Original ask
Build a passive showcase/reference tool that visualises animation libraries — letting the user see each library in action. Start with GSAP, designed to expand to others later. Structured project (not a single file). No build step.

---

## What's been built

A dark, minimal browser-based reference tool. Left sidebar lists libraries and demos. Clicking a demo loads it into the main viewport, plays it on loop, and shows the key GSAP code in a syntax-highlighted panel below.

**Served via:** `python3 -m http.server 4400` from the project root (requires a server for ES modules).

---

## File structure

```
animation-showcase/
  index.html                  — App shell, loads GSAP + Prism.js from CDN
  style.css                   — All styles (layout, typography, code panel)
  js/
    app.js                    — Nav builder, demo lifecycle (init/destroy), code display
    registry.js               — Master library registry (add new libraries here)
    demos/
      gsap/
        index.js              — Exports all GSAP demos as an array
        tween.js              — gsap.fromTo() demo
        timeline.js           — gsap.timeline() demo
        stagger.js            — stagger option demo
        easing.js             — 8-ease comparison demo
        keyframes.js          — keyframes array demo
```

---

## Architecture

- **ES modules** throughout (`type="module"`). Must be served, not opened via `file://`.
- **Registry pattern** — `registry.js` imports library demo arrays. To add Three.js or p5, add a new entry there.
- **Demo module contract:** each demo file exports a default object with:
  ```js
  {
    id: 'tween',
    label: '01',
    title: 'Tween',
    description: '...',
    code: `...`,        // shown in the code panel
    init(container) {   // receives the viewport div
      // creates DOM elements, starts GSAP animations
      return () => {    // cleanup function — kills tweens, removes elements
        tween.kill()
        container.innerHTML = ''
      }
    }
  }
  ```
- **Demo lifecycle** managed by `app.js`: calls `cleanup()` on previous demo before calling `init()` on new one.
- All animations are **DOM-based** (no canvas). GSAP targets elements created dynamically inside the viewport div.

---

## CDN dependencies (index.html)

- **GSAP 3.12.5** — `gsap.min.js` from cdnjs
- **IBM Plex Mono + IBM Plex Sans** — Google Fonts
- **Prism.js 1.29.0** — syntax highlighting (tomorrow theme, overridden to monochrome)

---

## Current GSAP demos

| Label | Title | Concept shown |
|-------|-------|---------------|
| 01 | Tween | `gsap.fromTo()` — x, rotation, scale, opacity, yoyo |
| 02 | Timeline | `gsap.timeline()` — sequential chaining |
| 03 | Stagger | `stagger` option — grid of elements, from: 'center' |
| 04 | Easing | 8 eases compared side-by-side (linear → expo.out → back.out) |
| 05 | Keyframes | `keyframes` array — per-keyframe ease and duration |

---

## Design decisions made

- **Palette:** greyscale only — `#0c0c0c` bg, `#131313` surface, `#222` borders, `#ccc`/`#eee` text. No accent colour chosen yet.
- **Typography:** IBM Plex Sans (UI) + IBM Plex Mono (code/labels). Demo title at 56px bold; all supporting text at 10–12px. No middle ground.
- **Layout:** 220px fixed sidebar / flex main area / 200px fixed code panel at bottom.
- **Motion:** all demos loop with `repeat: -1`. Easing is considered (power3.inOut etc.) — no defaults, no bounce.
- **Prism theme:** overridden to monochrome — default colour theme was replaced with grey token colours to match the palette.

---

## What the user hasn't decided yet

- **Accent colour** — currently none. Ask before adding any colour.
- **Font** — IBM Plex was chosen as a sensible default for a technical tool; user hasn't signed off. Ask if type becomes more prominent.
- **Additional demos** — no direction given yet on what to add next within GSAP (ScrollTrigger, MotionPath, Flip, etc.)
- **Next library** — registry is prepped for Three.js and p5.js but nothing started.

---

## Obvious next steps

1. Add more GSAP demos — ScrollTrigger, MotionPath, Flip plugin, `gsap.matchMedia()`
2. Add a **replay button** — useful for demos with long repeatDelays
3. Add **Three.js** library section to the registry
4. Consider a **search/filter** for when the demo list grows
5. Consider **keyboard nav** (arrow keys between demos)
6. The code panel currently shows a hand-written snippet — could show the actual live source

---

## How to run

```bash
cd ~/Desktop/animation-showcase
python3 -m http.server 4400
# open http://localhost:4400
```
