/* ============================================================
   BIS Club Registration — JavaScript Logic
   Direct Google Sheets Integration via Apps Script
   ============================================================ */

// ── 🔗 GOOGLE APPS SCRIPT WEB APP ENDPOINT ───────────────────
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzNiX4nbnOzT8AjO_7hG9xcHjLTTIg10wz80iV8eKOP581bDF3fdLtavY7GNZOZBUe9/exec";
// ──────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════
//  COUNTDOWN TIMER
// ══════════════════════════════════════════════════════════════
function startCountdown() {
  const target = new Date('2026-09-09T09:00:00');

  function update() {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) {
      document.getElementById('cd-banner').innerHTML =
        '<span style="font-weight:800; color: var(--gold); font-size:1.1rem;">🎉 The Event has started! Welcome to BIS Club 2-Day Standards Awareness Event!</span>';
      return;
    }
    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins  = Math.floor((diff / (1000 * 60)) % 60);
    const secs  = Math.floor((diff / 1000) % 60);
    document.getElementById('cd-days').textContent  = String(days).padStart(2,'0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2,'0');
    document.getElementById('cd-mins').textContent  = String(mins).padStart(2,'0');
    document.getElementById('cd-secs').textContent  = String(secs).padStart(2,'0');
  }
  update();
  setInterval(update, 1000);
}

// ══════════════════════════════════════════════════════════════
//  MOBILE NAV
// ══════════════════════════════════════════════════════════════
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  nav.classList.toggle('hidden');
}

// ══════════════════════════════════════════════════════════════
//  TAB SWITCHING (Schedule)
// ══════════════════════════════════════════════════════════════
function switchTab(day, btn) {
  document.querySelectorAll('.timeline').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(day).classList.remove('hidden');
  btn.classList.add('active');
}

// ══════════════════════════════════════════════════════════════
//  EVENT DETAIL MODALS
// ══════════════════════════════════════════════════════════════

function openEventModal(id, event) {
  if (event && event.stopPropagation) event.stopPropagation();
  var modal = document.getElementById('modal-' + id);
  if (!modal) return;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  if (window.lucide) {
    window.lucide.createIcons({ root: modal });
  }
}

function closeEventModal(id) {
  var modal = document.getElementById('modal-' + id);
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

let heroNavigationBusy = false;

/**
 * Central navigation function for Hero event badges.
 * Temporarily pauses animation on click, smoothly scrolls to #events,
 * and opens the existing corresponding event modal.
 */
function handleHeroEventNavigation(eventId) {
  if (heroNavigationBusy) return;
  heroNavigationBusy = true;

  const clickedBadge = document.querySelector(`[data-hero-event="${eventId}"]`);
  if (clickedBadge) {
    clickedBadge.classList.add('hero-clicked');
  }

  const eventsSection = document.getElementById('events');
  if (!eventsSection) {
    heroNavigationBusy = false;
    if (clickedBadge) clickedBadge.classList.remove('hero-clicked');
    return;
  }

  if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur();
  }

  eventsSection.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  setTimeout(() => {
    if (typeof openEventModal === 'function') {
      openEventModal(eventId);
    } else {
      console.error('openEventModal() is not available');
    }

    if (clickedBadge) {
      clickedBadge.classList.remove('hero-clicked');
    }

    heroNavigationBusy = false;
  }, 700);
}

function openFromHero(id, event) {
  if (event) {
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
  }
  handleHeroEventNavigation(id);
}

// Delegated listener for hero event buttons
document.addEventListener('click', function (event) {
  const badge = event.target.closest('[data-hero-event]');
  if (!badge) return;

  event.preventDefault();
  event.stopPropagation();

  const eventId = badge.dataset.heroEvent;
  if (!eventId) return;

  handleHeroEventNavigation(eventId);
});

// Close modal on overlay click or Escape key
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('event-modal-overlay')) {
    e.target.classList.add('hidden');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.event-modal-overlay, .modal-overlay').forEach(function(m) {
      m.classList.add('hidden');
    });
    document.body.style.overflow = '';
  }
});

// ══════════════════════════════════════════════════════════════
//  EVENT-SPECIFIC FORM DETAIL TOGGLES
// ══════════════════════════════════════════════════════════════
function toggleEventDetails(eventId, checkbox) {
  const detail = document.getElementById('detail-' + eventId);
  if (!detail) return;
  if (checkbox.checked) {
    detail.classList.remove('hidden');
    setTimeout(() => detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  } else {
    detail.classList.add('hidden');
  }
}

// ══════════════════════════════════════════════════════════════
//  FORM VALIDATION
// ══════════════════════════════════════════════════════════════
function clearErrors() {
  document.querySelectorAll('.field-err').forEach(el => el.textContent = '');
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId + '-err');
  if (field) {
    field.classList.add('error');
    field.style.borderColor = 'rgba(200,16,46,0.6)';
  }
  if (errEl) errEl.textContent = message;
}

function parseMembersList(str) {
  if (!str || !str.trim()) return [];
  return str.split(',').map(m => m.trim()).filter(m => m.length > 0);
}

function validateForm() {
  clearErrors();
  let valid = true;

  document.querySelectorAll('input, select').forEach(el => {
    el.style.borderColor = '';
  });

  // 1. Full Name
  const fullName = document.getElementById('fullName').value.trim();
  if (!fullName || fullName.length < 2) {
    setError('fullName', 'Please enter your full name (at least 2 characters).');
    valid = false;
  }

  // 2. Register Number
  const rollNo = document.getElementById('rollNo').value.trim();
  if (!rollNo) {
    setError('rollNo', 'Please enter your register number.');
    valid = false;
  }

  // 3. Department
  const department = document.getElementById('department').value;
  if (!department) {
    setError('department', 'Please select your department.');
    valid = false;
  }

  // 5. Year of Study
  const year = document.getElementById('year').value;
  if (!year) {
    setError('year', 'Please select your year of study.');
    valid = false;
  }

  // 6. Phone
  const phone = document.getElementById('phone').value.trim();
  if (!phone) {
    setError('phone', 'Please enter your phone number.');
    valid = false;
  } else if (!/^[6-9]\d{9}$/.test(phone)) {
    setError('phone', 'Enter a valid 10-digit Indian mobile number.');
    valid = false;
  }

  // 7. Email
  const email = document.getElementById('email').value.trim();
  if (!email) {
    setError('email', 'Please enter your email address.');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError('email', 'Please enter a valid email address.');
    valid = false;
  }

  // 8. Events
  const selectedEvents = [...document.querySelectorAll('input[name="events"]:checked')].map(cb => cb.value);
  if (selectedEvents.length === 0) {
    document.getElementById('events-err').textContent = 'Please select at least one event.';
    valid = false;
  }

  // 9. Poster Making
  if (selectedEvents.includes('Poster Making')) {
    const medium = document.getElementById('poster-medium').value;
    if (!medium) {
      setError('poster-medium', 'Please select your preferred medium.');
      valid = false;
    }
  }

  // 10. Debate
  if (selectedEvents.includes('Debate')) {
    const teamName = document.getElementById('debate-team').value.trim();
    const captain  = document.getElementById('debate-captain').value.trim();
    const members  = parseMembersList(document.getElementById('debate-members').value);
    if (!teamName) { setError('debate-team', 'Please enter team name.'); valid = false; }
    if (!captain)  { setError('debate-captain', 'Please enter captain name.'); valid = false; }
    if (members.length !== 3) {
      setError('debate-members', `Debate requires exactly 3 other members (you entered ${members.length}).`);
      valid = false;
    }
  }

  // 11. Treasure Hunt
  if (selectedEvents.includes('Treasure Hunt')) {
    const teamName = document.getElementById('th-team').value.trim();
    const leader   = document.getElementById('th-captain').value.trim();
    const members  = parseMembersList(document.getElementById('th-members').value);
    if (!teamName) { setError('th-team', 'Please enter team name.'); valid = false; }
    if (!leader)   { setError('th-captain', 'Please enter team leader name.'); valid = false; }
    if (members.length !== 5) {
      setError('th-members', `Treasure Hunt requires exactly 5 other members (you entered ${members.length}).`);
      valid = false;
    }
  }

  // 12. Rangoli
  if (selectedEvents.includes('Rangoli')) {
    const teamName = document.getElementById('rang-team').value.trim();
    const members  = parseMembersList(document.getElementById('rang-members').value);
    if (!teamName) { setError('rang-team', 'Please enter team name.'); valid = false; }
    if (members.length < 1 || members.length > 4) {
      setError('rang-members', `Rangoli requires 1 to 4 team members (you entered ${members.length}).`);
      valid = false;
    }
  }

  // 13. Mimes
  if (selectedEvents.includes('Mimes')) {
    const teamName = document.getElementById('mime-team').value.trim();
    const members  = parseMembersList(document.getElementById('mime-members').value);
    if (!teamName) { setError('mime-team', 'Please enter team name.'); valid = false; }
    if (members.length < 4 || members.length > 6) {
      setError('mime-members', `Mimes requires 4 to 6 team members (you entered ${members.length}).`);
      valid = false;
    }
  }

  // 14. Science via Standards
  if (selectedEvents.includes('Science via Standards')) {
    const teamName = document.getElementById('sci-team').value.trim();
    const topic    = document.getElementById('sci-topic')?.value.trim();
    if (!teamName) { setError('sci-team', 'Please enter team name.'); valid = false; }
    if (!topic)    { setError('sci-topic', 'Please enter your chosen prototype topic.'); valid = false; }
  }

  // 15. Consent
  const consent = document.getElementById('consent').checked;
  if (!consent) {
    document.getElementById('consent-err').textContent = 'You must agree to the rules to register.';
    valid = false;
  }

  return valid;
}

// ══════════════════════════════════════════════════════════════
//  COLLECT FORM DATA (Matches Apps Script Backend Keys)
// ══════════════════════════════════════════════════════════════
function collectFormData() {
  const events = [...document.querySelectorAll('input[name="events"]:checked')].map(input => input.value);

  const data = {
    fullName: document.getElementById("fullName").value.trim(),
    rollNo: document.getElementById("rollNo").value.trim(),
    department: document.getElementById("department").value,
    year: document.getElementById("year").value,
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    events: events,

    posterMedium: document.getElementById("poster-medium")?.value || "",

    debateTeam: document.getElementById("debate-team")?.value || "",
    debateCaptain: document.getElementById("debate-captain")?.value || "",
    debateMembers: document.getElementById("debate-members")?.value || "",

    treasureTeam: document.getElementById("th-team")?.value || "",
    treasureCaptain: document.getElementById("th-captain")?.value || "",
    treasureMembers: document.getElementById("th-members")?.value || "",

    rangoliTeam: document.getElementById("rang-team")?.value || "",
    rangoliMembers: document.getElementById("rang-members")?.value || "",

    mimesTeam: document.getElementById("mime-team")?.value || "",
    mimesTheme: document.getElementById("mime-theme")?.value || "",
    mimesMembers: document.getElementById("mime-members")?.value || "",

    scienceTeam: document.getElementById("sci-team")?.value || "",
    scienceMembers: document.getElementById("sci-members")?.value || "",
    scienceTopic: document.getElementById("sci-topic")?.value || "",
    sciencePrototypeType: document.getElementById("sci-prototype-type")?.value || "",
    scienceDescription: document.getElementById("sci-description")?.value || "",

    consent: document.getElementById("consent").checked
  };

  return data;
}

// ══════════════════════════════════════════════════════════════
//  SUCCESS & ERROR MODALS
// ══════════════════════════════════════════════════════════════
function showSuccessModal(regId, name, rollNo, events) {
  const detailsEl = document.getElementById('modalDetails');
  const eventsStr = Array.isArray(events) ? events.join(', ') : (events || '');

  detailsEl.innerHTML = `
    <div style="margin-bottom:12px; text-align:left; font-size:0.9rem; line-height:1.6;">
      <div><strong>Registration ID:</strong> <span class="reg-id-badge" style="display:inline-block; font-size:0.95rem; padding:4px 10px; margin:4px 0;">${regId}</span></div>
      <div><strong>Name:</strong> ${name}</div>
      <div><strong>Register Number:</strong> ${rollNo}</div>
      <div><strong>Events:</strong> ${eventsStr}</div>
    </div>
  `;
  document.getElementById('successModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if (window.lucide) {
    window.lucide.createIcons({ root: document.getElementById('successModal') });
  }
}

function showErrorAlert(message) {
  const errModal = document.getElementById('errorModal');
  if (!errModal) {
    alert(message);
    return;
  }
  document.getElementById('errorModalMessage').textContent = message;
  errModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeErrorModal() {
  const errModal = document.getElementById('errorModal');
  if (errModal) errModal.classList.add('hidden');
  document.body.style.overflow = '';
}

function closeModalFormReset() {
  const form = document.getElementById('regForm');
  if (form) form.reset();
  document.querySelectorAll('.event-details').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('input[name="events"]').forEach(cb => cb.checked = false);
  clearErrors();
}

function closeModal() {
  document.getElementById('successModal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════════════════════════
//  FORM SUBMISSION LOGIC
// ══════════════════════════════════════════════════════════════
async function submitForm(e) {
  e.preventDefault();
  if (!validateForm()) {
    const firstErr = document.querySelector('.field-err:not(:empty)');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  const btnLabel  = submitBtn.querySelector('.btn-label');
  const btnLoader = document.getElementById('btnLoader');

  // Disable submit button & show loading state
  submitBtn.disabled = true;
  if (btnLabel)  btnLabel.style.display = 'none';
  if (btnLoader) btnLoader.classList.remove('hidden');

  const formData = collectFormData();

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(formData)
    });

    const responseText = await response.text();
    let result = {};
    try {
      result = JSON.parse(responseText);
    } catch (parseErr) {
      console.warn("Response parse warning, text:", responseText);
      result = { success: true };
    }

    if (result.success === true) {
      const regId = result.registrationId || ('BIS2026-' + Math.floor(1000 + Math.random() * 9000));
      showSuccessModal(regId, formData.fullName, formData.rollNo, formData.events);
      closeModalFormReset();
    } else {
      const errorMsg = result.message || 'Registration failed. Please check your details and try again.';
      showErrorAlert(errorMsg);
    }

  } catch (err) {
    console.error('Fetch / Network Error:', err);
    showErrorAlert("Unable to connect to the registration server. Please check your internet connection and try again.");
  } finally {
    submitBtn.disabled = false;
    if (btnLabel)  btnLabel.style.display = '';
    if (btnLoader) btnLoader.classList.add('hidden');
  }
}

// ══════════════════════════════════════════════════════════════
//  ACTIVE NAV HIGHLIGHTING (on scroll)
// ══════════════════════════════════════════════════════════════
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id], .section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === '#' + id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
}

// ══════════════════════════════════════════════════════════════
//  SCROLL ANIMATIONS (IntersectionObserver)
// ══════════════════════════════════════════════════════════════
function initAnimations() {
  const els = document.querySelectorAll('.event-card, .prize-card, .tl-item, .em-info-card, .qr-section-card');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach((el) => {
    obs.observe(el);
  });
}

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  if (window.ThemeProvider) {
    window.ThemeProvider.init();
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }
  startCountdown();
  initScrollSpy();
  initAnimations();
});
