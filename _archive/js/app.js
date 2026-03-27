/*
 * Animation Showcase — App
 * Handles navigation, demo lifecycle (init / destroy), and code display.
 */

import registry from './registry.js';

const nav        = document.getElementById('nav');
const viewport   = document.getElementById('demo-viewport');
const titleEl    = document.getElementById('demo-title');
const descEl     = document.getElementById('demo-description');
const numEl      = document.getElementById('demo-num');
const libEl      = document.getElementById('demo-lib');
const codeEl     = document.getElementById('code-display');

let currentCleanup = null;

// ── Build navigation ──────────────────────────────────────────────────────────

registry.forEach(library => {
  const section = document.createElement('div');
  section.className = 'nav-section';

  const sectionLabel = document.createElement('div');
  sectionLabel.className = 'nav-section__label';
  sectionLabel.textContent = library.name;
  section.appendChild(sectionLabel);

  library.demos.forEach(demo => {
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.libraryId = library.id;
    item.dataset.demoId    = demo.id;

    const num = document.createElement('span');
    num.className = 'nav-item__num';
    num.textContent = demo.label;

    const name = document.createElement('span');
    name.textContent = demo.title;

    item.appendChild(num);
    item.appendChild(name);
    item.addEventListener('click', () => loadDemo(library, demo, item));
    section.appendChild(item);
  });

  nav.appendChild(section);
});

// ── Demo lifecycle ────────────────────────────────────────────────────────────

function loadDemo(library, demo, navItem) {
  // Teardown previous
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }
  viewport.innerHTML = '';

  // Update active nav state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('is-active'));
  if (navItem) navItem.classList.add('is-active');

  // Update header
  numEl.textContent   = demo.label;
  libEl.textContent   = library.name;
  titleEl.textContent = demo.title;
  descEl.textContent  = demo.description;

  // Update code — wait for Prism to be ready
  codeEl.textContent = demo.code;
  if (window.Prism) {
    Prism.highlightElement(codeEl);
  } else {
    // Prism loads deferred; re-highlight once available
    window.addEventListener('load', () => Prism.highlightElement(codeEl), { once: true });
  }

  // Init demo — slight delay so viewport has correct dimensions
  requestAnimationFrame(() => {
    currentCleanup = demo.init(viewport) ?? null;
  });
}

// ── Load first demo on start ──────────────────────────────────────────────────

const firstLibrary = registry[0];
const firstDemo    = firstLibrary?.demos[0];
const firstNavItem = nav.querySelector('.nav-item');

if (firstLibrary && firstDemo) {
  loadDemo(firstLibrary, firstDemo, firstNavItem);
}
