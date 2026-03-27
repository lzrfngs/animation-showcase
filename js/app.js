/*
 * Transition Prototype — App
 *
 * To add a transition: create js/transitions/your-file.js, register in registry.js.
 * Transition contract: play(els, from, to, done) → GSAPTimeline
 *   - els      : shared DOM refs + helpers (see below)
 *   - from/to  : mode strings ('personal' | 'work')
 *   - done()   : call when animation fully completes
 *   - return   : the root GSAPTimeline (allows app to kill it if needed)
 */

import registry from './registry.js';

// ── DOM refs ──────────────────────────────────────────────────────────────────

const nav       = document.getElementById('nav');
const sidebarEl = document.getElementById('mockup-sidebar');
const contentEl = document.getElementById('mockup-content');
const brandEl   = document.getElementById('brand-name');
const avatarEl  = document.getElementById('avatar');
const toggleEl  = document.getElementById('toggle');
const dotEl     = document.getElementById('toggle-dot');
const msgBoxEl  = document.getElementById('message-box');
const msgPrimEl = document.getElementById('message-primary');
const msgSecEl  = document.getElementById('message-secondary');
const overlayEl = document.getElementById('overlay');
const nameEl    = document.getElementById('transition-name');
const descEl    = document.getElementById('transition-desc');

// ── Mode definitions ──────────────────────────────────────────────────────────

export const MODES = {
  personal: {
    sidebarBg:     '#514e4e',
    contentBg:     '#cfcfcf',
    contentBorder: '#bebebe',
    avatarBg:      '#888888',
    toggleBg:      '#b0b0b0',
    toggleOn:      false,
    brand:         'Copilot',
    leaving: {
      primary:   'Enabling Copilot Work',
      secondary: 'Your personal profile remains private',
    },
  },
  work: {
    sidebarBg:     '#e2e2e2',
    contentBg:     '#ffffff',
    contentBorder: '#d0d0d0',
    avatarBg:      '#5ab4e0',
    toggleBg:      '#5ab4e0',
    toggleOn:      true,
    brand:         'Copilot Work',
    leaving: {
      primary:   'Switching to your personal Copilot',
      secondary: 'Your work data will remain separate and secure',
    },
  },
};

// ── snapToMode — apply one mode's visual state to the DOM instantly ───────────
//
// Transitions call els.snap(to) instead of repeating these lines themselves.
// Adding a new mode property = update MODES + this function only.

function snapToMode(mode) {
  const m = MODES[mode];
  sidebarEl.style.background  = m.sidebarBg;
  contentEl.style.background  = m.contentBg;
  contentEl.style.borderColor = m.contentBorder;
  avatarEl.style.background   = m.avatarBg;
  toggleEl.style.background   = m.toggleBg;
  toggleEl.classList.toggle('is-on', m.toggleOn);
  gsap.set(dotEl, { x: m.toggleOn ? 14 : 0 });
  brandEl.textContent = m.brand;
}

// ── applyMode — full reset to a mode's canonical state ───────────────────────
//
// Called by done() at the end of every transition. Runs snapToMode then
// cleans up shared overlay/message elements so the next transition starts clean.

function applyMode(mode) {
  currentMode = mode;
  snapToMode(mode);
  msgBoxEl.style.display  = 'none';
  overlayEl.style.display = 'none';
  overlayEl.innerHTML     = '';
}

// ── Shared elements object ────────────────────────────────────────────────────
//
// Passed to every transition. Transitions should not import app.js directly.
// els.snap(mode) is the single point of truth for snapping visual state.

const els = {
  mockup:  document.getElementById('mockup'),
  panel:   document.getElementById('panel'),
  sidebar: sidebarEl,
  content: contentEl,
  brand:   brandEl,
  avatar:  avatarEl,
  toggle:  toggleEl,
  dot:     dotEl,
  msgBox:  msgBoxEl,
  msgPrim: msgPrimEl,
  msgSec:  msgSecEl,
  overlay: overlayEl,
  modes:   MODES,
  snap:    snapToMode,   // transitions call els.snap(to) to snap visual state
};

// ── State ─────────────────────────────────────────────────────────────────────

let currentMode      = 'personal';
let isTransitioning  = false;
let activeTransition = null;
let activeTimeline   = null; // reference to running GSAP timeline

// ── Toggle interaction ────────────────────────────────────────────────────────

const TIMEOUT_MS = 6000; // safety net: force-complete a stalled transition

toggleEl.addEventListener('click', () => {
  if (isTransitioning || !activeTransition) return;

  const from = currentMode;
  const to   = currentMode === 'personal' ? 'work' : 'personal';
  isTransitioning = true;

  // Kill any leftover timeline (shouldn't exist, but defensive)
  if (activeTimeline) { activeTimeline.kill(); activeTimeline = null; }

  // Safety timeout — if done() is never called (e.g. transition crashes),
  // force-complete after TIMEOUT_MS so the app doesn't lock up permanently.
  const safetyTimer = setTimeout(() => {
    console.warn(`[Transition] "${activeTransition.id}" timed out — force completing.`);
    done(); // eslint-disable-line no-use-before-define
  }, TIMEOUT_MS);

  function done() {
    clearTimeout(safetyTimer);
    applyMode(to);
    isTransitioning = false;
    activeTimeline  = null;
  }

  activeTimeline = activeTransition.play(els, from, to, done);
});

// ── Sidebar nav ───────────────────────────────────────────────────────────────

registry.forEach((transition, i) => {
  const item = document.createElement('div');
  item.className = 'nav-item';

  const num = document.createElement('span');
  num.className = 'nav-item__num';
  num.textContent = String(i + 1).padStart(2, '0');

  const label = document.createElement('span');
  label.textContent = transition.title;

  item.appendChild(num);
  item.appendChild(label);
  item.addEventListener('click', () => select(transition, item));
  nav.appendChild(item);
});

// Cache the node list after building nav — avoids re-querying DOM on each click
const navItems = nav.querySelectorAll('.nav-item');

function select(transition, navItem) {
  navItems.forEach(el => el.classList.remove('is-active'));
  navItem.classList.add('is-active');
  activeTransition   = transition;
  nameEl.textContent = transition.title;
  descEl.textContent = transition.description;
}

// ── Init ──────────────────────────────────────────────────────────────────────

applyMode('personal');
const firstItem = nav.querySelector('.nav-item');
if (firstItem) firstItem.click();
