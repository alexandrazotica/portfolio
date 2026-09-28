(async function fillProjectAttrs() {
  const titleEl = document.getElementById('project-title');
  const attrsEl = document.getElementById('project-attrs');
  const header = document.querySelector('.project-header');
  if (!titleEl || !attrsEl) return;

  const norm = s => s.trim().toLowerCase();

  try {
    const res = await fetch('../see-all.html');
    if (!res.ok) throw new Error(`see-all.html returned ${res.status}`);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');

    const match = [...doc.querySelectorAll('.project-item')].find(item =>
      norm(item.querySelector('.title-default')?.textContent || '') === norm(titleEl.textContent)
    );

    if (!match) {
      console.warn('No project in see-all.html matches the title:', titleEl.textContent);
      return;
    }

    // ---- previous / next project buttons ----
const items = [...doc.querySelectorAll('.project-item')];
const index = items.indexOf(match);

const toLink = item => {
  const a = item.matches('a') ? item : item.querySelector('a');
  const href = a?.getAttribute('href');
  if (!href) return null;
  return {
    title: item.querySelector('.title-default')?.textContent.trim() || '',
    url: new URL(href, res.url).href,   // resolved relative to see-all.html
  };
};

const prev = toLink(items[(index - 1 + items.length) % items.length]);
const next = toLink(items[(index + 1) % items.length]);

const nav = document.createElement('nav');
nav.className = 'project-nav';

[
  { text: 'Previous project', arrow: '←', target: prev, cls: 'prev' },
  { text: 'Next project',     arrow: '→', target: next, cls: 'next' },
].forEach(({ text, arrow, target, cls }) => {
  if (!target) return;
  const a = document.createElement('a');
  a.href = target.url;
  a.className = `project-nav-link ${cls}`;

  const label = document.createElement('span');
  label.className = 'project-nav-label';

  const arrowEl = document.createElement('span');
  arrowEl.className = 'project-nav-arrow';
  arrowEl.textContent = arrow;

  // arrow sits outside the text: before it on "previous", after it on "next"
  const labelText = document.createTextNode(text);
  if (cls === 'prev') label.append(arrowEl, labelText);
  else label.append(labelText, arrowEl);

  const title = document.createElement('span');
  title.className = 'project-nav-title';
  title.textContent = target.title;

  a.append(label, title);
  nav.appendChild(a);
});

const footer = document.querySelector('.site-footer');
if (footer) {
  footer.before(nav);
} else {
  document.body.appendChild(nav);
}

    const type = match.dataset.type || '';

    const collaborators = (header?.dataset.collaborators || '')
      .split(',').map(s => s.trim()).filter(Boolean);

const exhibited = (header?.dataset.exhibitedAt || '')
  .split(';').map(s => s.trim()).filter(Boolean)
  .map(s => {
    const [label, url] = s.split('|').map(x => x.trim());
    return url ? { label, url } : label;   // plain text, or a link if a URL is given
  });

    const links = (header?.dataset.links || '')
      .split(';').map(s => s.trim()).filter(Boolean)
      .map(s => {
        const [label, url] = s.split('|').map(x => x.trim());
        return { label, url };
      })
      .filter(l => l.label && l.url);

    // each value is an array of lines; a line is text or a {label, url} link
const attrs = [
  ['Year', [match.dataset.year]],
  ['Type', [type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()]],
  ['Category', [match.querySelector('.title-category')?.textContent.trim()]],
  ['Collaborators', collaborators],
  ['Exhibited at', exhibited],
  ['Links', links],
];

    attrsEl.replaceChildren(
      ...attrs
        .filter(([, lines]) => lines.length && lines[0])
        .map(([label, lines]) => {
          const wrap = document.createElement('div');
          wrap.className = 'attr';

          const labelEl = document.createElement('span');
          labelEl.className = 'attr-label';
          labelEl.textContent = label;

          const valueEl = document.createElement('span');
          valueEl.className = 'attr-value';
          lines.forEach(line => {
            const row = document.createElement('span');
            row.className = 'attr-line';
            if (typeof line === 'string') {
              row.textContent = line;
            } else {
              const a = document.createElement('a');
              a.href = line.url;
              a.target = '_blank';
              a.rel = 'noopener';
              a.textContent = `${line.label} ↗`;
              row.appendChild(a);
            }
            valueEl.appendChild(row);
          });

          wrap.append(labelEl, valueEl);
          return wrap;
        })
    );
  } catch (err) {
    console.error('Could not load project attributes:', err);
  }
})();

(function galleryCursorLabel() {
  const galleries = document.querySelectorAll('.project-gallery-h, .project-gallery-v');
  if (!galleries.length) return;

  const label = document.createElement('div');
  label.id = 'gallery-cursor';
  document.body.appendChild(label);

  function hasOverflow(gallery) {
    return gallery.scrollWidth > gallery.clientWidth + 1; // +1 guards against subpixel rounding
  }

  function updateLabel(gallery) {
    const atEnd = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 4;
    label.textContent = atEnd ? '← Scroll' : 'Scroll →';
  }

  galleries.forEach(gallery => {
    gallery.addEventListener('scroll', () => updateLabel(gallery), { passive: true });
    window.addEventListener('resize', () => updateLabel(gallery));
    window.addEventListener('load', () => updateLabel(gallery));

    gallery.addEventListener('mouseenter', () => {
      if (!hasOverflow(gallery)) return;   // nothing to scroll — don't show the label
      updateLabel(gallery);
      label.classList.add('visible');
      document.documentElement.classList.add('gallery-hover');
    });
    gallery.addEventListener('mouseleave', () => {
      label.classList.remove('visible');
      document.documentElement.classList.remove('gallery-hover');
    });
    gallery.addEventListener('mousemove', (e) => {
      label.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  });
})();

(function videoLinkCursor() {
  const links = document.querySelectorAll('.video-full-link');
  if (!links.length) return;

  const cursor = document.createElement('div');
  cursor.id = 'video-cursor';
  cursor.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z"/>
    </svg>
    <span class="video-cursor-text"></span>
  `;
  document.body.appendChild(cursor);
  const textEl = cursor.querySelector('.video-cursor-text');

  links.forEach(link => {
    const label = link.dataset.cursorLabel || 'Watch full video';

    link.addEventListener('mouseenter', () => {
      textEl.textContent = label;
      cursor.classList.add('visible');
      document.documentElement.classList.add('video-link-hover');
    });

    link.addEventListener('mouseleave', () => {
      cursor.classList.remove('visible');
      document.documentElement.classList.remove('video-link-hover');
    });

    link.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
  });
})();

(function lazyLoadVideos() {
  const videos = document.querySelectorAll('video[data-src]');
  if (!videos.length) return;

  function ensureLoaded(video) {
    if (video.src) return;
    video.preload = 'auto';
    video.src = video.dataset.src;
    video.load();
  }

  // Tier 1: start downloading well before the video is on screen
  const loader = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      ensureLoaded(entry.target);
      loader.unobserve(entry.target);   // only needs to happen once
    });
  }, { rootMargin: '1000px 600px', threshold: 0 });

  // Tier 2: play/pause only when actually visible
  const player = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        ensureLoaded(video);            // safety net if tier 1 hasn't fired yet
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: '0px 100px', threshold: 0.1 });

  videos.forEach(v => {
    loader.observe(v);
    player.observe(v);
  });
})();

(function mobileGalleryArrows() {
  const galleries = document.querySelectorAll('.project-gallery-h, .project-gallery-v');
  if (!galleries.length) return;

  function hasOverflow(gallery) {
    return gallery.scrollWidth > gallery.clientWidth + 1;
  }

  galleries.forEach(gallery => {
    const label = document.createElement('div');
    label.className = 'gallery-scroll-label';
    label.innerHTML = `
      <span class="gallery-scroll-text">Scroll</span>
      <span class="gallery-scroll-arrow">→</span>
    `;
    gallery.parentNode.insertBefore(label, gallery);

    const arrowEl = label.querySelector('.gallery-scroll-arrow');

    function updateLabel() {
      if (!hasOverflow(gallery)) {
        label.style.display = 'none';
        return;
      }
      label.style.display = '';
      const atEnd = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 4;
      arrowEl.textContent = atEnd ? '←' : '→';
      arrowEl.classList.toggle('at-end', atEnd);
    }

    gallery.addEventListener('scroll', updateLabel, { passive: true });
    window.addEventListener('resize', updateLabel);
    window.addEventListener('load', updateLabel);
    updateLabel();
  });
})();

(function mobileVideoButtons() {
  const links = document.querySelectorAll('.video-full-link');
  if (!links.length) return;

  links.forEach(link => {
    const label = link.dataset.cursorLabel || 'Watch full video';

    const button = document.createElement('a');
    button.className = 'video-watch-button';
    button.href = link.href;
    button.target = link.target || '_blank';
    button.rel = 'noopener';
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <span>${label}</span>
    `;

    // sits right after the figure/link, so it reads as "belonging" to that video
    link.parentNode.insertBefore(button, link.nextSibling);
  });
})();

(function resetGalleryScroll() {
  const galleries = document.querySelectorAll('.project-gallery-h, .project-gallery-v');
  if (!galleries.length) return;

  const reset = () => galleries.forEach(g => g.scrollTo({ left: 0, behavior: 'instant' }));

  reset();                                  // on first run
  window.addEventListener('load', reset);   // after the browser's own restore attempt
  window.addEventListener('pageshow', reset); // fires on back/forward (bfcache) too
})();