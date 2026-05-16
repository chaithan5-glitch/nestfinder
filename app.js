/* ============================================================
   NESTFINDER — app.js (Clean Version)
   ============================================================ */

'use strict';

/* ─── Data Store (filled from MongoDB on load) ───────────── */
const PROPERTIES = [];

/* ─── Saved Properties (localStorage) ───────────────────── */
function getSaved() {
  try { return JSON.parse(localStorage.getItem('saved_props') || '[]'); } catch { return []; }
}
function toggleSave(id) {
  const saved = getSaved();
  const idx = saved.indexOf(id);
  if (idx > -1) saved.splice(idx, 1); else saved.push(id);
  localStorage.setItem('saved_props', JSON.stringify(saved));
  return idx === -1;
}
function isSaved(id) { return getSaved().includes(id); }

/* ─── Spinner ────────────────────────────────────────────── */
function showSpinner() { document.getElementById('spinner')?.classList.add('active'); }
function hideSpinner() { document.getElementById('spinner')?.classList.remove('active'); }

/* ─── Toast ──────────────────────────────────────────────── */
function showToast(message, type = 'default', duration = 3000) {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', default: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || icons.default}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = '.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
function createToastContainer() {
  const el = document.createElement('div');
  el.id = 'toastContainer';
  el.className = 'toast-container';
  document.body.appendChild(el);
  return el;
}

/* ─── Format Currency ────────────────────────────────────── */
function fmtRent(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

/* ─── URL Params ─────────────────────────────────────────── */
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key) || '';
}

/* ─── Navbar ─────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(l => {
    const href = l.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      l.classList.add('active');
    }
  });
}

/* ─── Property Card Builder ──────────────────────────────── */
function buildCard(prop) {
  const id = prop._id || prop.id;
  const saved = isSaved(id);
  const rating = prop.rating || 4.0;
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  const description = prop.description || prop.desc || '';

  return `
    <div class="property-card fade-in" data-id="${id}">
      <div class="card-img-wrap">
        <img src="${prop.image}" alt="${prop.title}" loading="lazy" />
        <div class="card-type-tag">
          <span class="badge badge-blue">${prop.type}</span>
        </div>
        <button class="card-save ${saved ? 'saved' : ''}" onclick="handleSave('${id}', this)" title="Save property">
          ${saved ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-city">${prop.city}</span>
          <span style="margin-left:auto;font-size:12px;color:var(--warning)">${stars}</span>
          <span style="font-size:12px;color:var(--ink-3)">(${rating})</span>
        </div>
        <h3 class="card-title">${prop.title}</h3>
        <p class="card-desc">${description}</p>
        <div class="card-footer">
          <div class="card-rent">₹${Number(prop.rent).toLocaleString()} <span>/ month</span></div>
          <a href="property-details.html?id=${id}" class="btn btn-primary btn-sm">View Details</a>
        </div>
      </div>
    </div>`;
}

window.handleSave = function (id, btn) {
  const nowSaved = toggleSave(id);
  btn.innerHTML = nowSaved ? '❤️' : '🤍';
  btn.classList.toggle('saved', nowSaved);
  showToast(nowSaved ? 'Property saved!' : 'Removed from saved', nowSaved ? 'success' : 'default');
};

/* ─── Render Cards ───────────────────────────────────────── */
function renderCards(containerId, props) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!props.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="icon">🏚️</div>
      <h3>No properties found</h3>
      <p>Try adjusting your filters or explore a different city.</p>
      <a href="listings.html" class="btn btn-primary">Browse All Properties</a>
    </div>`;
    return;
  }
  el.innerHTML = props.map(p => buildCard(p)).join('');
}

/* ─── Home Page ──────────────────────────────────────────── */
function initHome() {
  renderCards('featuredGrid', PROPERTIES.slice(0, 6));

  const form = document.getElementById('heroSearch');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const city = form.city.value.trim();
      const budget = form.budget.value;
      let url = `search-results.html?city=${encodeURIComponent(city)}`;
      if (budget) url += `&budget=${budget}`;
      showSpinner();
      setTimeout(() => { window.location.href = url; }, 500);
    });
  }

  document.querySelectorAll('.city-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const city = pill.dataset.city;
      showSpinner();
      setTimeout(() => { window.location.href = `search-results.html?city=${city}`; }, 400);
    });
  });
}

/* ─── Listings Page ──────────────────────────────────────── */
function initListings() {
  function applyFilters() {
    const city = (document.getElementById('fCity')?.value || '').toLowerCase();
    const min = parseInt(document.getElementById('fMin')?.value || 0);
    const max = parseInt(document.getElementById('fMax')?.value || 999999);
    const types = [...document.querySelectorAll('.type-check:checked')].map(c => c.value);

    let filtered = PROPERTIES.filter(p => {
      const cityOk = !city || p.city.toLowerCase().includes(city);
      const rentOk = p.rent >= (min || 0) && p.rent <= (max || 999999);
      const typeOk = !types.length || types.includes(p.type);
      return cityOk && rentOk && typeOk;
    });

    const sort = document.getElementById('sortSelect')?.value || 'default';
    if (sort === 'low') filtered.sort((a, b) => a.rent - b.rent);
    if (sort === 'high') filtered.sort((a, b) => b.rent - a.rent);
    if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    renderCards('listingsGrid', filtered);
    const count = document.getElementById('resultCount');
    if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'} found`;
  }

  document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
  document.getElementById('clearFilters')?.addEventListener('click', () => {
    document.querySelectorAll('.filter-input').forEach(i => i.value = '');
    document.querySelectorAll('.type-check').forEach(c => c.checked = false);
    applyFilters();
  });
  document.getElementById('sortSelect')?.addEventListener('change', applyFilters);
  document.getElementById('filterToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('show');
  });

  applyFilters();
}

/* ─── Property Details Page ──────────────────────────────── */
async function initDetail() {
  const id = getParam('id');
  const el = document.getElementById('detailContent');
  if (!id || !el) return;

  try {
    const res = await fetch(`http://localhost:5000/api/properties/${id}`);
    const prop = await res.json();

    if (!prop || prop.error) {
      el.innerHTML = `<div class="empty-state">
        <div class="icon">🔍</div>
        <h3>Property not found</h3>
        <p>The property you're looking for doesn't exist.</p>
        <a href="listings.html" class="btn btn-primary">Browse Properties</a>
      </div>`;
      return;
    }

    document.title = prop.title + ' — NestFinder';
    const rating = prop.rating || 4.0;
    const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
    const amenityIcons = {
      WiFi: '📶', AC: '❄️', Laundry: '🧺', Security: '🔒',
      Kitchen: '🍳', Gym: '🏋️', Parking: '🅿️', CCTV: '📷',
      'Power Backup': '⚡', Lift: '🛗', Meals: '🍽️',
      Terrace: '🌇', 'Study Area': '📚'
    };

    const amenities = prop.amenities?.length
      ? prop.amenities.map(a => `
          <div class="amenity">
            <span class="icon">${amenityIcons[a] || '✅'}</span>${a}
          </div>`).join('')
      : '<p style="color:var(--ink-3)">No amenities listed</p>';

    el.innerHTML = `
      <div class="breadcrumb fade-in">
        <a href="index.html">Home</a><span>›</span>
        <a href="listings.html">Properties</a><span>›</span>
        <span>${prop.city}</span><span>›</span>
        <span style="color:var(--ink-2)">${prop.title}</span>
      </div>
      <div class="gallery fade-in delay-1">
        <div class="gallery-main">
          <img src="${prop.image}" alt="${prop.title}" />
        </div>
      </div>
      <div class="detail-layout fade-in delay-2">
        <div class="detail-main">
          <h1 class="detail-title">${prop.title}</h1>
          <div class="detail-location">
            📍 ${prop.city} &nbsp;·&nbsp;
            <span style="color:var(--warning)">${stars}</span>
            &nbsp;<span style="color:var(--ink-3)">${rating} / 5</span>
          </div>
          <div class="detail-chips">
            <span class="detail-chip">🏠 ${prop.type}</span>
            <span class="detail-chip">📅 Available Now</span>
            <span class="detail-chip">👤 ${prop.gender || 'Any Gender'}</span>
          </div>
          <div class="detail-section">
            <h3>Description</h3>
            <p>${prop.description || prop.desc || 'No description provided.'}</p>
          </div>
          <div class="detail-section">
            <h3>Amenities</h3>
            <div class="amenities-grid">${amenities}</div>
          </div>
        </div>
        <div class="detail-sidebar">
          <div class="detail-rent">${fmtRent(prop.rent)} <span>/ month</span></div>
          <p style="font-size:12px;color:var(--ink-3);margin-top:4px">
            Utilities included · No hidden charges
          </p>
          <hr style="border:none;border-top:1px solid var(--border-2);margin:16px 0">
          <div style="font-size:13px;color:var(--ink-2);display:flex;flex-direction:column;gap:8px">
            <div>🏠 &nbsp; Type: <strong>${prop.type}</strong></div>
            <div>📍 &nbsp; City: <strong>${prop.city}</strong></div>
            <div>⭐ &nbsp; Rating: <strong>${rating} / 5</strong></div>
            ${prop.ownerName ? `<div>👤 &nbsp; Owner: <strong>${prop.ownerName}</strong></div>` : ''}
            ${prop.ownerPhone ? `<div>📞 &nbsp; Phone: <strong>${prop.ownerPhone}</strong></div>` : ''}
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary btn-full" onclick="handleContact('${prop.ownerPhone}')">
              📞 Contact Owner
            </button>
            <button class="btn btn-ghost btn-full" onclick="handleShare()">
              🔗 Share Property
            </button>
          </div>
        </div>
      </div>`;

  } catch (err) {
    el.innerHTML = `<div class="empty-state">
      <div class="icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>Could not load property details.</p>
      <a href="listings.html" class="btn btn-primary">Browse Properties</a>
    </div>`;
  }
}

window.handleContact = function (phone) {
  if (phone) {
    showToast(`Owner's number: ${phone}`, 'success');
  } else {
    showToast('Contact details not available', 'default');
  }
};

window.handleShare = function () {
  navigator.clipboard?.writeText(window.location.href)
    .then(() => showToast('Link copied!', 'success'))
    .catch(() => showToast('Share: ' + window.location.href));
};

/* ─── Saved Properties Page ──────────────────────────────── */
async function initSaved() {
  const grid = document.getElementById('savedGrid');
  const count = document.getElementById('savedCount');
  const clearBtn = document.getElementById('clearAllBtn');
  const subtitle = document.getElementById('savedSubtitle');

  const savedIds = getSaved();

  if (!savedIds.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">💔</div>
        <h3>No saved properties yet</h3>
        <p>Browse properties and tap ❤️ to save your favourites here.</p>
        <a href="listings.html" class="btn btn-primary">Browse Properties</a>
      </div>`;
    if (count) count.innerHTML = '<strong>0</strong> saved properties';
    return;
  }

  showSpinner();

  try {
    // Fetch all saved properties from MongoDB
    const promises = savedIds.map(id =>
      fetch(`http://localhost:5000/api/properties/${id}`)
        .then(r => r.json())
        .catch(() => null)
    );

    const results = await Promise.all(promises);
    const properties = results.filter(p => p && !p.error);

    hideSpinner();

    if (!properties.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="icon">💔</div>
          <h3>No saved properties found</h3>
          <p>Your saved properties may have been removed.</p>
          <a href="listings.html" class="btn btn-primary">Browse Properties</a>
        </div>`;
      return;
    }

    // Show count and clear button
    if (count) count.innerHTML = `<strong>${properties.length}</strong> saved ${properties.length === 1 ? 'property' : 'properties'}`;
    if (clearBtn) clearBtn.style.display = 'inline-flex';
    if (subtitle) subtitle.textContent = `${properties.length} shortlisted room${properties.length > 1 ? 's' : ''} — all in one place.`;

    // Render cards
    grid.innerHTML = properties.map(p => buildCard(p)).join('');

  } catch (err) {
    hideSpinner();
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <h3>Could not load saved properties</h3>
        <p>Make sure your backend is running.</p>
        <a href="listings.html" class="btn btn-primary">Browse Properties</a>
      </div>`;
  }
}

/* ─── Clear All Saved ─────────────────────────────────────── */
window.clearAllSaved = function () {
  if (!confirm('Remove all saved properties?')) return;
  localStorage.removeItem('saved_props');
  showToast('All saved properties cleared', 'default');
  setTimeout(() => window.location.reload(), 800);
};

/* ─── Add Property Page ──────────────────────────────────── */
function initAddProperty() {
  const form = document.getElementById('addForm');
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('imgInput');

  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', e => {
      e.preventDefault();
      uploadZone.style.borderColor = 'var(--terra-mid)';
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.style.borderColor = '');
    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      uploadZone.style.borderColor = '';
      if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', e => handleFileUpload(e.target.files));
  }

  function handleFileUpload(files) {
    if (!files.length) return;
    const file = files[0]; // use first image

    const reader = new FileReader();
    reader.onload = function (e) {
      // Store base64 image globally to use on submit
      window.uploadedImageBase64 = e.target.result;

      // Show preview in upload zone
      const zone = document.getElementById('uploadZone');
      if (zone) {
        zone.innerHTML = `
          <img src="${e.target.result}"
            style="width:100%;height:200px;object-fit:cover;border-radius:10px;" />
          <p style="font-size:12px;color:var(--ink-3);margin-top:8px;text-align:center">
            ✅ ${file.name} — click to change
          </p>`;
      }
      showToast('Image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  }

  document.getElementById('generateAI')?.addEventListener('click', () => {
    const title = document.getElementById('propTitle')?.value.trim();
    const city = document.getElementById('propCity')?.value.trim();
    const type = document.getElementById('propType')?.value;
    if (!title) { showToast('Please enter a property title first', 'error'); return; }

    const btn = document.getElementById('generateAI');
    btn.disabled = true;
    btn.textContent = '⏳ Generating…';

    setTimeout(() => {
      const templates = [
        `${title} is a well-maintained ${type || 'property'} located in the heart of ${city || 'the city'}. Ideal for students and young professionals, offering modern amenities, excellent connectivity to educational institutions, and a safe neighbourhood.`,
        `Welcome to ${title}! Situated in ${city || 'a prime location'}, this ${type || 'property'} offers the perfect blend of comfort and convenience. Enjoy proximity to universities, shopping areas, and public transport.`,
      ];
      const desc = document.getElementById('propDesc');
      if (desc) desc.value = templates[Math.floor(Math.random() * templates.length)];
      btn.disabled = false;
      btn.innerHTML = '✨ Generate AI Description';
      showToast('AI description generated!', 'success');
    }, 1500);
  });

  form?.addEventListener('submit', async e => {
    e.preventDefault();

    const required = ['propTitle', 'propCity', 'propRent', 'propType'];
    for (const id of required) {
      if (!document.getElementById(id)?.value.trim()) {
        showToast('Please fill all required fields', 'error'); return;
      }
    }

    const amenities = [...document.querySelectorAll('input[name="amenity"]:checked')]
      .map(cb => cb.value);

    const property = {
      title: document.getElementById('propTitle').value.trim(),
      rent: parseInt(document.getElementById('propRent').value),
      city: document.getElementById('propCity').value.trim(),
      type: document.getElementById('propType').value,
      gender: document.getElementById('propGender')?.value || 'Any',
      description: document.getElementById('propDesc').value.trim(),
      ownerName: document.getElementById('propName')?.value.trim() || '',
      ownerPhone: document.getElementById('propPhone')?.value.trim() || '',
      amenities,
      image: window.uploadedImageBase64 || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
      rating: 4.0
    };

    try {
      showSpinner();
      const token = localStorage.getItem("nf_token");
      const response = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(property)
      });
      const result = await response.json();
      hideSpinner();

      if (result._id) {
        showToast('Property listed successfully! 🎉', 'success');
        setTimeout(() => { window.location.href = 'listings.html'; }, 1500);
      } else {
        showToast('Something went wrong. Try again!', 'error');
      }
    } catch (err) {
      hideSpinner();
      showToast('Could not connect to server!', 'error');
    }
  });
}

/* ─── Search Results Page ────────────────────────────────── */
function initSearch() {
  const city = getParam('city');
  const budget = parseInt(getParam('budget') || '0');

  const cityEl = document.getElementById('searchCityLabel');
  if (cityEl) cityEl.textContent = city || 'All Cities';

  let results = PROPERTIES.filter(p => {
    const cityOk = !city || p.city.toLowerCase().includes(city.toLowerCase());
    const budgetOk = !budget || p.rent <= budget;
    return cityOk && budgetOk;
  });

  const count = document.getElementById('searchCount');
  if (count) count.textContent = `${results.length} ${results.length === 1 ? 'property' : 'properties'} found`;

  renderCards('searchGrid', results);

  document.getElementById('inlineSearch')?.addEventListener('submit', e => {
    e.preventDefault();
    const val = e.target.q.value.trim();
    if (val) {
      showSpinner();
      setTimeout(() => { window.location.href = `search-results.html?city=${encodeURIComponent(val)}`; }, 500);
    }
  });
}

/* ============================================================
   AUTH MODULE
   ============================================================ */

function getUser() {
  try { return JSON.parse(localStorage.getItem('nf_user')); } catch { return null; }
}
function setUser(user) { localStorage.setItem('nf_user', JSON.stringify(user)); }
function clearUser() {
  localStorage.removeItem('nf_user');
  localStorage.removeItem('nf_token');
}

function initAuth() {
  const overlay = document.getElementById('authOverlay');
  const closeBtn = document.getElementById('authClose');

  if (closeBtn) closeBtn.addEventListener('click', closeAuth);
  if (overlay) overlay.addEventListener('click', e => {
    if (e.target === overlay) closeAuth();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('open')) closeAuth();
  });

  document.getElementById('signinForm')?.addEventListener('submit', handleSignin);
  document.getElementById('signupForm')?.addEventListener('submit', handleSignup);
  document.getElementById('forgotForm')?.addEventListener('submit', handleForgot);

  const user = getUser();
  if (user) showUserBadge(user);
}

window.openAuth = function (tab = 'signin') {
  const overlay = document.getElementById('authOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  switchTab(tab);
};

window.closeAuth = function () {
  const overlay = document.getElementById('authOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
};

window.switchTab = function (tab) {
  const tabs = { signin: 'tabSignin', signup: 'tabSignup' };
  const panels = { signin: 'panelSignin', signup: 'panelSignup', forgot: 'panelForgot' };
  const headers = {
    signin: { icon: '🏠', title: 'Welcome back', sub: 'Sign in to your NestFinder account' },
    signup: { icon: '🎓', title: 'Join NestFinder', sub: 'Create your free student account' },
    forgot: { icon: '🔑', title: 'Reset your password', sub: 'We\'ll email you a reset link' },
  };

  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  if (tabs[tab]) document.getElementById(tabs[tab])?.classList.add('active');

  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  if (panels[tab]) document.getElementById(panels[tab])?.classList.add('active');

  const h = headers[tab];
  if (h) {
    const iconEl = document.getElementById('authHeaderIcon');
    const titleEl = document.getElementById('authHeaderTitle');
    const subEl = document.getElementById('authHeaderSub');
    if (iconEl) iconEl.textContent = h.icon;
    if (titleEl) titleEl.textContent = h.title;
    if (subEl) subEl.textContent = h.sub;
  }

  const tabsBar = document.querySelector('.auth-tabs');
  if (tabsBar) tabsBar.style.display = tab === 'forgot' ? 'none' : '';
};

window.togglePassword = function (inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isVisible = input.type === 'text';
  input.type = isVisible ? 'password' : 'text';
  btn.textContent = isVisible ? '👁️' : '🙈';
};

window.checkPwStrength = function (val) {
  const fill = document.getElementById('pwFill');
  const label = document.getElementById('pwLabel');
  if (!fill || !label) return;

  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { pct: '0%', color: 'var(--border)', text: 'Enter a password' },
    { pct: '20%', color: 'var(--error)', text: 'Very weak' },
    { pct: '40%', color: '#f97316', text: 'Weak' },
    { pct: '60%', color: 'var(--warning)', text: 'Fair' },
    { pct: '80%', color: '#84cc16', text: 'Strong' },
    { pct: '100%', color: 'var(--success)', text: 'Very strong 💪' },
  ];

  const lvl = levels[Math.min(score, levels.length - 1)];
  fill.style.width = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent = lvl.text;
  label.style.color = lvl.color;
};

/* ─── Social Sign In ───────────────────────────────────────── */
window.socialLogin = function (provider) {

  showToast(`${provider} Sign In coming soon!`, 'default');
};

/* ─── Email Validation ───────────────────────────────────── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ─── Sign In ────────────────────────────────────────────── */
async function handleSignin(e) {
  e.preventDefault();
  const email = document.getElementById('siEmail')?.value.trim();
  const pw = document.getElementById('siPassword')?.value;

  if (!email || !isValidEmail(email)) { showToast('Please enter a valid email', 'error'); return; }
  if (!pw || pw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

  const btn = document.getElementById('signinBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></span> Signing in…';

  try {
    const res = await fetch("http://localhost:5000/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pw })
    });
    const data = await res.json();

    if (data.error) {
      showToast(data.error, 'error');
      btn.disabled = false;
      btn.innerHTML = '🚀 Sign In';
      return;
    }

    localStorage.setItem('nf_token', data.token);
    const user = { name: data.name, email: data.email };
    setUser(user);
    showUserBadge(user);

    const panel = document.getElementById('panelSignin');
    if (panel) {
      panel.innerHTML = `
        <div class="auth-success">
          <div class="auth-success-icon">✅</div>
          <h3>Welcome back, ${data.name}!</h3>
          <p>You're now signed in to NestFinder</p>
        </div>`;
    }

    showToast(`Welcome back, ${data.name}! 🎉`, 'success');
    setTimeout(closeAuth, 1800);

  } catch (err) {
    showToast('Could not connect to server!', 'error');
    btn.disabled = false;
    btn.innerHTML = '🚀 Sign In';
  }
}

/* ─── Sign Up ────────────────────────────────────────────── */
async function handleSignup(e) {
  e.preventDefault();
  const first = document.getElementById('suFirst')?.value.trim();
  const last = document.getElementById('suLast')?.value.trim();
  const email = document.getElementById('suEmail')?.value.trim();
  const pw = document.getElementById('suPassword')?.value;

  if (!first) { showToast('First name is required', 'error'); return; }
  if (!email || !isValidEmail(email)) { showToast('Please enter a valid email', 'error'); return; }
  if (!pw || pw.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }

  const btn = document.getElementById('signupBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></span> Creating account…';

  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${first} ${last}`.trim(), email, password: pw })
    });
    const data = await res.json();

    if (data.error) {
      showToast(data.error, 'error');
      btn.disabled = false;
      btn.innerHTML = '🎓 Create Account';
      return;
    }

    localStorage.setItem('nf_token', data.token);
    const user = { name: data.name, email: data.email };
    setUser(user);
    showUserBadge(user);

    const panel = document.getElementById('panelSignup');
    if (panel) {
      panel.innerHTML = `
        <div class="auth-success">
          <div class="auth-success-icon">🎉</div>
          <h3>Account created!</h3>
          <p>Welcome to NestFinder, ${first}!</p>
        </div>`;
    }

    showToast(`Welcome to NestFinder, ${first}! 🎉`, 'success');
    setTimeout(closeAuth, 1800);

  } catch (err) {
    showToast('Could not connect to server!', 'error');
    btn.disabled = false;
    btn.innerHTML = '🎓 Create Account';
  }
}

/* ─── Forgot Password ────────────────────────────────────── */
async function handleForgot(e) {
  e.preventDefault();
  const email = document.getElementById('fpEmail')?.value.trim();
  if (!email || !isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error'); return;
  }

  const btn = document.getElementById('forgotBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></span> Sending…';

  try {
    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (data.error) {
      showToast(data.error, 'error');
      btn.disabled = false;
      btn.innerHTML = '✉️ Send Reset Link';
      return;
    }

    const panel = document.getElementById('panelForgot');
    if (panel) {
      panel.innerHTML = `
        <div class="auth-success">
          <div class="auth-success-icon">📧</div>
          <h3>Check your inbox!</h3>
          <p>Reset link sent to <strong>${email}</strong>. Expires in 15 minutes.</p>
        </div>
        <button class="auth-submit" style="margin-top:20px" onclick="switchTab('signin')">← Back to Sign In</button>`;
    }
    showToast('Reset link sent! Check your email 📧', 'success');

  } catch (err) {
    showToast('Could not connect to server!', 'error');
    btn.disabled = false;
    btn.innerHTML = '✉️ Send Reset Link';
  }
}

/* ─── Show User Badge ────────────────────────────────────── */
function showUserBadge(user) {
  const navActions = document.getElementById('navActions');
  const signinBtn = document.getElementById('navLoginBtn');
  if (!navActions) return;
  if (signinBtn) signinBtn.remove();
  if (document.getElementById('navUserBadge')) return;

  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const badge = document.createElement('button');
  badge.id = 'navUserBadge';
  badge.className = 'nav-user-btn';
  badge.innerHTML = `<div class="nav-user-avatar">${initials}</div> ${user.name.split(' ')[0]}`;
  badge.onclick = () => {
    if (confirm(`Signed in as ${user.name}\n${user.email}\n\nSign out?`)) {
      clearUser();
      window.location.reload();
    }
  };
  navActions.prepend(badge);
}

/* ─── Single Boot (window.onload) ────────────────────────── */
window.onload = async function () {
  initNavbar();
  initAuth();

  const page = document.body.dataset.page;

  // Fetch MongoDB data for pages that need it
  if (page === 'listings' || page === 'home' || page === 'search') {
    try {
      showSpinner();
      const response = await fetch("http://localhost:5000/api/properties");
      const dbProperties = await response.json();
      if (!Array.isArray(dbProperties)) {
        console.error("Backend error:", dbProperties);
        hideSpinner();
        return;
      }
      PROPERTIES.length = 0;
      dbProperties.forEach(p => PROPERTIES.push(p));
      hideSpinner();
    } catch (err) {
      hideSpinner();
      console.error("Could not load from MongoDB:", err);
    }
  }

  // Run the right page function
  if (page === 'home') initHome();
  else if (page === 'listings') initListings();
  else if (page === 'detail') await initDetail();
  else if (page === 'add') initAddProperty();
  else if (page === 'search') initSearch();
  else if (page === 'saved') await initSaved();
};
