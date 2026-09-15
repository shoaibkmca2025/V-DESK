import os
import re

desktop_dir = r"C:\Users\ASUS\Desktop\V-DESK-Workspace"
scratch_dir = r"C:\Users\ASUS\.gemini\antigravity-ide\scratch\vdesk-workspace"

# =========================================================================
# 1. NEW HTML MARKUP FOR VIDEO HERO
# =========================================================================
new_hero_html = '''  <!-- ====================================================================
       SECTION 01 — SCROLL-CONTROLLED CINEMATIC VIDEO HERO
       Apple-style frame-accurate video scrub pinned at 600vh height
       ==================================================================== -->
  <section class="video-hero-scroll-container" id="home">
    <!-- STICKY VIEWPORT (100vh / 100svh) -->
    <div class="video-hero-sticky" id="heroSticky">
      
      <!-- CINEMATIC VIDEO STAGE -->
      <div class="video-hero__media-wrapper">
        <video 
          id="heroScrubVideo" 
          class="video-hero__video" 
          src="assets/vdesk-hero-video.mp4" 
          muted 
          playsinline 
          preload="auto"
          tabindex="-1"
          aria-hidden="true"
        ></video>

        <!-- Cinematic Gradient Overlays (preserves video details while guaranteeing text contrast) -->
        <div class="video-hero__overlay video-hero__overlay--base"></div>
        <div class="video-hero__overlay video-hero__overlay--linear"></div>
        <div class="video-hero__overlay video-hero__overlay--radial"></div>
        <div class="video-hero__overlay video-hero__overlay--bottom"></div>
      </div>

      <!-- SYNCHRONIZED SCENE STAGE (5 Distinct Narrative Scenes) -->
      <div class="container video-hero__stage">
        
        <!-- SCENE 01: 0% - 18% -->
        <div class="hero-scene is-active" id="heroScene1" data-scene="1">
          <div class="hero-scene__eyebrow">
            <span class="hero-scene__pill"><i class="ph-bold ph-shield-check"></i> V-DESK WORKSPACE & CONSULTING</span>
            <span class="hero-scene__badge">India's Trusted Business Infrastructure</span>
          </div>
          <h1 class="hero-scene__title">
            <span class="scene-line">YOUR BUSINESS.</span>
            <span class="scene-line text-gold">YOUR SPACE.</span>
            <span class="scene-line">YOUR ADDRESS.</span>
          </h1>
          <p class="hero-scene__desc">
            Premium coworking, virtual offices, meeting rooms and business solutions built around your growth.
          </p>
          <div class="hero-scene__actions">
            <a href="#services" class="btn btn--gold btn--lg">
              <i class="ph-bold ph-compass"></i> Explore Solutions
            </a>
            <button class="btn btn--outline btn--lg" onclick="openConsultationModal()">
              <i class="ph-bold ph-calendar-check"></i> Book a Tour
            </button>
          </div>
        </div>

        <!-- SCENE 02: 18% - 38% -->
        <div class="hero-scene" id="heroScene2" data-scene="2">
          <div class="hero-scene__eyebrow">
            <span class="hero-scene__pill"><i class="ph-bold ph-laptop"></i> FLEXIBLE WORKSPACES</span>
          </div>
          <h2 class="hero-scene__title">
            <span class="scene-line text-gold">YOUR SPACE.</span>
          </h2>
          <p class="hero-scene__desc">
            Workspaces built for focus, confidentiality, and effortless day-to-day execution across prime tech hubs.
          </p>
          <div class="hero-scene__actions">
            <a href="#services" class="btn btn--outline btn--md">
              <i class="ph-bold ph-door"></i> Private Cabins & Dedicated Desks
            </a>
            <button class="btn btn--gold btn--md" onclick="openQuoteModal('Coworking Space')">
              <i class="ph-bold ph-paper-plane-tilt"></i> Get Space Quote
            </button>
          </div>
        </div>

        <!-- SCENE 03: 38% - 58% -->
        <div class="hero-scene" id="heroScene3" data-scene="3">
          <div class="hero-scene__eyebrow">
            <span class="hero-scene__pill"><i class="ph-bold ph-presentation"></i> HIGH-IMPACT COLLABORATION</span>
          </div>
          <h2 class="hero-scene__title">
            <span class="scene-line text-gold">MEET BETTER.</span>
          </h2>
          <p class="hero-scene__desc">
            Client-ready meeting environments equipped with high-speed video conferencing, acoustic privacy, and executive hospitality.
          </p>
          <div class="hero-scene__actions">
            <button class="btn btn--gold btn--md" onclick="openQuoteModal('Meeting Rooms')">
              <i class="ph-bold ph-clock"></i> Book by the Hour
            </button>
            <a href="#locations" class="btn btn--outline btn--md">
              <i class="ph-bold ph-map-pin"></i> View Boardrooms
            </a>
          </div>
        </div>

        <!-- SCENE 04: 58% - 78% -->
        <div class="hero-scene" id="heroScene4" data-scene="4">
          <div class="hero-scene__eyebrow">
            <span class="hero-scene__pill"><i class="ph-bold ph-buildings"></i> CORPORATE CREDIBILITY</span>
          </div>
          <h2 class="hero-scene__title">
            <span class="scene-line text-gold">LOOK PROFESSIONAL.</span>
          </h2>
          <p class="hero-scene__desc">
            A prestigious Grade-A commercial address that builds instant institutional trust with banks, enterprise clients, and tax authorities.
          </p>
          <div class="hero-scene__actions">
            <a href="#wizard" class="btn btn--gold btn--md">
              <i class="ph-bold ph-file-text"></i> Start Registration Wizard
            </a>
            <button class="btn btn--outline btn--md" onclick="openQuoteModal('Virtual Office Prime')">
              <i class="ph-bold ph-calculator"></i> Calculate Pricing
            </button>
          </div>
        </div>

        <!-- SCENE 05: 78% - 100% -->
        <div class="hero-scene" id="heroScene5" data-scene="5">
          <div class="hero-scene__eyebrow">
            <span class="hero-scene__pill"><i class="ph-bold ph-trend-up"></i> ENTERPRISE SCALE</span>
          </div>
          <h2 class="hero-scene__title">
            <span class="scene-line text-gold">GROW WITH V DESK.</span>
          </h2>
          <p class="hero-scene__desc">
            Everything your business needs to move forward — from GST registrations and trademarks to nationwide turnkey office networks.
          </p>
          <div class="hero-scene__actions">
            <a href="#services" class="btn btn--gold btn--lg">
              <i class="ph-bold ph-sparkle"></i> Discover V DESK
            </a>
            <button class="btn btn--outline btn--lg" onclick="openQuoteModal('Hero Final Scene')">
              <i class="ph-bold ph-paper-plane-tilt"></i> Get Instant Proposal
            </button>
          </div>
        </div>

      </div>

      <!-- MINIMAL VERTICAL PROGRESS INDICATOR (DESKTOP RIGHT) -->
      <nav class="hero-progress-nav" aria-label="Hero Timeline Navigation" id="heroProgressNav">
        <button class="hero-progress-dot is-active" data-scene-target="1" aria-label="Scene 1: Your Business">
          <span class="dot-label">Overview</span>
          <span class="dot-indicator"></span>
        </button>
        <button class="hero-progress-dot" data-scene-target="2" aria-label="Scene 2: Your Space">
          <span class="dot-label">Workspaces</span>
          <span class="dot-indicator"></span>
        </button>
        <button class="hero-progress-dot" data-scene-target="3" aria-label="Scene 3: Meet Better">
          <span class="dot-label">Meetings</span>
          <span class="dot-indicator"></span>
        </button>
        <button class="hero-progress-dot" data-scene-target="4" aria-label="Scene 4: Look Professional">
          <span class="dot-label">Address</span>
          <span class="dot-indicator"></span>
        </button>
        <button class="hero-progress-dot" data-scene-target="5" aria-label="Scene 5: Grow With V DESK">
          <span class="dot-label">Enterprise</span>
          <span class="dot-indicator"></span>
        </button>
      </nav>

      <!-- SCROLL TO EXPLORE PROMPT (BOTTOM CENTER) -->
      <div class="hero-scroll-indicator" id="heroScrollIndicator">
        <span class="hero-scroll-indicator__text">SCROLL TO EXPLORE</span>
        <div class="hero-scroll-indicator__track">
          <div class="hero-scroll-indicator__line"></div>
        </div>
      </div>

    </div>
  </section>'''

# =========================================================================
# 2. CSS STYLES FOR SCROLL-CONTROLLED VIDEO HERO
# =========================================================================
video_hero_css = '''
/* ==========================================================================
   V-DESK SCROLL-CONTROLLED CINEMATIC VIDEO HERO
   Apple-grade Frame Scrubbing Architecture (500vh - 700vh)
   ========================================================================== */

.video-hero-scroll-container {
  position: relative;
  height: 600vh; /* 6x viewport scroll travel for precise, luxurious scrubbing */
  width: 100%;
  background: #020814;
}

.video-hero-sticky {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  display: flex;
  align-items: center;
  z-index: 10;
  contain: layout paint;
}

/* Fullscreen Background Media Wrapper */
.video-hero__media-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  background: #020814;
}

.video-hero__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  display: block;
  opacity: 0.95;
  will-change: transform;
}

/* Cinematic Multi-Layer Gradient Overlays */
.video-hero__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Base Tint: Subdued tone matching V-DESK deep navy #040e20 */
.video-hero__overlay--base {
  background: rgba(4, 14, 32, 0.42);
  mix-blend-mode: multiply;
  z-index: 2;
}

/* Left-to-Right Gradient: guarantees razor-sharp readability for left-aligned content */
.video-hero__overlay--linear {
  background: linear-gradient(
    90deg, 
    rgba(3, 10, 24, 0.92) 0%, 
    rgba(3, 10, 24, 0.72) 38%, 
    rgba(3, 10, 24, 0.35) 70%, 
    rgba(3, 10, 24, 0.15) 100%
  );
  z-index: 3;
}

/* Radial Vignette: keeps center architectural focal points illuminated */
.video-hero__overlay--radial {
  background: radial-gradient(
    circle at 65% 50%,
    transparent 35%,
    rgba(2, 8, 20, 0.6) 80%,
    rgba(2, 8, 20, 0.9) 100%
  );
  z-index: 4;
}

/* Bottom Fade: seamless bridge into the trust strip / solutions section */
.video-hero__overlay--bottom {
  background: linear-gradient(
    180deg,
    transparent 65%,
    rgba(2, 8, 20, 0.75) 85%,
    #020814 100%
  );
  z-index: 5;
}

/* Content Stage & Synchronized Scenes */
.video-hero__stage {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
  pointer-events: none; /* children enable pointer events */
}

.hero-scene {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 24px;
  max-width: 760px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(calc(-50% + 35px));
  filter: blur(8px);
  transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.55s cubic-bezier(0.16, 1, 0.3, 1),
              visibility 0.55s;
  pointer-events: none;
}

.hero-scene.is-active {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) scale(1);
  filter: blur(0);
  pointer-events: auto;
}

/* Scene Typography & Accents */
.hero-scene__eyebrow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.hero-scene__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(197, 146, 57, 0.15);
  border: 1px solid rgba(197, 146, 57, 0.35);
  color: #c59239;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.hero-scene__badge {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.04em;
}

.hero-scene__title {
  font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
  font-size: clamp(2.4rem, 5.2vw, 4.2rem);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: 0.02em;
  color: #ffffff;
  margin: 0 0 20px;
  text-transform: uppercase;
}

.hero-scene__title .scene-line {
  display: block;
}

.hero-scene__title .text-gold {
  background: linear-gradient(135deg, #ffffff 10%, #e2b96e 50%, #c59239 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-scene__desc {
  font-size: clamp(1.05rem, 1.4vw, 1.25rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.82);
  margin: 0 0 32px;
  max-width: 620px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

.hero-scene__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.btn--lg {
  padding: 14px 28px;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 10px;
}

.btn--md {
  padding: 11px 22px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
}

/* Minimal Vertical Progress Indicator (Desktop Right) */
.hero-progress-nav {
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 18px;
  z-index: 20;
}

.hero-progress-dot {
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-direction: row-reverse;
  outline: none;
}

.dot-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.dot-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  opacity: 0;
  transform: translateX(6px);
  transition: all 0.25s ease;
  pointer-events: none;
}

.hero-progress-dot:hover .dot-label,
.hero-progress-dot.is-active .dot-label {
  opacity: 1;
  transform: translateX(0);
}

.hero-progress-dot:hover .dot-indicator {
  background: rgba(197, 146, 57, 0.6);
  transform: scale(1.3);
}

.hero-progress-dot.is-active .dot-indicator {
  background: #c59239;
  border-color: #e2b96e;
  box-shadow: 0 0 12px rgba(197, 146, 57, 0.8);
  transform: scale(1.5);
}

.hero-progress-dot.is-active .dot-label {
  color: #c59239;
}

/* Scroll To Explore Prompt */
.hero-scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 20;
  pointer-events: none;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.hero-scroll-indicator.is-hidden {
  opacity: 0;
  transform: translate(-50%, 15px);
}

.hero-scroll-indicator__text {
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 600;
}

.hero-scroll-indicator__track {
  width: 2px;
  height: 38px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.hero-scroll-indicator__line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 45%;
  background: linear-gradient(180deg, #c59239, #ffffff);
  border-radius: 2px;
  animation: scrollLinePulse 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

@keyframes scrollLinePulse {
  0% { transform: translateY(-100%); opacity: 0; }
  35% { opacity: 1; }
  75% { transform: translateY(220%); opacity: 1; }
  100% { transform: translateY(220%); opacity: 0; }
}

/* Transparent Navbar Over Hero State */
.site-header--over-hero {
  background: transparent !important;
  border-bottom-color: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .hero-progress-nav {
    display: none;
  }
  .hero-scene {
    left: 20px;
    right: 20px;
    max-width: 100%;
  }
  .video-hero__overlay--linear {
    background: linear-gradient(
      180deg,
      rgba(3, 10, 24, 0.85) 0%,
      rgba(3, 10, 24, 0.7) 40%,
      rgba(3, 10, 24, 0.9) 100%
    );
  }
}

@media (max-width: 576px) {
  .video-hero-scroll-container {
    height: 520vh; /* slightly shorter on mobile for quicker progression */
  }
  .hero-scene__actions {
    flex-direction: column;
    align-items: stretch;
  }
  .btn--lg, .btn--md {
    width: 100%;
    justify-content: center;
  }
  .hero-scroll-indicator {
    bottom: 18px;
  }
}

/* Accessibility: Prefers Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .video-hero-scroll-container {
    height: 100vh;
  }
  .hero-scene {
    transition: none;
  }
  .hero-scroll-indicator__line {
    animation: none;
  }
}
'''

# =========================================================================
# 3. JAVASCRIPT SCRUB ENGINE FOR APP.JS
# =========================================================================
video_hero_js = '''
// ==========================================================================
// V-DESK SCROLL-CONTROLLED CINEMATIC VIDEO SCRUBBING ENGINE
// ==========================================================================
(function initVideoHeroScrub() {
  const container = document.querySelector('.video-hero-scroll-container');
  const video = document.getElementById('heroScrubVideo');
  const scenes = document.querySelectorAll('.hero-scene');
  const dots = document.querySelectorAll('.hero-progress-dot');
  const scrollIndicator = document.getElementById('heroScrollIndicator');
  const header = document.getElementById('siteHeader');

  if (!container || !video) return;

  // Video playback safety: Ensure video remains muted, paused, and inline
  video.muted = true;
  video.pause();

  let targetProgress = 0;
  let currentProgress = 0;
  let isTicking = false;
  let hasUserScrolled = false;
  const lerpEase = 0.12; // Buttery smooth interpolation factor

  // Scene thresholds: [start, end, sceneIndex (1-5)]
  const sceneBounds = [
    { scene: 1, start: 0.00, end: 0.18 },
    { scene: 2, start: 0.18, end: 0.38 },
    { scene: 3, start: 0.38, end: 0.58 },
    { scene: 4, start: 0.58, end: 0.78 },
    { scene: 5, start: 0.78, end: 1.00 }
  ];

  // Calculate raw scroll progress through the 600vh container
  function calculateProgress() {
    const rect = container.getBoundingClientRect();
    const maxScroll = container.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    const progress = (-rect.top) / maxScroll;
    return Math.min(Math.max(progress, 0), 1);
  }

  // Update active scene and progress dots
  let currentActiveScene = 1;
  function updateScenes(progress) {
    let activeScene = 1;
    for (let i = 0; i < sceneBounds.length; i++) {
      if (progress >= sceneBounds[i].start && progress <= sceneBounds[i].end) {
        activeScene = sceneBounds[i].scene;
        break;
      }
    }
    if (progress >= 0.98) activeScene = 5;

    if (activeScene !== currentActiveScene) {
      currentActiveScene = activeScene;
      scenes.forEach(scene => {
        const scNum = parseInt(scene.getAttribute('data-scene'), 10);
        if (scNum === activeScene) {
          scene.classList.add('is-active');
        } else {
          scene.classList.remove('is-active');
        }
      });

      dots.forEach(dot => {
        const target = parseInt(dot.getAttribute('data-scene-target'), 10);
        if (target === activeScene) {
          dot.classList.add('is-active');
        } else {
          dot.classList.remove('is-active');
        }
      });
    }

    // Fade out scroll indicator as user begins scrubbing
    if (scrollIndicator) {
      if (progress > 0.03) {
        scrollIndicator.classList.add('is-hidden');
      } else {
        scrollIndicator.classList.remove('is-hidden');
      }
    }

    // Transparent navbar over top hero, blurred glass after
    if (header) {
      if (progress <= 0.02) {
        header.classList.add('site-header--over-hero');
      } else {
        header.classList.remove('site-header--over-hero');
      }
    }
  }

  // Main animation frame render loop
  function renderLoop() {
    // Lerp progress smoothly towards target
    currentProgress += (targetProgress - currentProgress) * lerpEase;
    if (Math.abs(targetProgress - currentProgress) < 0.0005) {
      currentProgress = targetProgress;
    }

    // Synchronize video timeline
    if (video.duration && !isNaN(video.duration)) {
      const targetTime = currentProgress * video.duration;
      // Scrub video if delta is sufficient and decoder is not overwhelmed
      if (Math.abs(video.currentTime - targetTime) > 0.02 && !video.seeking) {
        video.currentTime = targetTime;
      }
    }

    // Update scene DOM
    updateScenes(currentProgress);

    // Keep loop active when animating
    if (Math.abs(targetProgress - currentProgress) > 0.0005) {
      requestAnimationFrame(renderLoop);
    } else {
      isTicking = false;
    }
  }

  function onScroll() {
    targetProgress = calculateProgress();
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(renderLoop);
    }
  }

  // Bind passive scroll listener
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Initial trigger
  video.addEventListener('loadedmetadata', () => {
    onScroll();
  });

  // Also trigger on DOM ready
  setTimeout(onScroll, 100);

  // Clickable progress dots: smooth scroll directly to corresponding scene
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetScene = parseInt(dot.getAttribute('data-scene-target'), 10);
      const match = sceneBounds.find(s => s.scene === targetScene);
      if (match) {
        const maxScroll = container.offsetHeight - window.innerHeight;
        const targetScrollTop = container.offsetTop + (match.start + 0.02) * maxScroll;
        window.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    });
  });
})();
'''

# =========================================================================
# APPLY TO BOTH DIRECTORIES
# =========================================================================
for d in [desktop_dir, scratch_dir]:
    if not os.path.exists(d):
        continue

    # 1. Update index.html
    html_file = os.path.join(d, "index.html")
    with open(html_file, "r", encoding="utf-8") as f:
        html = f.read()

    # Locate existing hero section
    m_hero = re.search(r'<section[^>]*class="[^"]*hero[^"]*"[^>]*>.*?</section>', html, re.DOTALL)
    if m_hero:
        html = html[:m_hero.start()] + new_hero_html + html[m_hero.end():]
        print(f"Replaced hero in {html_file}")
    else:
        # Check if already has video-hero-scroll-container
        if 'video-hero-scroll-container' in html:
            m_vhero = re.search(r'<section[^>]*class="[^"]*video-hero-scroll-container[^"]*"[^>]*>.*?</section>', html, re.DOTALL)
            if m_vhero:
                html = html[:m_vhero.start()] + new_hero_html + html[m_vhero.end():]
                print(f"Replaced video-hero in {html_file}")
        else:
            print(f"Warning: could not locate hero section in {html_file}")

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html)

    # 2. Update styles.css
    css_file = os.path.join(d, "styles.css")
    with open(css_file, "r", encoding="utf-8") as f:
        css = f.read()

    if 'V-DESK SCROLL-CONTROLLED CINEMATIC VIDEO HERO' in css:
        m_css = re.search(r'/\* =+ \s* V-DESK SCROLL-CONTROLLED CINEMATIC VIDEO HERO.*?(?=(/\* =+|$))', css, re.DOTALL)
        if m_css:
            css = css[:m_css.start()] + video_hero_css + css[m_css.end():]
            print(f"Replaced video hero CSS in {css_file}")
        else:
            css += "\n" + video_hero_css
            print(f"Appended video hero CSS to {css_file}")
    else:
        css += "\n" + video_hero_css
        print(f"Appended video hero CSS to {css_file}")

    with open(css_file, "w", encoding="utf-8") as f:
        f.write(css)

    # 3. Update app.js
    js_file = os.path.join(d, "app.js")
    with open(js_file, "r", encoding="utf-8") as f:
        js = f.read()

    if 'initVideoHeroScrub' in js:
        # Replace existing
        m_js = re.search(r'// =+ \s* // V-DESK SCROLL-CONTROLLED CINEMATIC VIDEO SCRUBBING ENGINE.*?}\)\(\);', js, re.DOTALL)
        if m_js:
            js = js[:m_js.start()] + video_hero_js + js[m_js.end():]
            print(f"Replaced video scrub JS in {js_file}")
        else:
            js += "\n" + video_hero_js
            print(f"Appended video scrub JS to {js_file}")
    else:
        js += "\n" + video_hero_js
        print(f"Appended video scrub JS to {js_file}")

    with open(js_file, "w", encoding="utf-8") as f:
        f.write(js)

print("Video hero integration completed successfully across both workspaces.")
