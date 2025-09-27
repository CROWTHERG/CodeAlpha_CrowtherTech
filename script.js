// ========== Enhanced interactions (compatible with your markup) ==========
document.addEventListener('DOMContentLoaded', function () {

  // -- Elements --
  const header = document.querySelector('header');
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');
  const fadeElements = document.querySelectorAll('.fade-in, .box, .service-card, .project-thumb, .project-thumb img, .cta-section');
  const counters = document.querySelectorAll('.counter-number');
  const backBtn = (function(){
    let el = document.getElementById('backToTop');
    if (!el) {
      el = document.createElement('button');
      el.id = 'backToTop';
      el.setAttribute('aria-label','Back to top');
      el.innerHTML = '↑';
      document.body.appendChild(el);
    }
    return el;
  })();

  // -- Header shrink on scroll --
  function handleHeader() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  handleHeader();
  window.addEventListener('scroll', handleHeader, {passive:true});

  // -- Hamburger mobile toggle --
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
      // create a page-overlay if not present for clicking to close
      let overlay = document.querySelector('.page-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'page-overlay';
        document.body.appendChild(overlay);
      }
      overlay.style.display = nav.classList.contains('active') ? 'block' : 'none';
      overlay.onclick = () => {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
        overlay.style.display = 'none';
      };
    });
  }

  // -- Smooth in-page anchor scrolling for links like #about --
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        // close mobile nav if open
        if (nav && nav.classList.contains('active')) {
          nav.classList.remove('active');
          hamburger && hamburger.classList.remove('active');
          const overlay = document.querySelector('.page-overlay');
          overlay && (overlay.style.display = 'none');
        }
      }
    });
  });

  // -- IntersectionObserver for scroll reveal and counters --
  const ioOptions = { root: null, rootMargin: '0px', threshold: 0.12 };

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // for counters: animate numbers
        if (entry.target.classList.contains('counter-number')) {
          animateCounter(entry.target);
        }
        obs.unobserve(entry.target);
      }
    });
  }, ioOptions);

  // attach observer to common elements
  fadeElements.forEach(el => revealObserver.observe(el));
  counters.forEach(el => revealObserver.observe(el));

  // -- Counter animation (simple and safe) --
  function animateCounter(el) {
    const target = parseInt(el.dataset.target || el.textContent.replace(/\D/g,''), 10) || 0;
    const duration = 1200;
    let start = 0;
    const stepTime = Math.max(Math.floor(duration / Math.max(target,1)), 16);
    const startTime = Date.now();
    function step() {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }

  // -- Back to top visibility & click --
  function handleBackBtn() {
    if (window.scrollY > 400) backBtn.classList.add('visible'); else backBtn.classList.remove('visible');
  }
  handleBackBtn();
  window.addEventListener('scroll', handleBackBtn, {passive:true});
  backBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // -- Simple lightbox for portfolio/project thumbs --
  function openLightbox(src, caption) {
    let lb = document.querySelector('.lightbox');
    if (!lb) {
      lb = document.createElement('div'); lb.className = 'lightbox';
      lb.innerHTML = '<div class="inner"><div class="close" aria-label="Close">✕</div><img alt=""><div class="caption"></div></div>';
      document.body.appendChild(lb);
      // close handlers
      lb.querySelector('.close').addEventListener('click', ()=> lb.classList.remove('open'));
      lb.addEventListener('click', (e) => { if (e.target === lb) lb.classList.remove('open'); });
    }
    const img = lb.querySelector('img');
    img.src = src;
    img.alt = caption || '';
    const cap = lb.querySelector('.caption');
    cap.textContent = caption || '';
    lb.classList.add('open');
  }

  // Add click handlers to common portfolio selectors
  document.querySelectorAll('.project-thumb a, .project-thumb, .portfolio-item a, .portfolio-item').forEach(el => {
    el.addEventListener('click', function (e) {
      // find image src: prefer an <a href="..."> or <img> inside
      let target = e.currentTarget;
      // prefer href if present
      const href = target.getAttribute('href');
      let imgSrc = '';
      let caption = '';
      if (href && (/\.(jpg|jpeg|png|webp|gif)$/i.test(href))) {
        e.preventDefault();
        imgSrc = href;
      } else {
        // look for contained image
        const img = target.querySelector('img') || (target.tagName === 'IMG' ? target : null);
        if (img) {
          e.preventDefault();
          imgSrc = img.dataset.large || img.src;
          caption = img.alt || target.getAttribute('title') || '';
        } else {
          return; // nothing to show
        }
      }
      if (imgSrc) openLightbox(imgSrc, caption);
    });
  });

  // -- Contact form: basic required-field check (non-invasive) --
  const contactForm = document.querySelector('.contact-form form, form.contact-form, form#contactForm, .contact form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      const required = contactForm.querySelectorAll('[required]');
      let invalid = false;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('error');
          invalid = true;
          setTimeout(()=> field.classList.remove('error'), 800);
        }
      });
      if (invalid) {
        e.preventDefault();
        contactForm.classList.add('shake');
        setTimeout(()=> contactForm.classList.remove('shake'), 500);
        return false;
      }
    });
  }

  // -- small: remove .error on input as user types --
  document.addEventListener('input', function(e){
    const t = e.target;
    if (t.classList && t.classList.contains('error')) t.classList.remove('error');
  });

  // -- Accessibility: allow ESC to close lightbox --
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      const lb = document.querySelector('.lightbox.open');
      if (lb) lb.classList.remove('open');
    }
  });

});
