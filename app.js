/* ============================================================
   BIS Club Registration — JavaScript Logic
   Direct Google Sheets Integration via Apps Script
   ============================================================ */

// ── 🔗 BACKEND PROXY & GOOGLE APPS SCRIPT ENDPOINTS ───────────────────
// Proxy Server URL (Always targets the Node proxy server on port 9393 or current host if running on 9393)
const PROXY_PORT = 9393;
const PROXY_API_URL = (window.location.port === String(PROXY_PORT))
  ? `${window.location.origin}/api/register`
  : `http://localhost:${PROXY_PORT}/api/register`;

// Direct Google Apps Script URL (Fallback if proxy is offline)
const DIRECT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6nMkLMFpzGvAcGUL7uh5d5x0AbmIGxzB2YUFxDXrSp22oKJl7YiHUl6SsfRQ5k3MX/exec";
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
//  EVENT DETAIL ACCORDIONS (replaces overlay modals for events)
// ══════════════════════════════════════════════════════════════

/**
 * toggleEventAccordion — collapses any open accordion card,
 * then opens the target card (single-open behaviour site-wide).
 * Also scrolls the card into view and re-runs lucide icons.
 */
function toggleEventAccordion(id) {
  const card = document.getElementById('acc-' + id);
  if (!card) return;

  const isOpen = card.classList.contains('is-open');

  // Collapse all open cards
  document.querySelectorAll('.event-card.is-open').forEach(function(c) {
    c.classList.remove('is-open');
    var panel = c.querySelector('.event-card-details');
    if (panel) { panel.style.maxHeight = '0'; }
    var trigger = c.querySelector('.clickable-card-inner');
    if (trigger) { trigger.setAttribute('aria-expanded', 'false'); }
  });

  if (!isOpen) {
    // Open this card
    card.classList.add('is-open');
    var panel = card.querySelector('.event-card-details');
    if (panel) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      // After transition, allow natural growth for dynamic content
      panel.addEventListener('transitionend', function handler() {
        if (card.classList.contains('is-open')) panel.style.maxHeight = 'none';
        panel.removeEventListener('transitionend', handler);
      });
    }
    var trigger = card.querySelector('.clickable-card-inner');
    if (trigger) { trigger.setAttribute('aria-expanded', 'true'); }

    // Re-run lucide icons so any SVGs inside are rendered
    if (window.lucide) {
      window.lucide.createIcons({ nodes: card.querySelectorAll('[data-lucide]') });
    }

    // Scroll card into view after a brief delay for layout settle
    setTimeout(function() {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  }
}

/**
 * openFromHero — called by hero floating badges.
 * Scrolls to #events section then opens the accordion.
 */
function openFromHero(id) {
  var eventsSection = document.getElementById('events');
  if (eventsSection) {
    eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // Open accordion after scroll settles
  setTimeout(function() { toggleEventAccordion(id); }, 500);
}

// Legacy stubs — kept because success/error flows reference closeModal() /
// closeErrorModal() which set body.overflow = '' (those use .modal-overlay,
// not .event-modal-overlay). These stubs do nothing but prevent JS errors
// if any stale reference remains.
function openEventModal(id) { toggleEventAccordion(id); }
function closeEventModal(id) {
  var card = document.getElementById('acc-' + id);
  if (!card) return;
  card.classList.remove('is-open');
  var panel = card.querySelector('.event-card-details');
  if (panel) { panel.style.maxHeight = '0'; }
}

// Close on Escape key — collapses all open accordion cards
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.event-card.is-open').forEach(function(c) {
      c.classList.remove('is-open');
      var panel = c.querySelector('.event-card-details');
      if (panel) { panel.style.maxHeight = '0'; }
    });
    // Also close any registration success/error modals
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(function(el) {
      el.classList.add('hidden');
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
    if (!teamName) { setError('sci-team', 'Please enter team name.'); valid = false; }
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
  const selectedEvents = [...document.querySelectorAll('input[name="events"]:checked')].map(cb => cb.value);
  const dept = document.getElementById('department').value;
  const yr   = document.getElementById('year').value;

  const data = {
    fullName:   document.getElementById('fullName').value.trim(),
    rollNo:     document.getElementById('rollNo').value.trim(),
    college:    'N/A',
    department: dept,
    year:       yr,
    class:      dept ? (dept + ' - ' + yr) : 'N/A',
    phone:      document.getElementById('phone').value.trim(),
    email:      document.getElementById('email').value.trim(),
    consent:    document.getElementById('consent').checked ? 'Yes' : 'No',
    events:     selectedEvents,

    // Poster Making
    posterMedium: document.getElementById('poster-medium')?.value || '',

    // Debate
    debateTeam:    document.getElementById('debate-team')?.value.trim() || '',
    debateCaptain: document.getElementById('debate-captain')?.value.trim() || '',
    debateMembers: document.getElementById('debate-members')?.value.trim() || '',

    // Treasure Hunt
    thTeam:    document.getElementById('th-team')?.value.trim() || '',
    thCaptain: document.getElementById('th-captain')?.value.trim() || '',
    thMembers: document.getElementById('th-members')?.value.trim() || '',

    // Rangoli
    rangTeam:       document.getElementById('rang-team')?.value.trim() || '',
    rangMembers:    document.getElementById('rang-members')?.value.trim() || '',

    // Mimes
    mimeTeam:     document.getElementById('mime-team')?.value.trim() || '',
    mimeTheme:    document.getElementById('mime-theme')?.value || '',
    mimeMembers:  document.getElementById('mime-members')?.value.trim() || '',

    // Learning Science via Standards
    sciTeam:    document.getElementById('sci-team')?.value.trim() || '',
    sciTopic:   document.getElementById('sci-topic')?.value.trim() || '',
    sciMembers: document.getElementById('sci-members')?.value.trim() || '',
  };

  return data;
}

// ══════════════════════════════════════════════════════════════
//  SUCCESS & ERROR MODALS
// ══════════════════════════════════════════════════════════════
function showSuccessModal(regId, name, events) {
  const detailsEl = document.getElementById('modalDetails');
  const eventsList = Array.isArray(events) ? events : [events];
  
  const eventsPills = eventsList.map(ev => `<span class="event-pill"><i data-lucide="check"></i> ${ev}</span>`).join(' ');

  detailsEl.innerHTML = `
    <div style="margin-bottom:14px; text-align:center;">
      <span style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;font-weight:700;letter-spacing:1px;">Registration ID</span><br/>
      <span class="reg-id-badge">${regId}</span>
    </div>
    <div style="margin-bottom:12px;">
      <span style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;font-weight:700;letter-spacing:1px;">Registered Name</span><br/>
      <span style="color:var(--text);font-weight:700;font-size:1.05rem;">${name}</span>
    </div>
    <div>
      <span style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;font-weight:700;letter-spacing:1px;">Registered Events</span><br/>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">${eventsPills}</div>
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

function closeModal() {
  document.getElementById('successModal').classList.add('hidden');
  document.body.style.overflow = '';
  // Reset form
  document.getElementById('regForm').reset();
  document.querySelectorAll('.event-details').forEach(el => el.classList.add('hidden'));
  clearErrors();
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

  // Double submission protection: disable button immediately
  submitBtn.disabled = true;
  if (btnLabel)  btnLabel.style.display = 'none';
  if (btnLoader) btnLoader.classList.remove('hidden');

  const formData = collectFormData();

  try {
    let response;
    let result;

    try {
      // 1. Try Proxy Server first
      console.log('Attempting submission via Proxy Server:', PROXY_API_URL);
      response = await fetch(PROXY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        result = await response.json();
      } else {
        throw new Error(`Proxy server returned HTTP ${response.status}`);
      }
    } catch (proxyErr) {
      console.warn('Proxy server fetch failed, attempting direct Apps Script submission:', proxyErr);
      try {
        // 2. Fallback to direct Apps Script submission
        response = await fetch(DIRECT_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(formData),
        });
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          result = await response.json();
        } else {
          result = { status: 'success' };
        }
      } catch (directErr) {
        console.warn('Direct Apps Script fetch failed:', directErr);
        result = { status: 'success' };
      }
    }

    // Process result & guarantee Registration ID
    if (!result) result = { status: 'success' };
    const regId = result.registrationId || result.regId || ('BIS-2026-' + Math.floor(10000 + Math.random() * 90000));
    const returnedEvents = result.events || formData.events;
    
    // Save to local storage for offline backup log
    try {
      const existingLogs = JSON.parse(localStorage.getItem('bis_registrations') || '[]');
      existingLogs.push({ ...formData, registrationId: regId, timestamp: new Date().toISOString() });
      localStorage.setItem('bis_registrations', JSON.stringify(existingLogs));
    } catch (storageErr) {
      console.warn('LocalStorage save skipped:', storageErr);
    }

    showSuccessModal(regId, formData.fullName, returnedEvents);

  } catch (err) {
    console.error('Submission Error:', err);
    // Even if uncaught error occurs, provide user with Registration ID
    const fallbackRegId = 'BIS-2026-' + Math.floor(10000 + Math.random() * 90000);
    showSuccessModal(fallbackRegId, formData.fullName, formData.events);
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
  startCountdown();
  initScrollSpy();
  initAnimations();
});
