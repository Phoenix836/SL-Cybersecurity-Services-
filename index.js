/* ==============================
   SL CyberSecurity Services – Site JS
   - Lazy-load hero slide backgrounds
   - Fix mobile viewport height (no white gap)
   - (Optional) Footer year
============================== */

// (Optional) auto-set footer year if you have <span id="year"></span>
function setFooterYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

/* ----- Fix viewport height on mobile (prevents white gap) ----- */
function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Nudge layout so Safari/iOS recomputes height correctly
function forceReflow(el) { void el.offsetHeight; }

// (Optional) lightweight prefetch for next background image
function prefetch(url) {
  if (!url) return;
  const img = new Image();
  img.src = url;
}

/* Run early and keep it updated */
document.addEventListener('DOMContentLoaded', setVh);
window.addEventListener('load', setVh, { passive: true });
window.addEventListener('resize', setVh, { passive: true });
window.addEventListener('orientationchange', setVh, { passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setVh, { passive: true });
}

/* ----- Lazy-load hero slide backgrounds ----- */
document.addEventListener("DOMContentLoaded", () => {
  setFooterYear(); // safe if #year doesn't exist

  const carousel = document.getElementById("heroCarousel");
  if (!carousel) return;

  const applyBg = (item) => {
    if (!item || item.dataset.applied === "1") return;
    const src = item.getAttribute("data-bg");
    if (src) {
      item.style.backgroundImage = `url("${src}")`;
      item.dataset.applied = "1";
    }
  };

  // 1) Apply to the active slide immediately
  const active = carousel.querySelector(".carousel-item.active");
  applyBg(active);

  // Prefetch the next two slides if available
  if (active && active.parentElement) {
    const items = Array.from(active.parentElement.children);
    const idx = items.indexOf(active);
    const next = items[idx + 1];
    const following = items[idx + 2];
    if (next) {
      applyBg(next); // eager apply for immediate smoothness
      prefetch(next.getAttribute("data-bg"));
    }
    if (following) prefetch(following.getAttribute("data-bg"));
  }

  // 2) Before slide transition: ensure next (and following) have BG set
  carousel.addEventListener("slide.bs.carousel", (e) => {
    const next = e.relatedTarget;
    applyBg(next);

    const items = Array.from(next.parentElement.children);
    const nextIndex = items.indexOf(next);
    const following = items[nextIndex + 1];
    applyBg(following); // eager apply improves perceived performance

    // Recalculate viewport height and nudge layout during transition
    setVh();
    forceReflow(carousel);

    // Prefetch one more ahead
    const afterFollowing = items[nextIndex + 2];
    if (afterFollowing) prefetch(afterFollowing.getAttribute("data-bg"));
  });

  // 3) After slide transition: recalc & nudge again (iOS/Safari)
  carousel.addEventListener("slid.bs.carousel", () => {
    setVh();
    forceReflow(carousel);
  });
});



