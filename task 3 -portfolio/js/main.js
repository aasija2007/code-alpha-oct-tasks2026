/**
 * Aasija Personal Portfolio - Main JavaScript
 * Production-grade modular logic, DOM handlers, animations & API integrations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Application Modules
  AppTheme.init();
  AppPreloader.init();
  AppNavbar.init();
  AppHeroCanvas.init();
  AppHeroTyping.init();
  AppRenderer.init();
  AppStatsCounter.init();
  AppCustomCursor.init();
  AppProjectFilterModal.init();
  AppCommandPalette.init();
  AppTestimonials.init();
  AppContactForm.init();
  AppGitHubAPI.init();
  AppServiceWorker.init();
});

/* ==========================================================================
   1. THEME MANAGEMENT (Dark / Light Mode)
   ========================================================================== */
const AppTheme = {
  themeToggleBtn: null,

  init() {
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem('aasija_portfolio_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    this.applyTheme(initialTheme);

    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
      });
    }
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aasija_portfolio_theme', theme);

    if (this.themeToggleBtn) {
      const icon = this.themeToggleBtn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
      this.themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`);
    }
  }
};

/* ==========================================================================
   2. PRELOADER & PAGE REVEAL
   ========================================================================== */
const AppPreloader = {
  init() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          preloader.classList.add('hidden');
        }, 800);
      });
      // Fallback timeout in case window load event fired early
      setTimeout(() => {
        preloader.classList.add('hidden');
      }, 2500);
    }
  }
};

/* ==========================================================================
   3. NAVBAR, MOBILE DRAWER & SCROLL INDICATOR
   ========================================================================== */
const AppNavbar = {
  init() {
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('scroll-progress-bar');
    const hamburger = document.getElementById('hamburger-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileBackdrop = document.getElementById('mobile-backdrop');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    // Scroll Handler (Sticky Navbar & Progress Bar)
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      if (progressBar) {
        progressBar.style.width = `${scrollPercent}%`;
      }

      if (navbar) {
        if (scrollTop > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      if (backToTopBtn) {
        if (scrollTop > 400) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      }
    });

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Mobile Drawer Handlers
    const toggleMobileNav = (open) => {
      const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.add('open');
        mobileBackdrop.classList.add('open');
        hamburger.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      } else {
        mobileDrawer.classList.remove('open');
        mobileBackdrop.classList.remove('open');
        hamburger.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    };

    if (hamburger) hamburger.addEventListener('click', () => toggleMobileNav());
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', () => toggleMobileNav(false));

    // Close mobile nav on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => toggleMobileNav(false));
    });

    // Active Nav Highlight via IntersectionObserver
    this.setupActiveNavObserver();
  },

  setupActiveNavObserver() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }
};

/* ==========================================================================
   4. INTERACTIVE HERO CANVAS (Particle Mesh)
   ========================================================================== */
const AppHeroCanvas = {
  canvas: null,
  ctx: null,
  particles: [],
  animFrameId: null,
  particleCount: 50,

  init() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.createParticles();
    this.animate();

    // Pause when tab is hidden to save battery & rendering performance
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(this.animFrameId);
      } else {
        this.animate();
      }
    });
  },

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  },

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1
      });
    }
  },

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const particleColor = isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.25)';
    const lineColor = isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(79, 70, 229, 0.08)';

    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particleColor;
      this.ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        let p2 = this.particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = lineColor;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }

    this.animFrameId = requestAnimationFrame(() => this.animate());
  }
};

/* ==========================================================================
   5. ANIMATED TYPING EFFECT
   ========================================================================== */
const AppHeroTyping = {
  roles: PORTFOLIO_DATA.personalInfo.roles,
  roleIndex: 0,
  charIndex: 0,
  isDeleting: false,
  targetEl: null,

  init() {
    this.targetEl = document.getElementById('typing-role');
    if (!this.targetEl || !this.roles.length) return;
    this.type();
  },

  type() {
    const currentRole = this.roles[this.roleIndex];
    
    if (this.isDeleting) {
      this.targetEl.textContent = currentRole.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.targetEl.textContent = currentRole.substring(0, this.charIndex + 1);
      this.charIndex++;
    }

    let typeSpeed = this.isDeleting ? 40 : 80;

    if (!this.isDeleting && this.charIndex === currentRole.length) {
      typeSpeed = 2000; // Pause at end of word
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.roleIndex = (this.roleIndex + 1) % this.roles.length;
      typeSpeed = 400; // Pause before typing next word
    }

    setTimeout(() => this.type(), typeSpeed);
  }
};

/* ==========================================================================
   6. DYNAMIC CONTENT RENDERER
   ========================================================================== */
const AppRenderer = {
  init() {
    this.renderPersonalInfo();
    this.renderSkills('frontend');
    this.setupSkillsTabs();
    this.renderProjects('all');
    this.renderTimeline();
    this.renderServices();
    this.renderTestimonials();
  },

  renderPersonalInfo() {
    const info = PORTFOLIO_DATA.personalInfo;
    
    // Quick Facts
    const quickFactsContainer = document.getElementById('quick-facts-container');
    if (quickFactsContainer) {
      quickFactsContainer.innerHTML = info.quickFacts.map(fact => `
        <div class="fact-item">
          <div class="fact-label">${fact.label}</div>
          <div class="fact-value">${fact.value}</div>
        </div>
      `).join('');
    }

    // Direct Contacts
    const emailEl = document.getElementById('contact-email-text');
    const phoneEl = document.getElementById('contact-phone-text');
    const locationEl = document.getElementById('contact-location-text');

    if (emailEl) emailEl.textContent = info.email;
    if (phoneEl) phoneEl.textContent = info.phone;
    if (locationEl) locationEl.textContent = info.location;
  },

  renderSkills(category) {
    const container = document.getElementById('skills-container');
    if (!container) return;

    const skillList = PORTFOLIO_DATA.skills[category] || [];
    container.innerHTML = skillList.map(skill => `
      <div class="skill-card">
        <div class="skill-card-header">
          <div class="skill-title-group">
            <div class="skill-icon" style="color: ${skill.color}">
              <i class="${skill.icon}"></i>
            </div>
            <span class="skill-name">${skill.name}</span>
          </div>
          <span class="skill-percentage">${skill.level}%</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill" style="width: ${skill.level}%; background: ${skill.color};"></div>
        </div>
      </div>
    `).join('');
  },

  setupSkillsTabs() {
    const tabBtns = document.querySelectorAll('.skills-tab-nav .tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const category = e.target.getAttribute('data-category');
        this.renderSkills(category);
      });
    });
  },

  renderProjects(filter) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    const filtered = filter === 'all' 
      ? PORTFOLIO_DATA.projects 
      : PORTFOLIO_DATA.projects.filter(p => p.category === filter);

    container.innerHTML = filtered.map(p => `
      <div class="project-card" data-category="${p.category}" id="${p.id}">
        <div class="project-thumbnail" style="background: ${p.placeholderGradient};">
          <span class="project-card-badge">${p.category}</span>
        </div>
        <div class="project-content">
          <div class="project-subtitle">${p.subtitle}</div>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-description">${p.description}</p>
          <div class="project-tags">
            ${p.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}
          </div>
          <div class="project-actions">
            <button class="btn btn-outline btn-icon-text view-project-modal-btn" data-id="${p.id}">
              <i class="fas fa-info-circle"></i> Details
            </button>
            <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-icon-text">
              <i class="fas fa-external-link-alt"></i> Live Demo
            </a>
            <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-icon-text" aria-label="GitHub Repository">
              <i class="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.timeline.map(item => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <span class="timeline-badge">${item.period}</span>
          <h3 class="timeline-title">${item.title}</h3>
          <div class="timeline-org">${item.organization} (${item.location})</div>
          <p class="timeline-description">${item.description}</p>
          <ul class="timeline-highlights">
            ${item.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  },

  renderServices() {
    const container = document.getElementById('services-container');
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.services.map(s => `
      <div class="service-card">
        <div class="service-icon"><i class="${s.icon}"></i></div>
        <h3 class="service-title">${s.title}</h3>
        <p class="service-description">${s.description}</p>
      </div>
    `).join('');
  },

  renderTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.testimonials.map((t, idx) => `
      <div class="testimonial-card ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <i class="fas fa-quote-left quote-icon"></i>
        <p class="testimonial-quote">"${t.quote}"</p>
        <div class="testimonial-author-group">
          <div class="author-avatar">${t.initials}</div>
          <div class="author-info">
            <div class="author-name">${t.author}</div>
            <div class="author-role">${t.role}</div>
          </div>
        </div>
      </div>
    `).join('');

    const dotsContainer = document.getElementById('testimonial-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = PORTFOLIO_DATA.testimonials.map((_, idx) => `
        <span class="carousel-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>
      `).join('');
    }
  }
};

/* ==========================================================================
   7. ANIMATED STAT COUNTERS
   ========================================================================== */
const AppStatsCounter = {
  hasAnimated: false,

  init() {
    const statsSection = document.getElementById('about');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.animateCounters();
          this.hasAnimated = true;
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  },

  animateCounters() {
    PORTFOLIO_DATA.personalInfo.stats.forEach(stat => {
      const el = document.getElementById(stat.id);
      if (!el) return;

      let start = 0;
      const end = stat.value;
      const duration = 1800; // ms
      const stepTime = Math.abs(Math.floor(duration / end));

      const timer = setInterval(() => {
        start += 1;
        el.textContent = `${start}${stat.suffix}`;
        if (start >= end) {
          el.textContent = `${end}${stat.suffix}`;
          clearInterval(timer);
        }
      }, stepTime);
    });
  }
};

/* ==========================================================================
   8. CUSTOM ANIMATED CURSOR
   ========================================================================== */
const AppCustomCursor = {
  init() {
    const dot = document.querySelector('.custom-cursor-dot');
    const ring = document.querySelector('.custom-cursor-ring');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    const renderRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderRing);
    };
    renderRing();

    // Hover effect on interactive elements
    const interactiveEls = 'a, button, input, textarea, .tab-btn, .filter-btn, .project-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveEls)) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveEls)) {
        document.body.classList.remove('cursor-hover');
      }
    });
  }
};

/* ==========================================================================
   9. PROJECT FILTERING & MODAL POPUP
   ========================================================================== */
const AppProjectFilterModal = {
  modalOverlay: null,

  init() {
    this.modalOverlay = document.getElementById('project-modal');
    this.setupFilters();
    this.setupModalTriggers();
  },

  setupFilters() {
    const filterBtns = document.querySelectorAll('.projects-filter-nav .filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const filter = e.target.getAttribute('data-filter');
        AppRenderer.renderProjects(filter);
      });
    });
  },

  setupModalTriggers() {
    document.addEventListener('click', (e) => {
      const modalBtn = e.target.closest('.view-project-modal-btn');
      if (modalBtn) {
        const projectId = modalBtn.getAttribute('data-id');
        this.openModal(projectId);
      }

      if (e.target.closest('#modal-close-btn') || e.target === this.modalOverlay) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalOverlay.classList.contains('active')) {
        this.closeModal();
      }
    });
  },

  openModal(projectId) {
    const project = PORTFOLIO_DATA.projects.find(p => p.id === projectId);
    if (!project || !this.modalOverlay) return;

    const titleEl = document.getElementById('modal-project-title');
    const bodyEl = document.getElementById('modal-project-body');

    if (titleEl) titleEl.textContent = project.title;
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="modal-meta-grid">
          <div class="modal-meta-item"><span>Category</span><strong>${project.category.toUpperCase()}</strong></div>
          <div class="modal-meta-item"><span>Role</span><strong>${project.details.role}</strong></div>
          <div class="modal-meta-item"><span>Tech Stack</span><strong>${project.tags.join(', ')}</strong></div>
        </div>

        <h4 class="modal-section-h4"><i class="fas fa-exclamation-triangle"></i> Problem Statement</h4>
        <p class="modal-description">${project.details.problem}</p>

        <h4 class="modal-section-h4"><i class="fas fa-check-circle"></i> Key Features</h4>
        <ul class="modal-features-list">
          ${project.details.features.map(f => `<li>${f}</li>`).join('')}
        </ul>

        <h4 class="modal-section-h4"><i class="fas fa-tools"></i> Engineering Challenges</h4>
        <p class="modal-description">${project.details.challenges}</p>

        <div style="margin-top: 30px; display: flex; gap: 16px;">
          <a href="${project.liveUrl}" target="_blank" class="btn btn-primary"><i class="fas fa-external-link-alt"></i> View Live Site</a>
          <a href="${project.githubUrl}" target="_blank" class="btn btn-secondary"><i class="fab fa-github"></i> View GitHub Code</a>
        </div>
      `;
    }

    this.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
};

/* ==========================================================================
   10. COMMAND PALETTE (Ctrl+K)
   ========================================================================== */
const AppCommandPalette = {
  overlay: null,

  init() {
    this.overlay = document.getElementById('cmd-palette-modal');
    if (!this.overlay) return;

    const cmdBtns = document.querySelectorAll('.cmd-palette-btn');
    cmdBtns.forEach(btn => btn.addEventListener('click', () => this.openPalette()));

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.togglePalette();
      }
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
        this.closePalette();
      }
    });

    const searchInput = document.getElementById('cmd-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.filterCommands(e.target.value));
    }

    document.addEventListener('click', (e) => {
      const item = e.target.closest('.cmd-item');
      if (item) {
        const action = item.getAttribute('data-action');
        this.executeCommand(action);
      }
      if (e.target === this.overlay || e.target.closest('#cmd-close-btn')) {
        this.closePalette();
      }
    });
  },

  togglePalette() {
    if (this.overlay.classList.contains('active')) {
      this.closePalette();
    } else {
      this.openPalette();
    }
  },

  openPalette() {
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const input = document.getElementById('cmd-search-input');
    if (input) {
      input.value = '';
      input.focus();
      this.filterCommands('');
    }
  },

  closePalette() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  },

  filterCommands(query) {
    const list = document.getElementById('cmd-results-list');
    if (!list) return;

    const commands = [
      { label: 'Go to Home', action: '#hero', icon: 'fas fa-home' },
      { label: 'Go to About Section', action: '#about', icon: 'fas fa-user' },
      { label: 'View Skills', action: '#skills', icon: 'fas fa-code' },
      { label: 'Browse Projects', action: '#projects', icon: 'fas fa-folder-open' },
      { label: 'View Experience & Education', action: '#experience', icon: 'fas fa-graduation-cap' },
      { label: 'Download Resume', action: 'download-resume', icon: 'fas fa-file-download' },
      { label: 'Contact Aasija', action: '#contact', icon: 'fas fa-envelope' },
      { label: 'Toggle Dark/Light Theme', action: 'toggle-theme', icon: 'fas fa-adjust' }
    ];

    const q = query.toLowerCase().trim();
    const filtered = commands.filter(c => c.label.toLowerCase().includes(q));

    list.innerHTML = filtered.map((c, i) => `
      <li class="cmd-item ${i === 0 ? 'selected' : ''}" data-action="${c.action}">
        <span><i class="${c.icon}" style="margin-right: 10px;"></i> ${c.label}</span>
        <span class="cmd-key-badge">Select</span>
      </li>
    `).join('');
  },

  executeCommand(action) {
    this.closePalette();
    if (action.startsWith('#')) {
      const el = document.querySelector(action);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'toggle-theme') {
      AppTheme.themeToggleBtn.click();
    } else if (action === 'download-resume') {
      const btn = document.getElementById('download-resume-btn');
      if (btn) btn.click();
    }
  }
};

/* ==========================================================================
   11. TESTIMONIALS CAROUSEL
   ========================================================================== */
const AppTestimonials = {
  currentIndex: 0,
  timer: null,

  init() {
    const dots = document.querySelectorAll('#testimonial-dots .carousel-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        this.showSlide(idx);
      });
    });

    this.startAutoSlide();
  },

  showSlide(index) {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('#testimonial-dots .carousel-dot');

    cards.forEach(c => c.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    this.currentIndex = index % cards.length;

    if (cards[this.currentIndex]) cards[this.currentIndex].classList.add('active');
    if (dots[this.currentIndex]) dots[this.currentIndex].classList.add('active');
  },

  startAutoSlide() {
    this.timer = setInterval(() => {
      this.showSlide(this.currentIndex + 1);
    }, 6000);
  }
};

/* ==========================================================================
   12. CONTACT FORM & CLIENT-SIDE VALIDATION
   ========================================================================== */
const AppContactForm = {
  init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const messageInput = document.getElementById('contact-message');
      const alertBox = document.getElementById('form-alert');

      let isValid = true;

      // Simple validation logic
      if (!nameInput.value.trim()) {
        nameInput.classList.add('invalid');
        isValid = false;
      } else {
        nameInput.classList.remove('invalid');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add('invalid');
        isValid = false;
      } else {
        emailInput.classList.remove('invalid');
      }

      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        messageInput.classList.add('invalid');
        isValid = false;
      } else {
        messageInput.classList.remove('invalid');
      }

      if (isValid) {
        if (alertBox) {
          alertBox.className = 'form-alert success';
          alertBox.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully. Aasija will get back to you soon.';
        }
        form.reset();
      }
    });
  }
};

/* ==========================================================================
   13. GITHUB API INTEGRATION
   ========================================================================== */
const AppGitHubAPI = {
  init() {
    const username = 'aasija2007';
    const container = document.getElementById('github-repos-grid');
    if (!container) return;

    if (!username || username === 'YOUR_GITHUB_USERNAME') {
      container.innerHTML = `
        <div class="repo-card">
          <h5><i class="fab fa-github"></i> codealpha-image-gallery</h5>
          <p style="color: var(--text-secondary);">Interactive Lightbox gallery built with vanilla JS</p>
          <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted);">★ 12 Stars | HTML/CSS/JS</div>
        </div>
        <div class="repo-card">
          <h5><i class="fab fa-github"></i> codealpha-calculator</h5>
          <p style="color: var(--text-secondary);">Scientific calculator web app with dual theme engine</p>
          <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted);">★ 18 Stars | JavaScript</div>
        </div>
      `;
      return;
    }

    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=4`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          container.innerHTML = data.map(repo => `
            <div class="repo-card">
              <h5><i class="fab fa-github"></i> ${repo.name}</h5>
              <p style="color: var(--text-secondary);">${repo.description || 'No description provided.'}</p>
              <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted);">★ ${repo.stargazers_count} Stars | ${repo.language || 'Code'}</div>
            </div>
          `).join('');
        }
      })
      .catch(() => {
        // Fallback quiet handle
      });
  }
};

/* ==========================================================================
   14. SERVICE WORKER REGISTRATION (PWA)
   ========================================================================== */
const AppServiceWorker = {
  init() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log('ServiceWorker registered successfully.'))
        .catch(err => console.log('ServiceWorker registration failed:', err));
    }
  }
};
