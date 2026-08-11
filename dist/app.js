// app.js
var PROXY_PORT = 9393;
var PROXY_API_URL = window.location.port === String(PROXY_PORT) ? `${window.location.origin}/api/register` : `http://localhost:${PROXY_PORT}/api/register`;
function startCountdown() {
  const target = new Date("2026-09-09T09:00:00");
  function update() {
    const now = new Date;
    const diff = target - now;
    if (diff <= 0) {
      document.getElementById("cd-banner").innerHTML = '<span style="font-weight:800; color: var(--gold); font-size:1.1rem;">\uD83C\uDF89 The Event has started! Welcome to BIS Club 2-Day Standards Awareness Event!</span>';
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60) % 24);
    const mins = Math.floor(diff / (1000 * 60) % 60);
    const secs = Math.floor(diff / 1000 % 60);
    document.getElementById("cd-days").textContent = String(days).padStart(2, "0");
    document.getElementById("cd-hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("cd-mins").textContent = String(mins).padStart(2, "0");
    document.getElementById("cd-secs").textContent = String(secs).padStart(2, "0");
  }
  update();
  setInterval(update, 1000);
}
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("event-modal-overlay")) {
    e.target.classList.add("hidden");
    document.body.style.overflow = "";
  }
});
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".event-modal-overlay:not(.hidden)").forEach((el) => {
      el.classList.add("hidden");
    });
    document.querySelectorAll(".modal-overlay:not(.hidden)").forEach((el) => {
      el.classList.add("hidden");
    });
    document.body.style.overflow = "";
  }
});
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id], .section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (!sections.length || !navLinks.length)
    return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          link.classList.toggle("active", href === "#" + id);
        });
      }
    });
  }, { threshold: 0.3 });
  sections.forEach((s) => observer.observe(s));
}
function initAnimations() {
  const els = document.querySelectorAll(".event-card, .prize-card, .tl-item, .em-info-card, .qr-section-card");
  if (!els.length)
    return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach((el) => {
    obs.observe(el);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  if (window.ThemeProvider) {
    window.ThemeProvider.init();
  }
  startCountdown();
  initScrollSpy();
  initAnimations();
});
