// =================================================================
// Main JS — UI orchestration
// Loader, theme toggle, nav, cursor, scroll progress, reveals,
// stat counter, 3D tilt, mobile nav, year stamp
// =================================================================

(() => {
  'use strict';

  // ---------- Loader ----------
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 600);
    }
  });

  // ---------- Theme toggle ----------
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  themeBtn?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ---------- Custom Cursor ----------
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  if (cursor && cursorDot && !isTouch) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover state on interactive elements
    const interactiveSel = 'a, button, .skill-card, .project-card, .achievement-card, .meta-item, input, textarea, .timeline-content';
    document.querySelectorAll(interactiveSel).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-active'));
    });
  }

  // ---------- Scroll progress ----------
  const progressBar = document.getElementById('scroll-progress');
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / scrollHeight) * 100;
    if (progressBar) progressBar.style.width = progress + '%';
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ---------- Mobile nav toggle ----------
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle?.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks?.classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => {
      navToggle?.classList.remove('open');
      navLinks?.classList.remove('open');
    });
  });

  // ---------- Active nav link on scroll ----------
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  function setActiveLink() {
    const scrollPos = window.scrollY + 120;
    let active = '';
    sections.forEach((s) => {
      if (scrollPos >= s.offsetTop) active = s.id;
    });
    navAnchors.forEach((a) => {
      const href = a.getAttribute('href').replace('#', '');
      a.classList.toggle('active', href === active);
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });

  // ---------- Reveal on scroll ----------
  const revealTargets = document.querySelectorAll(
    '.section-header, .about-image, .about-content, .skill-card, .project-card, .timeline-item, .achievement-card, .cert-card, .contact-info, .contact-form, .cert-heading'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  revealTargets.forEach((el) => observer.observe(el));

  // ---------- Stat counter ----------
  const stats = document.querySelectorAll('.stat');
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const stat = entry.target;
          const numEl = stat.querySelector('.stat-num');
          const target = parseInt(stat.dataset.target, 10);
          const duration = 1600;
          const start = performance.now();

          function update(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            numEl.textContent = Math.floor(eased * target).toLocaleString();
            if (t < 1) requestAnimationFrame(update);
            else numEl.textContent = target.toLocaleString();
          }
          requestAnimationFrame(update);
          statObserver.unobserve(stat);
        }
      });
    },
    { threshold: 0.5 }
  );
  stats.forEach((s) => statObserver.observe(s));

  // ---------- 3D tilt on cards ----------
  const tiltCards = document.querySelectorAll('.tilt');
  tiltCards.forEach((card) => {
    let rect;
    const onMove = (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotY = ((x - cx) / cx) * 6;
      const rotX = -((y - cy) / cy) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    };
    const reset = () => {
      rect = null;
      card.style.transform = '';
    };
    card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); });
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', reset);
  });

  // ---------- Year stamp ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Smooth scroll on anchor click ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------- Contact form — fetch submission ----------
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  function showStatus(type, html) {
    statusEl.className = `form-status show ${type}`;
    statusEl.innerHTML = html;
  }

  function hideStatus() {
    statusEl.className = 'form-status';
    statusEl.innerHTML = '';
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn?.querySelector('span');
    const originalText = btnText?.textContent ?? 'Send Message';

    if (btnText) btnText.textContent = 'Sending...';
    if (submitBtn) submitBtn.disabled = true;
    hideStatus();

    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showStatus('success', '&#10003; Message sent! I\'ll get back to you soon.');
        form.reset();
        setTimeout(hideStatus, 5000);
      } else {
        throw new Error(json.message || 'Submission failed');
      }
    } catch {
      showStatus(
        'error',
        'Something went wrong. Please email me directly at <a href="mailto:murugappanp24@gmail.com">murugappanp24@gmail.com</a>'
      );
      setTimeout(hideStatus, 5000);
    } finally {
      if (btnText) btnText.textContent = originalText;
      if (submitBtn) submitBtn.disabled = false;
    }
  });

})();
