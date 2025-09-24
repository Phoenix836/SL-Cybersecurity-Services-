/* ==============================
   SL CyberSecurity Services – Site JS
   - Lazy-load hero slide backgrounds
   - Fix mobile viewport height (no white gap)
   - Pause/Play carousel toggle
   - (Optional) Footer year
============================== */

/* ----- Fix viewport height on mobile (prevents white gap) ----- */
function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('load', setVh, { passive: true });
window.addEventListener('resize', setVh, { passive: true });
window.addEventListener('orientationchange', setVh, { passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setVh, { passive: true });
}
setVh(); // run once immediately

/* (Optional) auto-set footer year if you use <span id="year"></span> */
function setFooterYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

/* ----- Lazy-load hero slide backgrounds & prefetch strategy ----- */
document.addEventListener("DOMContentLoaded", () => {
  setFooterYear(); // safe if #year doesn't exist

  const carousel = document.getElementById("heroCarousel");
  if (!carousel) return;

  // apply background to an item and optionally prefetch via Image() to warm cache
  const applyBg = (item, preload = true) => {
    if (!item || item.dataset.applied === "1") return;
    const src = item.getAttribute("data-bg");
    if (src) {
      item.style.backgroundImage = `url("${src}")`;
      item.dataset.applied = "1";
      if (preload) {
        // create an Image to warm browser cache (non-blocking)
        const im = new Image();
        im.src = src;
      }
    }
  };

  // Immediately apply to the active slide
  applyBg(carousel.querySelector(".carousel-item.active"));

  // When slide is about to change, apply the new slide's bg and prefetch following
  carousel.addEventListener("slide.bs.carousel", (e) => {
    const next = e.relatedTarget;
    applyBg(next, true);

    // also attempt to preload the following slide for smoother UX
    const items = Array.from(next.parentElement.children);
    const nextIndex = items.indexOf(next);
    const following = items[nextIndex + 1];
    applyBg(following, true);
  });

  // Pre-apply first two slides if they exist (extra speed on first paint)
  const first = carousel.querySelectorAll(".carousel-item")[0];
  const second = carousel.querySelectorAll(".carousel-item")[1];
  applyBg(first);
  applyBg(second);
});

/* ----- Carousel pause/play toggle (button with id="carouselToggle") ----- */
(function carouselToggleHandler(){
  document.addEventListener('DOMContentLoaded', () => {
    const carouselEl = document.getElementById('heroCarousel');
    if (!carouselEl) return;
    const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
    const toggle = document.getElementById('carouselToggle');
    if (!toggle) return;

    const setLabel = (paused) => {
      toggle.textContent = paused ? '▶ Play' : '⏸ Pause';
    };

    // start with playing (Bootstrap auto starts if data-bs-ride="carousel")
    let paused = false;
    setLabel(paused);

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (!bsCarousel) return;
      if (!paused) {
        bsCarousel.pause();
        paused = true;
      } else {
        bsCarousel.cycle();
        paused = false;
      }
      setLabel(paused);
    });
  });
})();
