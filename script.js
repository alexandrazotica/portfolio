/* ---- Clock ---- */
const hourElement = document.querySelector('.hour');

function updateLocalHour() {
  const now = new Date();
  const formatted = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  if (hourElement) hourElement.textContent = formatted;
}

updateLocalHour();
setInterval(updateLocalHour, 1000);

/* ---- Menus ---- */
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.menu-item:not(.menu-link)');
  const flickerItems = document.querySelectorAll('.flicker-item');
  const allToggleable = document.querySelectorAll('.menu-item, .flicker-item');

  items.forEach(item => {
    if (item.classList.contains('flicker-item')) return;

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = item.classList.contains('show-menu');
      allToggleable.forEach(i => i.classList.remove('show-menu'));
      if (!isOpen) item.classList.add('show-menu');
    });
  });

  document.addEventListener('click', () => {
    allToggleable.forEach(i => i.classList.remove('show-menu'));
  });

  flickerItems.forEach(item => {
    const panel = item.querySelector('.panel');

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = item.classList.contains('show-menu');
      allToggleable.forEach(i => i.classList.remove('show-menu'));
      if (!isOpen) panel.classList.add('flicker');
    });

    panel.addEventListener('animationend', (e) => {
      if (e.animationName === 'panel-flicker') {
        panel.classList.remove('flicker');
        item.classList.add('show-menu');
      }
    });
  });
});

/* ---- Big hover label ---- */

const hoverDisplay = document.getElementById('hover-display');
const expandables = document.querySelectorAll('[data-hover-label]');
const HOVER_BASE_FONT_SIZE = 160; // px, matches your CSS 10rem (10 * 16px)

function setHoverDisplayText(text) {
  hoverDisplay.style.fontSize = `${HOVER_BASE_FONT_SIZE}px`;
  hoverDisplay.textContent = text;

  const maxWidth = window.innerWidth * 0.9999; // small margin so it never touches the edge
  const naturalWidth = hoverDisplay.scrollWidth;

  if (naturalWidth > maxWidth) {
    const scale = maxWidth / naturalWidth;
    const fittedSize = HOVER_BASE_FONT_SIZE * scale;
    hoverDisplay.style.fontSize = `${fittedSize}px`;
  }
}

function anyPanelOpen() {
  return document.querySelector('.menu-item.show-menu, .flicker-item.show-menu') !== null;
}

expandables.forEach(el => {
  el.addEventListener('mouseenter', () => {
    setHoverDisplayText(el.dataset.hoverLabel);
    hoverDisplay.classList.add('visible');
  });

  el.addEventListener('mouseleave', () => {
    if (!anyPanelOpen()) hoverDisplay.classList.remove('visible');
  });
});

const toggleableWithLabels = document.querySelectorAll('.menu-item, .flicker-item');

toggleableWithLabels.forEach(item => {
  const observer = new MutationObserver(() => {
    if (item.classList.contains('show-menu')) {
      const label = item.dataset.hoverLabel || item.querySelector('[data-hover-label]')?.dataset.hoverLabel || '';
      setHoverDisplayText(label);
      hoverDisplay.classList.add('visible');
    } else if (!anyPanelOpen()) {
      hoverDisplay.classList.remove('visible');
    }
  });
  observer.observe(item, { attributes: true, attributeFilter: ['class'] });
});

/* ---- Hero videos ---- */
const HERO_VIDEOS = [
  { src: 'assets/projects/-hero videos/HONG KONG-video 1.mp4', label: 'Hong Kong Video Diary', categories: ['Videomaking'], url: 'project/Hong-Kong-Video-Diary.html' },
  { src: 'assets/projects/-hero videos/WTF-video 2.mp4', label: 'What To Fix', categories: ['Editorial', 'Motion', 'Animation'], url: 'project/What-To-Fix.html' },
  { src: 'assets/projects/-hero videos/WTF-video 3.mp4', label: 'What To Fix', categories: ['Editorial', 'Motion', 'Animation'], url: 'project/What-To-Fix.html' },
  { src: 'assets/projects/-hero videos/ULTIMA CENA-video 2.mp4', label: 'L\'Ultima Cena', categories: ['Motion', 'Videomaking'], url: 'project/Ultima-Cena.html' },
  { src: 'assets/projects/-hero videos/HONEYDEW-video 2.mp4', label: 'Honeydew', categories: ['Animation'], url: 'project/Honeydew.html' },
  { src: 'assets/projects/-hero videos/PDP-video 2.mp4', label: 'Partito del Pomodoro', categories: ['Visual Identity', 'Animation'], url: 'project/Partito-del-Pomodoro.html' },
  { src: 'assets/projects/-hero videos/VIRAL-video 1.mp4', label: 'Viral Necropsy', categories: ['Editorial', 'Motion', 'Web'], url: 'project/Viral-Necropsy.html' },
  { src: 'assets/projects/-hero videos/BAO-video 1.mp4', srcMobile:'assets/projects/BAO/bao-11.mp4', label: 'BAO Music Festival', categories: ['Visual Identity', 'Motion', 'Web'], url: 'project/BAO-Music-Festival.html' },
  { src: 'assets/projects/-hero videos/GIRO CON TE-video 1.mp4', label: 'Giro Con Te', categories: ['Videomaking'], url: 'project/Giro-Con-Te.html' },
  { src: 'assets/projects/-hero videos/WHIPLASH-video 1.mp4', label: 'Whiplash', categories: ['Animation'], url: 'project/Whiplash.html' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let heroQueue = [];
let lastTwoLabels = [];

function nextHero() {
  const differs = v => !lastTwoLabels.includes(v.label);

  if (heroQueue.length === 0) heroQueue = shuffle(HERO_VIDEOS);

  let idx = heroQueue.findIndex(differs);

  // Everything left in the queue shares a recent label: reshuffle
  if (idx === -1) {
    heroQueue = shuffle(HERO_VIDEOS);
    idx = heroQueue.findIndex(differs);
  }

  // Fewer than 3 distinct labels exist: relax to just avoiding the last one
  if (idx === -1) idx = heroQueue.findIndex(v => v.label !== lastTwoLabels[lastTwoLabels.length - 1]);
  if (idx === -1) idx = 0;

  const picked = heroQueue.splice(idx, 1)[0];
  lastTwoLabels = [lastTwoLabels[lastTwoLabels.length - 1], picked.label].filter(Boolean);
  return picked;
}

/* ---- Double-buffered playback ---- */
const heroWrap = document.querySelector('.hero-videos');
const heroVideos = [...document.querySelectorAll('.hero-video')];
const videoLabel = document.getElementById('video-label');
const videoCategories = document.getElementById('video-categories');
const heroLabels = ['', ''];
const heroCategories = [[], []];
const heroUrls = ['#', '#'];

let current = -1;
let pendingSwap = false;
let failures = 0;
let glitching = false;
let waitingForGesture = false;
const ready = [false, false];
const heroUsesVertical = [false, false];

function load(i) {
  ready[i] = false;
  const item = nextHero();
  heroLabels[i] = item.label;
  heroCategories[i] = item.categories || [];
  heroUrls[i] = item.url || '#';

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const useVertical = isMobile && !!item.srcMobile;
  heroUsesVertical[i] = useVertical;

  const chosenSrc = useVertical ? item.srcMobile : item.src;
  heroVideos[i].src = encodeURI(chosenSrc);
  heroVideos[i].load();
}

function waitForGesture() {
  if (waitingForGesture) return;
  waitingForGesture = true;
  const events = ['pointerup', 'click', 'touchend', 'keydown'];
  const resume = () => {
    events.forEach(e => window.removeEventListener(e, resume, true));
    waitingForGesture = false;
    const v = heroVideos[current];
    if (v && v.paused) tryPlay(v);
  };
  events.forEach(e => window.addEventListener(e, resume, { capture: true, passive: true }));
}

function tryPlay(v) {
  const p = v.play();
  if (!p) return;
  p.catch(err => {
    if (err.name === 'NotAllowedError') waitForGesture();
    else console.warn('Hero video play() rejected:', err);
  });
}

const mobileHeroVideos = [...document.querySelectorAll('.mobile-hero-video')];

function show(i) {
  const prev = current;
  current = i;
  failures = 0;
  const v = heroVideos[i];
  v.currentTime = 0;
  tryPlay(v);
  v.classList.add('active');
  if (videoLabel) {
    videoLabel.textContent = heroLabels[i];
    videoLabel.href = heroUrls[i];
  }
  if (videoCategories) videoCategories.textContent = heroCategories[i].join(' + ');

  document.documentElement.classList.toggle('mobile-vertical-mode', heroUsesVertical[i]);

  if (!heroUsesVertical[i] && window.matchMedia('(max-width: 768px)').matches && mobileHeroVideos.length === 2) {
    mobileHeroVideos.forEach(mv => {
      mv.src = v.currentSrc || v.src;
      mv.currentTime = 0;
      mv.play().catch(() => {});
    });
  }

  if (prev >= 0) {
    heroVideos[prev].classList.remove('active');
    setTimeout(() => load(prev), 300);
  }
}

function activeGlitchTarget() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const showingVertical = document.documentElement.classList.contains('mobile-vertical-mode');
  // .hero-videos is visible on desktop, OR on mobile when in vertical mode
  if (!isMobile || showingVertical) return heroWrap;
  // otherwise the mobile pair is what's on screen
  return document.querySelector('.mobile-hero-pair');
}

function glitchTo(i) {
  if (glitching) return;
  glitching = true;

  const target = activeGlitchTarget();
  target.classList.add('glitch');

  setTimeout(() => show(i), 250);   // swap at the blacked-out midpoint
  setTimeout(() => {
    target.classList.remove('glitch');
    glitching = false;
  }, 500);                          // must match the CSS duration
}

function advance() {
  const next = 1 - current;
  if (ready[next]) glitchTo(next);
  else pendingSwap = true;
}

function markReady(i) {
  if (ready[i]) return;
  ready[i] = true;
  if (current === -1) {
    show(i);
    load(1 - i);
  } else if (pendingSwap && i === 1 - current) {
    pendingSwap = false;
    glitchTo(i);
  }
}

if (heroWrap && heroVideos.length === 2 && HERO_VIDEOS.length) {
  heroVideos.forEach((v, i) => {
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.loop = false;

    v.addEventListener('canplay', () => markReady(i));
v.addEventListener('loadeddata', () => markReady(i));
v.addEventListener('loadedmetadata', () => {
  const isVertical = v.videoHeight > v.videoWidth;
  v.classList.toggle('vertical', isVertical);
});

    v.addEventListener('ended', () => {
      if (i === current) advance();
    });

    v.addEventListener('error', () => {
      const codes = { 1: 'aborted', 2: 'network', 3: 'decode error (codec)', 4: 'not found / unsupported format' };
      console.error('Hero video failed:', v.currentSrc, codes[v.error?.code] || v.error);
      if (++failures > HERO_VIDEOS.length) return;
      if (i === current) advance();
      else load(i);
    });
  });

  load(0);
} else {
  console.warn('Hero videos not initialised: expected 2 .hero-video elements inside .hero-videos');
}

/* ---- Scroll fade ---- */
function updateVideoOpacity() {
  if (!heroWrap) return;
  const fadeDistance = window.innerHeight * 0.4;
  const o = Math.max(0, 1 - window.scrollY / fadeDistance);
  heroWrap.style.opacity = o;
  document.documentElement.style.setProperty('--hero-fade', o);
  document.documentElement.classList.toggle('scrolled', o < 0.05); // new
}

updateVideoOpacity();
window.addEventListener('scroll', updateVideoOpacity, { passive: true });

/* ---- Hover previews: one element per file, orientation fixed at load ---- */
const isVideoSrc = src => /\.(mp4|webm|mov)(\?.*)?$/i.test(src);
const previewEls = new Map();   // src -> { el, isVideo, ready, waiters }
let activePreview = null;
let hoverToken = 0;

function getPreviewSrc(row) {
  const d = filters.discipline;
  return (d !== 'all' && row.getAttribute(`data-preview-${d}`)) || row.dataset.preview;
}

function getPreview(src) {
  let entry = previewEls.get(src);
  if (entry) return entry;

  const isVideo = isVideoSrc(src);
  const el = document.createElement(isVideo ? 'video' : 'img');
  el.className = 'preview-media';
  if (isVideo) {
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    el.preload = 'auto';
  }

  entry = { el, isVideo, ready: false, waiters: [] };

  const done = portrait => {
    el.classList.add(portrait ? 'portrait' : 'landscape'); // set once, never changes
    entry.ready = true;
    entry.waiters.splice(0).forEach(fn => fn());
  };

  if (isVideo) {
    el.addEventListener('loadeddata', () => done(el.videoHeight > el.videoWidth), { once: true });
  } else {
    el.addEventListener('load', () => done(el.naturalHeight > el.naturalWidth), { once: true });
  }
  el.addEventListener('error', () => {
    console.error('Preview failed:', src);
    previewEls.delete(src);
    el.remove();
  });

  document.body.appendChild(el);
  el.src = encodeURI(src);
  previewEls.set(src, entry);
  return entry;
}

function hidePreview() {
  if (!activePreview) return;
  activePreview.el.classList.remove('visible');
  if (activePreview.isVideo) activePreview.el.pause();
  activePreview = null;
}

document.querySelectorAll('.row[data-preview]').forEach(row => {
  row.addEventListener('mouseenter', () => {
    const token = ++hoverToken;
    hidePreview();

    const entry = getPreview(getPreviewSrc(row));
    const reveal = () => {
      if (token !== hoverToken) return;   // user already moved on
      activePreview = entry;
      if (entry.isVideo) {
        entry.el.currentTime = 0;
        entry.el.play().catch(() => {});
      }
      entry.el.classList.add('visible');
    };

    if (entry.ready) reveal();
    else entry.waiters.push(reveal);
  });

  row.addEventListener('mouseleave', () => {
    hoverToken++;
    hidePreview();
  });
});

const projectsContainer = document.querySelector('.projects');
const runningAnimations = new WeakMap(); // track per-item animations so rapid clicks don't jump
const filters = { type: 'all', discipline: 'all' };

function matchesFilters(item) {
  const typeOk = filters.type === 'all'
    || item.dataset.type.toLowerCase() === filters.type.toLowerCase();
  const disciplineOk = filters.discipline === 'all'
    || (item.dataset.categories || '').split(/\s+/).includes(filters.discipline);
  return typeOk && disciplineOk;
}

function updateEmptyState() {
  const noResults = document.getElementById('no-results');
  if (!noResults) return;
  const items = Array.from(projectsContainer.querySelectorAll('.project-item'));
  noResults.hidden = items.some(matchesFilters);
}

function applyFilter(type, animate = true) {
 const items = Array.from(projectsContainer.querySelectorAll('.project-item'));
  const DURATION = 500;
  const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

  const willBeVisible = new Map();
  items.forEach(item => willBeVisible.set(item, matchesFilters(item)));
  updateEmptyState();

  // Cancel any animation currently in flight, so a fast re-click doesn't fight itself.
  items.forEach(item => runningAnimations.get(item)?.cancel());

  if (!animate) {
    items.forEach(item => {
      const matches = willBeVisible.get(item);
      item.style.cssText = matches ? '' : 'display:none;';
    });
    return;
  }

  // STEP 1 — record current positions of items that will stay visible.
  const staying = items.filter(item => item.style.display !== 'none' && willBeVisible.get(item));
  const firstRects = new Map(staying.map(item => [item, item.getBoundingClientRect()]));

  // STEP 2 — pull exiting items out of flow so the rest reflows immediately.
  const exiting = items.filter(item => item.style.display !== 'none' && !willBeVisible.get(item));
  if (exiting.length && getComputedStyle(projectsContainer).position === 'static') {
    projectsContainer.style.position = 'relative';
  }
  const exitStartRects = new Map(exiting.map(item => [item, item.getBoundingClientRect()]));
  exiting.forEach(item => {
    const rect = exitStartRects.get(item);
    const parentRect = projectsContainer.getBoundingClientRect();
    item.style.position = 'absolute';
    item.style.margin = '0';
    item.style.top = `${rect.top - parentRect.top}px`;
    item.style.left = `${rect.left - parentRect.left}px`;
    item.style.width = `${rect.width}px`;
    item.style.transform = 'translate(0, 0)';
  });

  // STEP 3 — reveal entering items so they occupy their new slot in the layout.
  const entering = items.filter(item => item.style.display === 'none' && willBeVisible.get(item));
  entering.forEach(item => {
    item.style.display = '';
  });

  // STEP 4 — measure post-change (final) positions, now that layout has settled.
  const stayingDeltas = staying.map(item => {
    const first = firstRects.get(item);
    const last = item.getBoundingClientRect();
    return { item, dx: first.left - last.left, dy: first.top - last.top };
  });

  // STEP 5 — animate everything via WAAPI, no reflow hacks needed.
  stayingDeltas.forEach(({ item, dx, dy }) => {
    if (!dx && !dy) return; // didn't move, nothing to animate
    const anim = item.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: 'translate(0, 0)' }
      ],
      { duration: DURATION, easing: EASING, fill: 'both' }
    );
    runningAnimations.set(item, anim);
    anim.onfinish = () => { item.style.transform = ''; runningAnimations.delete(item); };
  });

  entering.forEach(item => {
    const anim = item.animate(
      [
        { transform: 'translateY(1000px)' },
        { transform: 'translateY(0)' }
      ],
      { duration: DURATION, easing: EASING, fill: 'both' }
    );
    runningAnimations.set(item, anim);
    anim.onfinish = () => { item.style.transform = ''; runningAnimations.delete(item); };
  });

  exiting.forEach(item => {
    const rect = item.getBoundingClientRect();
    const distance = window.innerHeight - rect.top + rect.height; // clears the viewport
    const anim = item.animate(
      [
        { transform: 'translate(0, 0)' },
        { transform: `translateY(${distance}px)` }
      ],
      { duration: DURATION, easing: EASING, fill: 'forwards' }
    );
    runningAnimations.set(item, anim);
    anim.onfinish = () => {
      item.style.display = 'none';
      item.style.position = '';
      item.style.top = '';
      item.style.left = '';
      item.style.width = '';
      item.style.margin = '';
      item.style.transform = '';
      runningAnimations.delete(item);
    };
  });
}

function wireFilterBar(barId, role, filterKey, dataAttr) {
  const bar = document.getElementById(barId);
  if (!bar) return;

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest(`.sort-btn[data-role="${role}"]`);
    if (!btn) return;   // the year toggle never enters here

    bar.querySelectorAll(`.sort-btn[data-role="${role}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    filters[filterKey] = btn.dataset[dataAttr];
    applyFilter();
  });
}

wireFilterBar('type-bar', 'category', 'type', 'type');
wireFilterBar('discipline-bar', 'discipline', 'discipline', 'discipline');

/* ---- Filter counts + size by count ---- */
const MIN_SCALE = 0.85;  // size of the category with the fewest projects (em)
const MAX_SCALE = 1.6;   // size of the category with the most projects (em)

function addFilterCounts() {
  const items = [...document.querySelectorAll('.project-item')];

  ['discipline', 'category'].forEach(role => {
    const isDiscipline = role === 'discipline';
    const buttons = [...document.querySelectorAll(`.sort-btn[data-role="${role}"]`)];

    const counts = new Map();
    buttons.forEach(btn => {
      const value = isDiscipline ? btn.dataset.discipline : btn.dataset.type;
      const count = value === 'all'
        ? items.length
        : items.filter(item => isDiscipline
            ? (item.dataset.categories || '').split(/\s+/).includes(value)
            : item.dataset.type.toLowerCase() === value.toLowerCase()
          ).length;
      counts.set(btn, { value, count });
    });

    // scale within each row, ignoring "All"
    const nums = [...counts.values()].filter(c => c.value !== 'all').map(c => c.count);
    const min = Math.min(...nums);
    const max = Math.max(...nums);

    counts.forEach(({ value, count }, btn) => {
      const sup = document.createElement('sup');
      sup.className = 'filter-count';
      sup.textContent = count;
      btn.appendChild(sup);

      if (value === 'all') return;
      const t = max === min ? 0.5 : (count - min) / (max - min);
      btn.style.fontSize = `${MIN_SCALE + t * (MAX_SCALE - MIN_SCALE)}em`;
    });
  });
}

addFilterCounts();

/* ---- Custom cursor ---- */
const cursor = document.getElementById('custom-cursor');
const cursorShape = cursor.querySelector('.cursor-shape');

window.addEventListener('mousemove', (e) => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});

window.addEventListener('mouseout', (e) => {
  if (!e.relatedTarget) cursor.style.opacity = '0';
});
window.addEventListener('mouseover', () => {
  cursor.style.opacity = '1';
});

/* Grow the cursor on clickable elements */
const CLICKABLE = 'a, button, .menu-item, .flicker-item, .row, .sort-btn';
document.addEventListener('mouseover', (e) => {
  if (e.target.closest(CLICKABLE)) cursorShape.classList.add('hover-target');
});
document.addEventListener('mouseout', (e) => {
  const stillInside = e.relatedTarget && e.relatedTarget.closest(CLICKABLE);
  if (e.target.closest(CLICKABLE) && !stillInside) {
    cursorShape.classList.remove('hover-target');
  }
});

/* ---- Fairy dust trail ---- */
let lastDustX = null, lastDustY = null;
const DUST_MIN_DISTANCE = 7; // spacing between particles, px

function spawnDust(x, y) {
  const size = 8 + Math.random() * 12; // 4–10px, gets smaller as it "runs out"
  const dust = document.createElement('div');
  dust.className = 'dust-particle';
  dust.style.width = `${size}px`;
  dust.style.height = `${size}px`;
  dust.style.left = `${x - size / 2}px`;
  dust.style.top = `${y - size / 2}px`;

  // occasional cyan speck to match your accent palette
  if (Math.random() < 0.25) dust.style.backgroundColor = 'rgb(0, 251, 255)';

  document.body.appendChild(dust);

  const driftX = (Math.random() - 0.5) * 24;
  const driftY = 10 + Math.random() * 20; // dust settles downward slightly

  requestAnimationFrame(() => {
    dust.style.transform = `translate(${driftX}px, ${driftY}px) scale(0)`;
    dust.style.opacity = '0';
  });

  setTimeout(() => dust.remove(), 650);
}

window.addEventListener('mousemove', (e) => {
  if (lastDustX === null) {
    lastDustX = e.clientX;
    lastDustY = e.clientY;
    return;
  }
  const dx = e.clientX - lastDustX;
  const dy = e.clientY - lastDustY;
  if (Math.hypot(dx, dy) > DUST_MIN_DISTANCE) {
    spawnDust(e.clientX, e.clientY);
    lastDustX = e.clientX;
    lastDustY = e.clientY;
  }
}, { passive: true });

let currentOrder = 'desc'; // 'desc' = most recent first, 'asc' = least recent first

function reorderProjects(order, animate = true) {
  currentOrder = order;
  const items = Array.from(projectsContainer.querySelectorAll('.project-item'));
  const visible = items.filter(item => item.style.display !== 'none');
  const firstRects = new Map(visible.map(item => [item, item.getBoundingClientRect()]));

  items.sort((a, b) => order === 'desc'
    ? Number(b.dataset.year) - Number(a.dataset.year)
    : Number(a.dataset.year) - Number(b.dataset.year)
  );
  items.forEach(item => projectsContainer.appendChild(item)); // reinsert in new order

  if (!animate) return;

  visible.forEach(item => {
    const first = firstRects.get(item);
    const last = item.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (!dx && !dy) return; // didn't move

    runningAnimations.get(item)?.cancel();
    const anim = item.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: 'translate(0, 0)' }
      ],
      { duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' }
    );
    runningAnimations.set(item, anim);
    anim.onfinish = () => { item.style.transform = ''; runningAnimations.delete(item); };
  });
}

reorderProjects('desc', false); // run once on load, no animation needed

const yearToggle = document.getElementById('year-toggle');
if (yearToggle) {
  yearToggle.addEventListener('click', () => {
    const next = currentOrder === 'desc' ? 'asc' : 'desc';
    reorderProjects(next);
    yearToggle.textContent = next === 'desc' ? 'Year ↓' : 'Year ↑';
    yearToggle.dataset.order = next;
  });
}
