import os
import re

desktop_dir = r"C:\Users\ASUS\Desktop\V-DESK-Workspace"
scratch_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace"

# =========================================================================
# 1. CSS FOR SCROLL-BASED ANIMATIONS ACROSS WHOLE WEBSITE
# =========================================================================
scroll_animation_css = '''
/* ==========================================================================
   V-DESK LUXURY SCROLL-BASED ANIMATION SYSTEM
   ========================================================================== */

/* 1. Global Reading Scroll Progress Bar */
.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 3px;
  background: linear-gradient(90deg, #C8922E 0%, #D9B56A 50%, #C8922E 100%);
  box-shadow: 0 0 10px rgba(200, 146, 46, 0.6);
  z-index: 9999;
  pointer-events: none;
  transition: width 0.1s linear;
}

/* 2. Scroll-To-Top Floating Circular Button */
.scroll-top-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #FFFFFF;
  border: 1.5px solid #E8E2D8;
  color: #0B2348;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 6px 20px rgba(11, 35, 72, 0.12);
  cursor: pointer;
  z-index: 90;
  opacity: 0;
  visibility: hidden;
  transform: translateY(16px) scale(0.9);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-top-btn.is-visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.scroll-top-btn:hover {
  background-color: #0B2348;
  color: #C8922E;
  border-color: #C8922E;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 24px rgba(11, 35, 72, 0.2);
}

/* 3. Universal Scroll Reveal Primitives */
.reveal,
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(32px);
  filter: blur(4px);
  transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.75s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.75s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform, filter;
}

.reveal.is-revealed,
.reveal.visible,
.reveal-on-scroll.is-revealed {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

/* Reveal from Left */
.reveal-left {
  opacity: 0;
  transform: translateX(-40px);
  filter: blur(4px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-left.is-revealed {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

/* Reveal from Right */
.reveal-right {
  opacity: 0;
  transform: translateX(40px);
  filter: blur(4px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-right.is-revealed {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

/* Reveal Scale (for Showcase & Images) */
.reveal-scale {
  opacity: 0;
  transform: scale(0.92);
  filter: blur(5px);
  transition: all 0.85s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-scale.is-revealed {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

/* Staggered Children Grid Animations */
.reveal-stagger > * {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease,
              box-shadow 0.3s ease;
}

.reveal-stagger.is-revealed > *,
.reveal-stagger.visible > * {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger Delays (up to 12 items) */
.reveal-stagger.is-revealed > *:nth-child(1), .reveal-stagger.visible > *:nth-child(1) { transition-delay: 0.04s; }
.reveal-stagger.is-revealed > *:nth-child(2), .reveal-stagger.visible > *:nth-child(2) { transition-delay: 0.10s; }
.reveal-stagger.is-revealed > *:nth-child(3), .reveal-stagger.visible > *:nth-child(3) { transition-delay: 0.16s; }
.reveal-stagger.is-revealed > *:nth-child(4), .reveal-stagger.visible > *:nth-child(4) { transition-delay: 0.22s; }
.reveal-stagger.is-revealed > *:nth-child(5), .reveal-stagger.visible > *:nth-child(5) { transition-delay: 0.28s; }
.reveal-stagger.is-revealed > *:nth-child(6), .reveal-stagger.visible > *:nth-child(6) { transition-delay: 0.34s; }
.reveal-stagger.is-revealed > *:nth-child(7), .reveal-stagger.visible > *:nth-child(7) { transition-delay: 0.40s; }
.reveal-stagger.is-revealed > *:nth-child(8), .reveal-stagger.visible > *:nth-child(8) { transition-delay: 0.46s; }
.reveal-stagger.is-revealed > *:nth-child(9), .reveal-stagger.visible > *:nth-child(9) { transition-delay: 0.52s; }
.reveal-stagger.is-revealed > *:nth-child(10), .reveal-stagger.visible > *:nth-child(10) { transition-delay: 0.58s; }
.reveal-stagger.is-revealed > *:nth-child(11), .reveal-stagger.visible > *:nth-child(11) { transition-delay: 0.64s; }
.reveal-stagger.is-revealed > *:nth-child(12), .reveal-stagger.visible > *:nth-child(12) { transition-delay: 0.70s; }

/* 4. Gold Line Drawing Animation on Scroll */
.gold-line-draw {
  position: relative;
}
.gold-line-draw::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #C8922E, #D9B56A);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.gold-line-draw.is-revealed::after {
  transform: scaleX(1);
}

/* 5. Interactive Scroll-Driven Showcase Video Controls */
.showcase-card__controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 8;
  background: rgba(11, 35, 72, 0.8);
  backdrop-filter: blur(8px);
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(200, 146, 46, 0.4);
  color: #FFFFFF;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.showcase-card__controls:hover {
  background: #0B2348;
  border-color: #C8922E;
  color: #C8922E;
}

.showcase-card__controls i {
  color: #C8922E;
  font-size: 0.9rem;
}
'''

# =========================================================================
# 2. JAVASCRIPT FOR SCROLL-BASED ANIMATIONS & VIDEO SCRUBBING
# =========================================================================
scroll_animation_js = '''
// ==========================================================================
// V-DESK MASTER SCROLL ANIMATION & VIDEO SCRUBBING ENGINE
// ==========================================================================
(function initMasterScrollSystem() {
  // 1. Reading Progress Bar at top of viewport
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  progressBar.id = 'scrollProgressBar';
  document.body.appendChild(progressBar);

  // 2. Scroll-to-Top Button
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.className = 'scroll-top-btn';
  scrollTopBtn.id = 'scrollTopBtn';
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
  scrollTopBtn.innerHTML = '<i class="ph-bold ph-arrow-up"></i>';
  document.body.appendChild(scrollTopBtn);

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 3. Scroll Update Handler (Throttled via requestAnimationFrame)
  let isTicking = false;
  const showcaseVideo = document.getElementById('showcaseVideo') || document.querySelector('.showcase-card__video');
  const heroSection = document.getElementById('home') || document.querySelector('.hero-white');

  function onWindowScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Update progress bar
    if (docHeight > 0) {
      const scrollPct = (scrollY / docHeight) * 100;
      progressBar.style.width = scrollPct + '%';
    }

    // Toggle scroll-to-top button
    if (scrollY > 400) {
      scrollTopBtn.classList.add('is-visible');
    } else {
      scrollTopBtn.classList.remove('is-visible');
    }

    // Interactive Hero Video Scrubbing on scroll
    if (showcaseVideo && heroSection) {
      const heroRect = heroSection.getBoundingClientRect();
      const heroHeight = heroSection.offsetHeight;
      if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
        const heroProgress = Math.min(Math.max(-heroRect.top / (heroHeight * 0.8), 0), 1);
        if (showcaseVideo.duration && !isNaN(showcaseVideo.duration) && !showcaseVideo.seeking) {
          showcaseVideo.currentTime = heroProgress * showcaseVideo.duration;
        }
      }
    }

    isTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(onWindowScroll);
    }
  }, { passive: true });

  // Initial trigger
  onWindowScroll();

  // 4. Luxury IntersectionObserver for Scroll Reveals
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed', 'visible');
          
          // Animate number counters if inside this section
          entry.target.querySelectorAll('.counter').forEach(counter => {
            if (!counter.dataset.animated && typeof animateCounter === 'function') {
              animateCounter(counter);
              counter.dataset.animated = '1';
            }
          });

          // Unobserve once revealed for permanent luxury presentation
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    // Observe all targets across the whole website
    const targets = document.querySelectorAll(
      '.reveal, .reveal-stagger, .reveal-on-scroll, .service-card, .location-card, ' +
      '.trust-strip__item, .knowledge__card, .faq-item, .showcase-card, .section__header, ' +
      '.pricing__controls, .pricing__summary, .wizard__container, .contact__form-card'
    );

    targets.forEach(el => {
      el.classList.add('reveal-on-scroll');
      revealObserver.observe(el);
    });
  } else {
    // Fallback for older browsers
    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-on-scroll').forEach(el => {
      el.classList.add('is-revealed', 'visible');
    });
  }

  // 5. Video Play/Pause Scrub Toggle on Click
  if (showcaseVideo) {
    const showcaseCard = showcaseVideo.closest('.showcase-card');
    if (showcaseCard && !showcaseCard.querySelector('.showcase-card__controls')) {
      const controls = document.createElement('div');
      controls.className = 'showcase-card__controls';
      controls.innerHTML = '<i class="ph-bold ph-sliders"></i> <span>Scroll to Scrub</span>';
      showcaseCard.appendChild(controls);

      controls.addEventListener('click', () => {
        if (showcaseVideo.paused) {
          showcaseVideo.play();
          controls.innerHTML = '<i class="ph-bold ph-pause"></i> <span>Playing</span>';
        } else {
          showcaseVideo.pause();
          controls.innerHTML = '<i class="ph-bold ph-sliders"></i> <span>Scroll to Scrub</span>';
        }
      });
    }
  }
})();
'''

# =========================================================================
# APPLY TO BOTH WORKSPACES
# =========================================================================
for d in [desktop_dir, scratch_dir]:
    if not os.path.exists(d):
        continue

    # 1. Update styles.css
    css_file = os.path.join(d, "styles.css")
    with open(css_file, "r", encoding="utf-8") as f:
        css = f.read()

    marker = "/* ==========================================================================\n   V-DESK LUXURY SCROLL-BASED ANIMATION SYSTEM"
    if marker in css:
        css = css[:css.find(marker)]
    css = css.rstrip() + "\n\n" + scroll_animation_css

    with open(css_file, "w", encoding="utf-8") as f:
        f.write(css)
    print(f"Appended scroll animations to {css_file}")

    # 2. Update app.js
    js_file = os.path.join(d, "app.js")
    with open(js_file, "r", encoding="utf-8") as f:
        js = f.read()

    js_marker = "// V-DESK MASTER SCROLL ANIMATION & VIDEO SCRUBBING ENGINE"
    if js_marker in js:
        js = js[:js.find("// ==========================================================================\n// V-DESK MASTER SCROLL ANIMATION")]
    js = js.rstrip() + "\n\n" + scroll_animation_js

    with open(js_file, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"Appended master scroll system to {js_file}")

    # 3. Update index.html: Give showcase video the ID 'showcaseVideo'
    html_file = os.path.join(d, "index.html")
    with open(html_file, "r", encoding="utf-8") as f:
        html = f.read()

    html = html.replace('class="showcase-card__video"', 'class="showcase-card__video" id="showcaseVideo"')
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated index.html in {d}")

print("Master scroll animation & video scrubbing integration complete!")
