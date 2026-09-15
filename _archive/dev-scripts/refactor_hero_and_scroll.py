# -*- coding: utf-8 -*-
"""
Script to refactor the Hero and disable GSAP scroll trapping in app.js and styles.css
"""
import re

# 1. Update index.html: remove redundant heroSlide2, heroSlide3, heroSlide4 from inside #home
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Pattern to find heroSlide2, heroSlide3, heroSlide4 and their enclosing tags up to heroCornerCards / heroScrollIndicator
slides_pattern = r'<!-- Slide 2: The Calibre -->[\s\S]*?(?=<div class="hero-rmc__corner-cards"|<div class="hero-scroll-indicator"|</section>)'
if re.search(slides_pattern, html):
    html = re.sub(slides_pattern, '', html)
    print("Removed redundant pinned slides (Slide 2, 3, 4) from Hero!")
else:
    print("Slide pattern not matched, checking alternate...")

# Also ensure heroSpread has proper structure without extra corner cards or scroll indicators
html = re.sub(r'<div class="hero-rmc__corner-cards"[\s\S]*?</div>\s*</div>', '', html)
html = re.sub(r'<div class="hero-scroll-indicator"[\s\S]*?</div>\s*</div>', '', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html!")

# 2. Update app.js: remove GSAP scroll-pinning that was hiding heroSlide1
with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the GSAP ScrollTrigger timeline inside initRmcHeroScroll with a clean, smooth ambient setup
old_gsap_block = """    ScrollTrigger.matchMedia({
      // Desktop: full GSAP ScrollTrigger timeline with pin & bidirectional scrub
      "(min-width: 993px)": function() {
        // Initial element positioning matching RMC choreography
        gsap.set(slide1, { opacity: 1, y: 0, pointerEvents: 'auto' });
        gsap.set([slide2, slide3, slide4], { opacity: 0, y: 30, pointerEvents: 'none' });
        if (cornerCards) gsap.set(cornerCards, { opacity: 0, pointerEvents: 'none' });
        if (techCard) gsap.set(techCard, { opacity: 1, y: 0, pointerEvents: 'auto' });
        if (scrollIndicator) gsap.set(scrollIndicator, { opacity: 1, y: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "+=250%",
            scrub: 1,
            pin: true,
            anticipatePin: 1
          }
        });

        // Exact RMC timing and ease choreography
        // Slide 1 exits up
        tl.to(slide1, { opacity: 0, y: -20, duration: 0.8, ease: "power2.inOut" }, 0.5)
          // Slide 2 enters
          .to(slide2, { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.8, ease: "power2.out" }, 1.2)
          // Slide 2 exits up
          .to(slide2, { opacity: 0, y: -20, pointerEvents: "none", duration: 0.8, ease: "power2.inOut" }, 2.0)
          // Slide 3 enters
          .to(slide3, { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.8, ease: "power2.out" }, 2.7)
          // Slide 3 exits up
          .to(slide3, { opacity: 0, y: -20, pointerEvents: "none", duration: 0.8, ease: "power2.inOut" }, 3.5)
          // Slide 4 & Corner cards enter
          .to(slide4, { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.8, ease: "power2.out" }, 4.2);

        if (cornerCards) {
          tl.to(cornerCards, { opacity: 1, pointerEvents: "auto", duration: 0.8, ease: "power2.out" }, 4.2);
        }

        // Ambient video cinematic push-in matching RMC
        if (bgVideo) {
          tl.to(bgVideo, { scale: 1.09, duration: 4.5, ease: "none" }, 0);
        }

        if (scrollIndicator) {
          tl.to(scrollIndicator, { opacity: 0, y: 15, duration: 0.5 }, 4.5);
        }

        if (techCard) {
          tl.to(techCard, { opacity: 0, y: 10, duration: 0.5 }, 4.5);
        }
      },

      // Mobile: Clean static presentation without scroll trapping
      "(max-width: 992px)": function() {
        gsap.set(slide1, { opacity: 1, y: 0, pointerEvents: 'auto', display: 'flex' });
        gsap.set([slide2, slide3, slide4], { display: 'none' });
        if (cornerCards) gsap.set(cornerCards, { display: 'none' });
        if (techCard) gsap.set(techCard, { display: 'none' });
        if (scrollIndicator) gsap.set(scrollIndicator, { display: 'none' });
      }
    });"""

new_gsap_block = """    // PRD v2.0: Clean, untrapped hero presentation with ambient video scaling and entrance
    gsap.set(slide1, { opacity: 1, y: 0, pointerEvents: 'auto', display: 'flex' });
    if (slide2) gsap.set(slide2, { display: 'none' });
    if (slide3) gsap.set(slide3, { display: 'none' });
    if (slide4) gsap.set(slide4, { display: 'none' });
    if (cornerCards) gsap.set(cornerCards, { display: 'none' });
    if (techCard) gsap.set(techCard, { display: 'none' });

    // Smooth subtle parallax on video when scrolling without trapping user scroll
    if (bgVideo) {
      gsap.to(bgVideo, {
        yPercent: 15,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }"""

if old_gsap_block in js:
    js = js.replace(old_gsap_block, new_gsap_block)
    print("Replaced GSAP pin timeline with smooth non-trapping parallax!")
else:
    print("Old GSAP block not exact match, using regex replacement...")
    js = re.sub(r'ScrollTrigger\.matchMedia\(\{[\s\S]*?\}\);\s*\}\)\(\);', new_gsap_block + '\n  })();', js)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated app.js!")

# 3. Update styles.css for hero layout
hero_css_patch = """
/* PRD v2.0 Hero Stage Polish */
.hero-rmc {
  min-height: 100vh !important;
  height: auto !important;
  padding: 130px 0 80px 0 !important;
  overflow: visible !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
}

.hero-rmc__spread {
  display: block !important;
  max-width: 1080px !important;
  padding: 0 20px !important;
  position: relative !important;
  z-index: 20 !important;
}

.hero-rmc__slide {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  max-width: 1000px !important;
  margin: 0 auto !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  transform: none !important;
}

.hero-rmc__title {
  font-size: clamp(2.4rem, 4.2vw, 3.8rem) !important;
  font-weight: 800 !important;
  line-height: 1.15 !important;
  letter-spacing: -0.025em !important;
  text-align: center !important;
  margin-bottom: 18px !important;
  color: #05132B !important;
}

.hero-rmc__desc {
  font-size: clamp(1.05rem, 1.3vw, 1.25rem) !important;
  line-height: 1.6 !important;
  color: #334155 !important;
  max-width: 740px !important;
  margin: 0 auto 28px !important;
  text-align: center !important;
}
"""

with open('styles.css', 'a', encoding='utf-8') as f:
    f.write('\n\n' + hero_css_patch)
print("Appended Hero CSS polish to styles.css!")
