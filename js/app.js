/*
 * Transition Prototype — App
 * Manages mode state, sidebar nav, and transition lifecycle.
 *
 * To add a transition: create js/transitions/your-file.js and register it in registry.js.
 * The play(els, from, to, done) contract is documented in each transition file.
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
//
// Each mode defines its visual state and the message shown when leaving it.
// Transitions read these via els.modes[from] and els.modes[to].

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

// ── State ─────────────────────────────────────────────────────────────────────

let currentMode      = 'personal';
let isTransitioning  = false;
let activeTransition = null;

// ── applyMode — instantly snap all elements to a mode's final state ───────────

export function applyMode(mode) {
  const m = MODES[mode];
  currentMode = mode;

  sidebarEl.style.background  = m.sidebarBg;
  contentEl.style.background  = m.contentBg;
  contentEl.style.borderColor = m.contentBorder;
  avatarEl.style.background   = m.avatarBg;
  toggleEl.style.background   = m.toggleBg;
  toggleEl.classList.toggle('is-on', m.toggleOn);
  gsap.set(dotEl, { x: m.toggleOn ? 14 : 0 });
  brandEl.textContent = m.brand;

  // Clean up shared elements so transitions start from a known state
  msgBoxEl.style.display  = 'none';
  overlayEl.style.display = 'none';
  overlayEl.innerHTML     = '';
}

// ── Toggle interaction ────────────────────────────────────────────────────────

toggleEl.addEventListener('click', () => {
  if (isTransitioning || !activeTransition) return;

  const from = currentMode;
  const to   = currentMode === 'personal' ? 'work' : 'personal';
  isTransitioning = true;

  // The elements object gives each transition access to everything it may need.
  // Transitions should not import app.js — use this object instead.
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
  };

  // done() — called by the transition when fully complete.
  // Snaps everything to the canonical final state and unlocks the toggle.
  activeTransition.play(els, from, to, () => {
    applyMode(to);
    isTransitioning = false;
  });
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

function select(transition, navItem) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('is-active'));
  navItem.classList.add('is-active');
  activeTransition   = transition;
  nameEl.textContent = transition.title;
  descEl.textContent = transition.description;
}

// ── Init ──────────────────────────────────────────────────────────────────────

applyMode('personal');
const firstItem = nav.querySelector('.nav-item');
if (firstItem) firstItem.click();
