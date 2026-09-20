/**
 * @license
 * Poli International: Piercing Migration & Rejection Risk Tool V2
 * Pure client-side logic for factor evaluation, measurement tracking, and SVG rendering.
 */
(function(window, document) {
  'use strict';

  var t = window.PoliI18n.t;

  // Local storage keys
  var STORAGE_KEY_PROFILES = 'poli_piercing_profiles';
  var STORAGE_KEY_ACTIVE_PROFILE = 'poli_active_profile_id';
  var STORAGE_KEY_LEGACY_MEASUREMENTS = 'poli_migration_measurements';

  // State management to preserve inputs across language or tab switches
  var state = {
    selectedFactors: {
      placement: '',
      fit: '',
      material: '',
      trauma: '',
      aftercare: '',
      history: ''
    },
    activePlacementTab: 'navel',
    hasAssessed: false,
    profiles: [],
    activeProfileId: '',
    profileModalMode: null, // 'new', 'edit', or null
    decisionStep: 1,
    decisionOutcome: null
  };

  // Helper to escape HTML safely
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Local calendar date helper (Hard Ban 19: never use toISOString().slice(0, 10))
  function getTodayLocalDate() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  // Multi-Piercing Profile Storage & Migration (Item 2)
  function loadProfiles() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (saved) {
        state.profiles = JSON.parse(saved);
      }
    } catch (e) {
      state.profiles = [];
    }

    // Auto-migrate from legacy measurement array if profiles not yet created
    if (!Array.isArray(state.profiles) || state.profiles.length === 0) {
      var legacyMeasurements = [];
      try {
        var legacyData = localStorage.getItem(STORAGE_KEY_LEGACY_MEASUREMENTS);
        if (legacyData) {
          legacyMeasurements = JSON.parse(legacyData);
        }
      } catch (e) {}

      var defaultProfile = {
        id: 'profile-' + Date.now(),
        name: t('profiles.defaultName'),
        piercingDate: '',
        baselineMeasurement: legacyMeasurements.length > 0 ? String(legacyMeasurements[0].value) : '',
        gauge: '',
        material: '',
        measurements: legacyMeasurements
      };
      state.profiles = [defaultProfile];
      saveProfiles();
    }

    var activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE);
    var found = state.profiles.find(function(p) { return p.id === activeId; });
    if (found) {
      state.activeProfileId = found.id;
    } else {
      state.activeProfileId = state.profiles[0].id;
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, state.activeProfileId);
    }
  }

  function getActiveProfile() {
    var p = state.profiles.find(function(item) { return item.id === state.activeProfileId; });
    return p || state.profiles[0];
  }

  function saveProfiles() {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(state.profiles));
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, state.activeProfileId);
    } catch (e) {
      // Storage failure handling
    }
  }

  // SVGs for the 4 signs of migration, designed for high-contrast & greyscale readability
  function renderSignSvg(type) {
    if (type === 'thinning') {
      return `
        <svg class="sign-svg" viewBox="0 0 340 120" role="img" aria-label="${esc(t('signs.sign1_title'))}" xmlns="http://www.w3.org/2000/svg">
          <!-- Normal placement (Left) -->
          <g transform="translate(10, 10)">
            <rect x="0" y="25" width="140" height="75" rx="6" fill="var(--svg-skin-bg)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <path d="M 0 25 Q 70 20 140 25" fill="none" stroke="var(--svg-stroke)" stroke-width="2" />
            <!-- Barbell deep in tissue -->
            <line x1="25" y1="58" x2="115" y2="58" stroke="var(--svg-metal)" stroke-width="7" stroke-linecap="round" />
            <circle cx="25" cy="58" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <circle cx="115" cy="58" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <!-- Depth indicator -->
            <line x1="70" y1="23" x2="70" y2="55" stroke="var(--text-muted)" stroke-dasharray="2,2" stroke-width="1.5" />
            <text x="70" y="15" font-size="10" font-weight="bold" fill="var(--text-main)" text-anchor="middle">${esc(t('signs.normalLabel'))}</text>
            <text x="70" y="92" font-size="9.5" fill="var(--text-muted)" text-anchor="middle">${esc(t('signs.ampleBridge'))}</text>
          </g>
          
          <!-- Divider -->
          <line x1="170" y1="15" x2="170" y2="105" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,3" />

          <!-- Migrating placement (Right) -->
          <g transform="translate(190, 10)">
            <rect x="0" y="25" width="140" height="75" rx="6" fill="var(--svg-skin-bg)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <!-- Thinned concave skin depression -->
            <path d="M 0 25 Q 70 42 140 25" fill="none" stroke="var(--svg-stroke)" stroke-width="2" />
            <!-- Barbell pushed shallow near surface -->
            <line x1="30" y1="46" x2="110" y2="46" stroke="var(--svg-metal)" stroke-width="7" stroke-linecap="round" />
            <circle cx="30" cy="46" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <circle cx="110" cy="46" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <!-- Thin depth indicator -->
            <line x1="70" y1="42" x2="70" y2="46" stroke="var(--svg-alert)" stroke-width="2" />
            <text x="70" y="15" font-size="10" font-weight="bold" fill="var(--svg-alert)" text-anchor="middle">${esc(t('signs.migratingLabel'))}</text>
            <text x="70" y="92" font-size="9.5" fill="var(--svg-alert)" text-anchor="middle">${esc(t('signs.thinningOverBar'))}</text>
          </g>
        </svg>
      `;
    }

    if (type === 'visible') {
      return `
        <svg class="sign-svg" viewBox="0 0 340 120" role="img" aria-label="${esc(t('signs.sign2_title'))}" xmlns="http://www.w3.org/2000/svg">
          <!-- Normal placement (Left) -->
          <g transform="translate(10, 10)">
            <rect x="0" y="25" width="140" height="75" rx="6" fill="var(--svg-skin-bg)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <text x="70" y="15" font-size="10" font-weight="bold" fill="var(--text-main)" text-anchor="middle">${esc(t('signs.normalLabel'))}</text>
            <!-- Thick opaque skin layer -->
            <line x1="25" y1="62" x2="115" y2="62" stroke="var(--svg-metal)" stroke-width="6" stroke-linecap="round" opacity="0.15" />
            <circle cx="25" cy="62" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <circle cx="115" cy="62" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <text x="70" y="92" font-size="9.5" fill="var(--text-muted)" text-anchor="middle">${esc(t('signs.barConcealed'))}</text>
          </g>

          <!-- Divider -->
          <line x1="170" y1="15" x2="170" y2="105" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,3" />

          <!-- Migrating placement (Right) -->
          <g transform="translate(190, 10)">
            <rect x="0" y="25" width="140" height="75" rx="6" fill="var(--svg-skin-bg)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <text x="70" y="15" font-size="10" font-weight="bold" fill="var(--svg-alert)" text-anchor="middle">${esc(t('signs.migratingLabel'))}</text>
            <!-- Translucent thinned bridge revealing dark bar outline -->
            <rect x="35" y="32" width="70" height="18" fill="var(--svg-alert-bg)" stroke="var(--svg-alert)" stroke-width="1" stroke-dasharray="2,2" rx="3" />
            <line x1="30" y1="41" x2="110" y2="41" stroke="var(--svg-metal)" stroke-width="7" stroke-linecap="round" />
            <circle cx="30" cy="41" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <circle cx="110" cy="41" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <text x="70" y="92" font-size="9.5" fill="var(--svg-alert)" text-anchor="middle">${esc(t('signs.metallicShadow'))}</text>
          </g>
        </svg>
      `;
    }

    if (type === 'closer') {
      return `
        <svg class="sign-svg" viewBox="0 0 340 120" role="img" aria-label="${esc(t('signs.sign3_title'))}" xmlns="http://www.w3.org/2000/svg">
          <!-- Initial piercing distance (Left) -->
          <g transform="translate(10, 10)">
            <rect x="0" y="30" width="140" height="70" rx="6" fill="var(--svg-skin-bg)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <text x="70" y="15" font-size="10" font-weight="bold" fill="var(--text-main)" text-anchor="middle">${esc(t('signs.initialPiercing'))}</text>
            <!-- Wide distance between holes (10mm) -->
            <line x1="25" y1="55" x2="115" y2="55" stroke="var(--svg-metal)" stroke-width="6" />
            <circle cx="25" cy="55" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <circle cx="115" cy="55" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <!-- Distance arrow -->
            <line x1="33" y1="75" x2="107" y2="75" stroke="var(--text-main)" stroke-width="1.5" />
            <path d="M 33 72 L 27 75 L 33 78 Z M 107 72 L 113 75 L 107 78 Z" fill="var(--text-main)" />
            <text x="70" y="92" font-size="9.5" fill="var(--text-muted)" text-anchor="middle">${esc(t('signs.fullTissueWidth'))}</text>
          </g>

          <!-- Divider -->
          <line x1="170" y1="15" x2="170" y2="105" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,3" />

          <!-- Holes moved closer (Right) -->
          <g transform="translate(190, 10)">
            <rect x="0" y="30" width="140" height="70" rx="6" fill="var(--svg-skin-bg)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <text x="70" y="15" font-size="10" font-weight="bold" fill="var(--svg-alert)" text-anchor="middle">${esc(t('signs.migratingLabel'))}</text>
            <!-- Same total barbell length, but holes closer together -->
            <line x1="25" y1="55" x2="115" y2="55" stroke="var(--svg-metal)" stroke-width="6" />
            <circle cx="25" cy="55" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <circle cx="115" cy="55" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <!-- Entry and exit holes moved inwards to 45 and 95 -->
            <circle cx="45" cy="55" r="3" fill="var(--svg-alert)" />
            <circle cx="95" cy="55" r="3" fill="var(--svg-alert)" />
            <!-- Distance arrow narrowed -->
            <line x1="49" y1="75" x2="91" y2="75" stroke="var(--svg-alert)" stroke-width="1.5" />
            <path d="M 49 72 L 45 75 L 49 78 Z M 91 72 L 95 75 L 91 78 Z" fill="var(--svg-alert)" />
            <text x="70" y="92" font-size="9.5" fill="var(--svg-alert)" text-anchor="middle">${esc(t('signs.holesCloserExtraBar'))}</text>
          </g>
        </svg>
      `;
    }

    if (type === 'redness') {
      return `
        <svg class="sign-svg" viewBox="0 0 340 120" role="img" aria-label="${esc(t('signs.sign4_title'))}" xmlns="http://www.w3.org/2000/svg">
          <!-- Settled tissue (Left) -->
          <g transform="translate(10, 10)">
            <rect x="0" y="25" width="140" height="75" rx="6" fill="var(--svg-skin-bg)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <text x="70" y="15" font-size="10" font-weight="bold" fill="var(--text-main)" text-anchor="middle">${esc(t('signs.normalLabel'))}</text>
            <line x1="25" y1="60" x2="115" y2="60" stroke="var(--svg-metal)" stroke-width="6" stroke-linecap="round" />
            <circle cx="25" cy="60" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <circle cx="115" cy="60" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <text x="70" y="92" font-size="9.5" fill="var(--text-muted)" text-anchor="middle">${esc(t('signs.calmSkinTone'))}</text>
          </g>

          <!-- Divider -->
          <line x1="170" y1="15" x2="170" y2="105" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,3" />

          <!-- Persistent erythema stripe (Right) -->
          <g transform="translate(190, 10)">
            <rect x="0" y="25" width="140" height="75" rx="6" fill="var(--svg-skin-bg)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <text x="70" y="15" font-size="10" font-weight="bold" fill="var(--svg-alert)" text-anchor="middle">${esc(t('signs.migratingLabel'))}</text>
            <!-- Linear redness track -->
            <rect x="25" y="42" width="90" height="16" fill="var(--svg-alert-bg)" stroke="var(--svg-alert)" stroke-width="1.5" rx="4" />
            <line x1="25" y1="50" x2="115" y2="50" stroke="var(--svg-metal)" stroke-width="6" stroke-linecap="round" />
            <circle cx="25" cy="50" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <circle cx="115" cy="50" r="7" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
            <text x="70" y="92" font-size="9.5" fill="var(--svg-alert)" text-anchor="middle">${esc(t('signs.redIrritationStripe'))}</text>
          </g>
        </svg>
      `;
    }

    return '';
  }

  // Render the Factors Questionnaire form
  function renderFactorsForm() {
    var formContainer = document.getElementById('factors-form-container');
    if (!formContainer) return;

    var html = `
      <div class="factor-section-intro">
        <p>${esc(t('factors.intro'))}</p>
      </div>

      <!-- Factor 1: Placement -->
      <fieldset class="factor-group">
        <legend class="factor-legend">${esc(t('factors.placement.label'))}</legend>
        <div class="factor-options">
          <label class="factor-option-card">
            <input type="radio" name="placement" value="fold" ${state.selectedFactors.placement === 'fold' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.placement.opt_fold'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="placement" value="navel" ${state.selectedFactors.placement === 'navel' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.placement.opt_navel'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="placement" value="surface" ${state.selectedFactors.placement === 'surface' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.placement.opt_surface'))}</span>
          </label>
        </div>
      </fieldset>

      <!-- Factor 2: Fit -->
      <fieldset class="factor-group">
        <legend class="factor-legend">${esc(t('factors.fit.label'))}</legend>
        <div class="factor-options">
          <label class="factor-option-card">
            <input type="radio" name="fit" value="downsized" ${state.selectedFactors.fit === 'downsized' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.fit.opt_downsized'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="fit" value="long" ${state.selectedFactors.fit === 'long' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.fit.opt_long'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="fit" value="tight" ${state.selectedFactors.fit === 'tight' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.fit.opt_tight'))}</span>
          </label>
        </div>
      </fieldset>

      <!-- Factor 3: Material -->
      <fieldset class="factor-group">
        <legend class="factor-legend">${esc(t('factors.material.label'))}</legend>
        <div class="factor-options">
          <label class="factor-option-card">
            <input type="radio" name="material" value="implant" ${state.selectedFactors.material === 'implant' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.material.opt_implant'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="material" value="mystery" ${state.selectedFactors.material === 'mystery' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.material.opt_mystery'))}</span>
          </label>
        </div>
      </fieldset>

      <!-- Factor 4: Trauma -->
      <fieldset class="factor-group">
        <legend class="factor-legend">${esc(t('factors.trauma.label'))}</legend>
        <div class="factor-options">
          <label class="factor-option-card">
            <input type="radio" name="trauma" value="none" ${state.selectedFactors.trauma === 'none' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.trauma.opt_none'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="trauma" value="occasional" ${state.selectedFactors.trauma === 'occasional' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.trauma.opt_occasional'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="trauma" value="frequent" ${state.selectedFactors.trauma === 'frequent' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.trauma.opt_frequent'))}</span>
          </label>
        </div>
      </fieldset>

      <!-- Factor 5: Aftercare -->
      <fieldset class="factor-group">
        <legend class="factor-legend">${esc(t('factors.aftercare.label'))}</legend>
        <div class="factor-options">
          <label class="factor-option-card">
            <input type="radio" name="aftercare" value="saline" ${state.selectedFactors.aftercare === 'saline' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.aftercare.opt_saline'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="aftercare" value="inconsistent" ${state.selectedFactors.aftercare === 'inconsistent' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.aftercare.opt_inconsistent'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="aftercare" value="harsh" ${state.selectedFactors.aftercare === 'harsh' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.aftercare.opt_harsh'))}</span>
          </label>
        </div>
      </fieldset>

      <!-- Factor 6: History -->
      <fieldset class="factor-group">
        <legend class="factor-legend">${esc(t('factors.history.label'))}</legend>
        <div class="factor-options">
          <label class="factor-option-card">
            <input type="radio" name="history" value="healthy" ${state.selectedFactors.history === 'healthy' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.history.opt_healthy'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="history" value="slow" ${state.selectedFactors.history === 'slow' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.history.opt_slow'))}</span>
          </label>
          <label class="factor-option-card">
            <input type="radio" name="history" value="scar" ${state.selectedFactors.history === 'scar' ? 'checked' : ''} />
            <span class="option-text">${esc(t('factors.history.opt_scar'))}</span>
          </label>
        </div>
      </fieldset>

      <div id="factor-validation-error" class="validation-msg" hidden></div>

      <div class="form-actions">
        <button type="button" id="btn-assess-factors" class="btn btn-primary">${esc(t('factors.submitBtn'))}</button>
        <button type="button" id="btn-reset-factors" class="btn btn-secondary">${esc(t('factors.resetBtn'))}</button>
      </div>
    `;

    formContainer.innerHTML = html;

    // Attach change listeners to update state in real time
    formContainer.querySelectorAll('input[type="radio"]').forEach(function(radio) {
      radio.addEventListener('change', function(e) {
        state.selectedFactors[e.target.name] = e.target.value;
      });
    });

    document.getElementById('btn-assess-factors').addEventListener('click', handleAssessFactors);
    document.getElementById('btn-reset-factors').addEventListener('click', handleResetFactors);
  }

  // Handle factor assessment
  function handleAssessFactors() {
    var errorEl = document.getElementById('factor-validation-error');
    var keys = ['placement', 'fit', 'material', 'trauma', 'aftercare', 'history'];
    var missing = keys.filter(function(k) { return !state.selectedFactors[k]; });

    if (missing.length > 0) {
      errorEl.textContent = t('factors.validationError');
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;
    state.hasAssessed = true;
    renderAssessmentResults();
  }

  // Handle factor reset
  function handleResetFactors() {
    state.hasAssessed = false;
    state.selectedFactors = {
      placement: '',
      fit: '',
      material: '',
      trauma: '',
      aftercare: '',
      history: ''
    };
    renderFactorsForm();
    var resultsEl = document.getElementById('factors-results-container');
    if (resultsEl) resultsEl.innerHTML = '';
  }

  // Evaluate factors and render results (NO percentage, NO scores)
  function renderAssessmentResults() {
    var resultsContainer = document.getElementById('factors-results-container');
    if (!resultsContainer) return;

    var f = state.selectedFactors;
    var raising = [];
    var lowering = [];

    // Placement
    if (f.placement === 'surface') {
      raising.push({ label: t('factors.placement.label'), reason: t('reason.placement_surface'), type: 'placement' });
    } else if (f.placement === 'navel') {
      raising.push({ label: t('factors.placement.label'), reason: t('reason.placement_navel'), type: 'placement' });
    } else if (f.placement === 'fold') {
      lowering.push({ label: t('factors.placement.label'), reason: t('reason.placement_fold'), type: 'placement' });
    }

    // Fit
    if (f.fit === 'long') {
      raising.push({ label: t('factors.fit.label'), reason: t('reason.fit_long'), type: 'fit' });
    } else if (f.fit === 'tight') {
      raising.push({ label: t('factors.fit.label'), reason: t('reason.fit_tight'), type: 'fit' });
    } else if (f.fit === 'downsized') {
      lowering.push({ label: t('factors.fit.label'), reason: t('reason.fit_downsized'), type: 'fit' });
    }

    // Material
    if (f.material === 'mystery') {
      raising.push({ label: t('factors.material.label'), reason: t('reason.material_mystery'), type: 'material' });
    } else if (f.material === 'implant') {
      lowering.push({ label: t('factors.material.label'), reason: t('reason.material_implant'), type: 'material' });
    }

    // Trauma
    if (f.trauma === 'frequent') {
      raising.push({ label: t('factors.trauma.label'), reason: t('reason.trauma_frequent'), type: 'trauma' });
    } else if (f.trauma === 'occasional') {
      raising.push({ label: t('factors.trauma.label'), reason: t('reason.trauma_occasional'), type: 'trauma' });
    } else if (f.trauma === 'none') {
      lowering.push({ label: t('factors.trauma.label'), reason: t('reason.trauma_none'), type: 'trauma' });
    }

    // Aftercare
    if (f.aftercare === 'harsh') {
      raising.push({ label: t('factors.aftercare.label'), reason: t('reason.aftercare_harsh'), type: 'aftercare' });
    } else if (f.aftercare === 'inconsistent') {
      raising.push({ label: t('factors.aftercare.label'), reason: t('reason.aftercare_inconsistent'), type: 'aftercare' });
    } else if (f.aftercare === 'saline') {
      lowering.push({ label: t('factors.aftercare.label'), reason: t('reason.aftercare_saline'), type: 'aftercare' });
    }

    // History
    if (f.history === 'scar') {
      raising.push({ label: t('factors.history.label'), reason: t('reason.history_scar'), type: 'history' });
    } else if (f.history === 'slow') {
      raising.push({ label: t('factors.history.label'), reason: t('reason.history_slow'), type: 'history' });
    } else if (f.history === 'healthy') {
      lowering.push({ label: t('factors.history.label'), reason: t('reason.history_healthy'), type: 'history' });
    }

    // Categorize overall tendency based on factors balance
    var tendencyClass = 'tendency-moderate';
    var tendencyTitle = t('results.tendencyModerate');
    var tendencyDesc = t('results.tendencyModerateDesc');

    if (raising.length >= 4 || (f.placement === 'surface' && raising.length >= 3)) {
      tendencyClass = 'tendency-higher';
      tendencyTitle = t('results.tendencyHigher');
      tendencyDesc = t('results.tendencyHigherDesc');
    } else if (raising.length <= 1 && lowering.length >= 4) {
      tendencyClass = 'tendency-lower';
      tendencyTitle = t('results.tendencyLower');
      tendencyDesc = t('results.tendencyLowerDesc');
    }

    var raisingItemsHtml = raising.length === 0
      ? `<li class="factor-result-item none-item">${esc(t('results.noneIdentified'))}</li>`
      : raising.map(function(item) {
          return `
            <li class="factor-result-item raising-item">
              <strong>${esc(item.label)}</strong>
              <p>${esc(item.reason)}</p>
            </li>
          `;
        }).join('');

    var loweringItemsHtml = lowering.length === 0
      ? `<li class="factor-result-item none-item">${esc(t('results.noneIdentified'))}</li>`
      : lowering.map(function(item) {
          return `
            <li class="factor-result-item lowering-item">
              <strong>${esc(item.label)}</strong>
              <p>${esc(item.reason)}</p>
            </li>
          `;
        }).join('');

    // Practical changes section: specific to raising factors
    var changes = [];
    if (f.fit === 'long' || f.fit === 'tight') {
      changes.push(`
        <li class="action-item">
          <strong>${esc(t('change.fit_advice'))}</strong>
          <a href="https://poliinternational.com/jewelry-size-visualizer/" target="_top" class="action-link">${esc(t('change.fit_link'))} &rarr;</a>
        </li>
      `);
    }
    if (f.trauma === 'frequent' || f.trauma === 'occasional') {
      changes.push(`
        <li class="action-item">
          <strong>${esc(t('change.trauma_advice'))}</strong>
        </li>
      `);
    }
    if (f.aftercare === 'harsh' || f.aftercare === 'inconsistent') {
      changes.push(`
        <li class="action-item">
          <strong>${esc(t('change.aftercare_advice'))}</strong>
          <a href="https://poliinternational.com/aftercare-schedule-generator/" target="_top" class="action-link">${esc(t('change.aftercare_link'))} &rarr;</a>
        </li>
      `);
    }
    if (f.material === 'mystery') {
      changes.push(`
        <li class="action-item">
          <strong>${esc(t('change.material_advice'))}</strong>
        </li>
      `);
    }
    // Angle & depth note
    changes.push(`
      <li class="action-item">
        <strong>${esc(t('change.angle_advice'))}</strong>
        <a href="https://poliinternational.com/piercing-angle-guide/" target="_top" class="action-link">${esc(t('change.angle_link'))} &rarr;</a>
      </li>
    `);

    var html = `
      <div class="results-card">
        <div class="tendency-banner ${tendencyClass}">
          <h3 class="tendency-heading">${esc(tendencyTitle)}</h3>
          <p class="tendency-sub">${esc(tendencyDesc)}</p>
        </div>

        <div class="results-grid">
          <!-- Raising factors -->
          <div class="factor-column factor-column-raising">
            <h4 class="column-title">${esc(t('results.raisingTitle'))}</h4>
            <ul class="factor-result-list">${raisingItemsHtml}</ul>
          </div>

          <!-- Lowering factors -->
          <div class="factor-column factor-column-lowering">
            <h4 class="column-title">${esc(t('results.loweringTitle'))}</h4>
            <ul class="factor-result-list">${loweringItemsHtml}</ul>
          </div>
        </div>

        <!-- What you can change -->
        <div class="action-section">
          <h4 class="action-title">${esc(t('change.title'))}</h4>
          <ul class="action-list">${changes.join('')}</ul>
        </div>
      </div>
    `;

    resultsContainer.innerHTML = html;
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Render Signs of Migration section with SVGs
  function renderSignsSection() {
    var signsContainer = document.getElementById('signs-section-container');
    if (!signsContainer) return;

    var html = `
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">${esc(t('signs.title'))}</h2>
          <p class="section-sub">${esc(t('signs.intro'))}</p>
        </div>

        <div class="signs-grid">
          <!-- Sign 1 -->
          <div class="sign-card">
            <div class="sign-diagram">${renderSignSvg('thinning')}</div>
            <div class="sign-body">
              <h3 class="sign-title">${esc(t('signs.sign1_title'))}</h3>
              <p class="sign-desc">${esc(t('signs.sign1_desc'))}</p>
              <div class="sign-action">${esc(t('signs.sign1_action'))}</div>
            </div>
          </div>

          <!-- Sign 2 -->
          <div class="sign-card">
            <div class="sign-diagram">${renderSignSvg('visible')}</div>
            <div class="sign-body">
              <h3 class="sign-title">${esc(t('signs.sign2_title'))}</h3>
              <p class="sign-desc">${esc(t('signs.sign2_desc'))}</p>
              <div class="sign-action">${esc(t('signs.sign2_action'))}</div>
            </div>
          </div>

          <!-- Sign 3 -->
          <div class="sign-card">
            <div class="sign-diagram">${renderSignSvg('closer')}</div>
            <div class="sign-body">
              <h3 class="sign-title">${esc(t('signs.sign3_title'))}</h3>
              <p class="sign-desc">${esc(t('signs.sign3_desc'))}</p>
              <div class="sign-action">${esc(t('signs.sign3_action'))}</div>
            </div>
          </div>

          <!-- Sign 4 -->
          <div class="sign-card">
            <div class="sign-diagram">${renderSignSvg('redness')}</div>
            <div class="sign-body">
              <h3 class="sign-title">${esc(t('signs.sign4_title'))}</h3>
              <p class="sign-desc">${esc(t('signs.sign4_desc'))}</p>
              <div class="sign-action">${esc(t('signs.sign4_action'))}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    signsContainer.innerHTML = html;
  }

  // Render Surface & Flat Placements Explained
  function renderSurfaceExplanation() {
    var container = document.getElementById('surface-explanation-container');
    if (!container) return;

    container.innerHTML = `
      <div class="section-card surface-card">
        <h2 class="section-title">${esc(t('surface.title'))}</h2>
        <div class="prose-block">
          <p>${esc(t('surface.p1'))}</p>
          <p>${esc(t('surface.p2'))}</p>
          <p>${esc(t('surface.p3'))}</p>
        </div>
      </div>
    `;
  }

  // Render What a Piercer Can Actually Do
  function renderPiercerActions() {
    var container = document.getElementById('piercer-actions-container');
    if (!container) return;

    container.innerHTML = `
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">${esc(t('piercer.title'))}</h2>
          <p class="section-sub">${esc(t('piercer.intro'))}</p>
        </div>

        <div class="piercer-grid">
          <div class="piercer-card">
            <h3 class="piercer-card-title">${esc(t('piercer.downsize_title'))}</h3>
            <p>${esc(t('piercer.downsize_desc'))}</p>
          </div>
          <div class="piercer-card">
            <h3 class="piercer-card-title">${esc(t('piercer.change_jewellery_title'))}</h3>
            <p>${esc(t('piercer.change_jewellery_desc'))}</p>
          </div>
          <div class="piercer-card">
            <h3 class="piercer-card-title">${esc(t('piercer.resite_title'))}</h3>
            <p>${esc(t('piercer.resite_desc'))}</p>
          </div>
          <div class="piercer-card honest-card">
            <h3 class="piercer-card-title">${esc(t('piercer.honest_title'))}</h3>
            <p>${esc(t('piercer.honest_desc'))}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Render Per-Placement Guidance
  function renderPlacementGuidance() {
    var container = document.getElementById('placement-guidance-container');
    if (!container) return;

    var activeTab = state.activePlacementTab || 'navel';

    var tabs = [
      { id: 'navel', label: t('placements.tab_navel'), desc: t('placements.navel_desc') },
      { id: 'eyebrow', label: t('placements.tab_eyebrow'), desc: t('placements.eyebrow_desc') },
      { id: 'surface', label: t('placements.tab_surface'), desc: t('placements.surface_desc') },
      { id: 'dermal', label: t('placements.tab_dermal'), desc: t('placements.dermal_desc') }
    ];

    var activeDesc = '';
    var tabButtonsHtml = tabs.map(function(tab) {
      var isActive = tab.id === activeTab;
      if (isActive) activeDesc = tab.desc;
      return `
        <button type="button" class="tab-btn ${isActive ? 'active' : ''}" data-placement-tab="${esc(tab.id)}">
          ${esc(tab.label)}
        </button>
      `;
    }).join('');

    container.innerHTML = `
      <div class="section-card">
        <h2 class="section-title">${esc(t('placements.title'))}</h2>
        <div class="tab-buttons-wrap">${tabButtonsHtml}</div>
        <div class="tab-content-panel">
          <p class="tab-desc">${esc(activeDesc)}</p>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-placement-tab]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.activePlacementTab = btn.getAttribute('data-placement-tab');
        renderPlacementGuidance();
      });
    });
  }

  // ==========================================================================
  // Caliper Measurement Guidance (Item 5)
  // ==========================================================================
  function renderCaliperSvg(type) {
    if (type === 'correct') {
      return `
        <svg class="caliper-svg" viewBox="0 0 320 140" role="img" aria-label="${esc(t('caliper.correctBadge'))}" xmlns="http://www.w3.org/2000/svg">
          <!-- Tissue bridge cross section -->
          <path d="M 25 50 Q 80 40 160 40 Q 240 40 295 50 L 295 125 L 25 125 Z" fill="var(--svg-skin-bg)" stroke="var(--svg-stroke)" stroke-width="1.5" />
          <!-- Channel entry & exit -->
          <circle cx="85" cy="50" r="5" fill="var(--svg-stroke)" />
          <circle cx="235" cy="50" r="5" fill="var(--svg-stroke)" />
          <!-- Barbell post through channel -->
          <line x1="85" y1="50" x2="235" y2="50" stroke="var(--svg-metal)" stroke-width="5" stroke-dasharray="3,3" />
          <circle cx="85" cy="50" r="8" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
          <circle cx="235" cy="50" r="8" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
          <!-- Caliper jaws resting gently on outer tissue boundary -->
          <path d="M 68 15 L 75 15 L 75 75 L 70 75 Z" fill="var(--text-muted)" stroke="var(--svg-stroke)" stroke-width="1" />
          <path d="M 252 15 L 245 15 L 245 75 L 250 75 Z" fill="var(--text-muted)" stroke="var(--svg-stroke)" stroke-width="1" />
          <!-- Zero compression dimension line -->
          <line x1="75" y1="28" x2="245" y2="28" stroke="var(--success-border)" stroke-width="2" />
          <polygon points="75,28 83,24 83,32" fill="var(--success-border)" />
          <polygon points="245,28 237,24 237,32" fill="var(--success-border)" />
          <rect x="100" y="18" width="120" height="20" rx="3" fill="var(--bg-card)" stroke="var(--success-border)" stroke-width="1" />
          <text x="160" y="32" font-size="10" font-weight="bold" fill="var(--success-text)" text-anchor="middle">${esc(t('caliper.correctBadge'))}</text>
          <text x="160" y="90" font-size="9.5" fill="var(--text-main)" text-anchor="middle">${esc(t('caliper.zeroCompressionLabel'))}</text>
        </svg>
      `;
    }

    // Incorrect technique: tissue pinched
    return `
      <svg class="caliper-svg" viewBox="0 0 320 140" role="img" aria-label="${esc(t('caliper.incorrectBadge'))}" xmlns="http://www.w3.org/2000/svg">
        <!-- Skin pinched inward by force -->
        <path d="M 25 50 Q 75 40 105 42 Q 130 58 160 58 Q 190 58 215 42 Q 245 40 295 50 L 295 125 L 25 125 Z" fill="var(--svg-skin-bg)" stroke="var(--svg-stroke)" stroke-width="1.5" />
        <!-- Compressed channel entry & exit -->
        <circle cx="115" cy="48" r="5" fill="var(--svg-stroke)" />
        <circle cx="205" cy="48" r="5" fill="var(--svg-stroke)" />
        <!-- Barbell post squeezed -->
        <line x1="115" y1="48" x2="205" y2="48" stroke="var(--svg-metal)" stroke-width="5" stroke-dasharray="3,3" />
        <circle cx="115" cy="48" r="8" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
        <circle cx="205" cy="48" r="8" fill="var(--svg-bead)" stroke="var(--svg-stroke)" stroke-width="1.5" />
        <!-- Caliper jaws squeezing inward -->
        <path d="M 100 15 L 107 15 L 107 75 L 102 75 Z" fill="var(--svg-alert)" stroke="var(--svg-stroke)" stroke-width="1" />
        <path d="M 220 15 L 213 15 L 213 75 L 218 75 Z" fill="var(--svg-alert)" stroke="var(--svg-stroke)" stroke-width="1" />
        <!-- Squeeze arrows -->
        <polygon points="90,48 98,44 98,52" fill="var(--svg-alert)" />
        <polygon points="230,48 222,44 222,52" fill="var(--svg-alert)" />
        <!-- False reading dimension line -->
        <line x1="107" y1="28" x2="213" y2="28" stroke="var(--alert-border)" stroke-width="2" />
        <polygon points="107,28 115,24 115,32" fill="var(--alert-border)" />
        <polygon points="213,28 205,24 205,32" fill="var(--alert-border)" />
        <rect x="110" y="18" width="100" height="20" rx="3" fill="var(--bg-card)" stroke="var(--alert-border)" stroke-width="1" />
        <text x="160" y="32" font-size="10" font-weight="bold" fill="var(--alert-text)" text-anchor="middle">${esc(t('caliper.incorrectBadge'))}</text>
        <text x="160" y="90" font-size="9.5" fill="var(--alert-text)" text-anchor="middle">${esc(t('caliper.pinchedLabel'))}</text>
      </svg>
    `;
  }

  function renderCaliperGuidance() {
    var container = document.getElementById('caliper-guidance-container');
    if (!container) return;

    container.innerHTML = `
      <div class="section-card caliper-card-wrap">
        <div class="section-header">
          <h2 class="section-title">${esc(t('caliper.title'))}</h2>
          <p class="section-sub">${esc(t('caliper.intro'))}</p>
        </div>

        <div class="caliper-grid">
          <!-- Correct technique -->
          <div class="caliper-technique-card">
            <div class="caliper-diagram">${renderCaliperSvg('correct')}</div>
            <div class="caliper-body">
              <h3 class="caliper-title-correct">${esc(t('caliper.correctBadge'))}</h3>
              <p class="caliper-desc">${esc(t('caliper.correctDesc'))}</p>
            </div>
          </div>

          <!-- Incorrect technique -->
          <div class="caliper-technique-card">
            <div class="caliper-diagram">${renderCaliperSvg('incorrect')}</div>
            <div class="caliper-body">
              <h3 class="caliper-title-incorrect">${esc(t('caliper.incorrectBadge'))}</h3>
              <p class="caliper-desc">${esc(t('caliper.incorrectDesc'))}</p>
            </div>
          </div>
        </div>

        <div class="caliper-tips-panel">
          <h4 class="caliper-tips-title">${esc(t('caliper.tipsTitle'))}</h4>
          <ul class="caliper-tips-list">
            <li><strong>${esc(t('caliper.tip1_title'))}:</strong> ${esc(t('caliper.tip1_text'))}</li>
            <li><strong>${esc(t('caliper.tip2_title'))}:</strong> ${esc(t('caliper.tip2_text'))}</li>
            <li><strong>${esc(t('caliper.tip3_title'))}:</strong> ${esc(t('caliper.tip3_text'))}</li>
          </ul>
          <div class="caliper-sizing-link-wrap">
            <a href="https://poliinternational.com/jewelry-size-visualizer/" target="_top" class="action-link">${esc(t('caliper.sizingLink'))} &rarr;</a>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Inline SVG Measurement Trend Graph (Item 3)
  // Hard limits: No graded zones, no thresholds, no prediction calculations.
  // ==========================================================================
  function renderTrendGraph(profile) {
    var entries = (profile.measurements || []).slice().sort(function(a, b) {
      return a.date.localeCompare(b.date);
    });

    if (entries.length < 2) {
      return `
        <div class="graph-placeholder">
          <p class="graph-notice">${esc(t('graph.minDataNotice'))}</p>
        </div>
      `;
    }

    var values = entries.map(function(e) { return e.value; });
    var baselineVal = parseFloat(profile.baselineMeasurement);
    if (!isNaN(baselineVal)) {
      values.push(baselineVal);
    }

    var minVal = Math.min.apply(null, values);
    var maxVal = Math.max.apply(null, values);
    var padding = Math.max(0.5, (maxVal - minVal) * 0.2);

    var axisMin = Math.max(0, Math.floor((minVal - padding) * 2) / 2);
    var axisMax = Math.ceil((maxVal + padding) * 2) / 2;
    var range = axisMax - axisMin || 2;

    var left = 55;
    var right = 580;
    var top = 25;
    var bottom = 175;
    var plotWidth = right - left;
    var plotHeight = bottom - top;

    function getX(index) {
      return left + (index / (entries.length - 1)) * plotWidth;
    }

    function getY(val) {
      return bottom - ((val - axisMin) / range) * plotHeight;
    }

    // Grid lines and labels (4 ticks)
    var gridLinesHtml = '';
    var tickCount = 4;
    for (var i = 0; i <= tickCount; i++) {
      var tickVal = axisMin + (i / tickCount) * range;
      var tickY = getY(tickVal);
      gridLinesHtml += `
        <line x1="${left}" y1="${tickY}" x2="${right}" y2="${tickY}" stroke="var(--border)" stroke-dasharray="2,2" stroke-width="1" />
        <text x="${left - 8}" y="${tickY + 4}" font-size="10" fill="var(--text-muted)" text-anchor="end">${tickVal.toFixed(1)} mm</text>
      `;
    }

    // Baseline reference line (User's own baseline, no zone grading)
    var baselineHtml = '';
    if (!isNaN(baselineVal)) {
      var bY = getY(baselineVal);
      baselineHtml = `
        <line x1="${left}" y1="${bY}" x2="${right}" y2="${bY}" stroke="var(--text-muted)" stroke-dasharray="4,4" stroke-width="1.5" />
        <text x="${right}" y="${bY - 5}" font-size="9.5" fill="var(--text-muted)" text-anchor="end">${esc(t('graph.baselineRef', { val: baselineVal.toFixed(1) }))}</text>
      `;
    }

    // Points and polyline
    var pointsData = entries.map(function(entry, idx) {
      return {
        x: getX(idx),
        y: getY(entry.value),
        val: entry.value,
        date: entry.date
      };
    });

    var polylinePoints = pointsData.map(function(p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');

    var pointsHtml = pointsData.map(function(p) {
      return `
        <g class="graph-point">
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="var(--primary-text)" stroke="var(--bg-card)" stroke-width="2">
            <title>${esc(p.date)}: ${p.val.toFixed(1)} mm</title>
          </circle>
          <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="10" font-weight="bold" fill="var(--text-main)" text-anchor="middle">${p.val.toFixed(1)}</text>
          <text x="${p.x.toFixed(1)}" y="${(bottom + 16).toFixed(1)}" font-size="9" fill="var(--text-muted)" text-anchor="middle">${esc(p.date)}</text>
        </g>
      `;
    }).join('');

    return `
      <div class="trend-graph-container">
        <svg class="trend-graph-svg" viewBox="0 0 640 215" role="img" aria-label="${esc(t('graph.title'))}" xmlns="http://www.w3.org/2000/svg">
          <!-- Grid -->
          ${gridLinesHtml}
          <!-- X and Y base axes -->
          <line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="var(--text-muted)" stroke-width="1.5" />
          <line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="var(--text-muted)" stroke-width="1.5" />
          <!-- Baseline reference -->
          ${baselineHtml}
          <!-- Trend polyline -->
          <polyline points="${polylinePoints}" fill="none" stroke="var(--primary-text)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <!-- Data points -->
          ${pointsHtml}
        </svg>
      </div>
    `;
  }

  // ==========================================================================
  // Repeatable Measurement Tracker & Multi-Piercing Profiles (Items 1, 2, 3)
  // ==========================================================================
  function renderMeasurementTracker() {
    var container = document.getElementById('measurement-tracker-container');
    if (!container) return;

    var today = getTodayLocalDate();
    var activeProfile = getActiveProfile();
    var measurements = activeProfile.measurements || [];

    // Profile options dropdown
    var profileOptionsHtml = state.profiles.map(function(p) {
      var isSelected = p.id === activeProfile.id ? 'selected' : '';
      return `<option value="${esc(p.id)}" ${isSelected}>${esc(p.name)}</option>`;
    }).join('');

    // Table rows
    var tableRows = '';
    if (measurements.length === 0) {
      tableRows = `<tr><td colspan="6" class="empty-table-msg">${esc(t('tracker.emptyHistory'))}</td></tr>`;
    } else {
      var baselineVal = parseFloat(activeProfile.baselineMeasurement) || measurements[0].value;
      tableRows = measurements.map(function(entry, index) {
        var deltaHtml = '';
        if (index === 0 && !activeProfile.baselineMeasurement) {
          deltaHtml = `<span class="badge-baseline">${esc(t('tracker.baselineBadge'))}</span>`;
        } else {
          var diff = (baselineVal - entry.value);
          var pct = Math.round((Math.abs(diff) / baselineVal) * 100);
          var diffFormatted = Math.abs(diff).toFixed(1);

          if (entry.method === 'bridge') {
            if (diff > 0.05) {
              deltaHtml = `<span class="delta-alert">${esc(t('tracker.deltaShrunk', { diff: diffFormatted, pct: pct }))}</span>`;
            } else if (diff < -0.05) {
              deltaHtml = `<span class="delta-neutral">${esc(t('tracker.deltaMoreTissue', { diff: diffFormatted }))}</span>`;
            } else {
              deltaHtml = `<span class="delta-stable">${esc(t('tracker.deltaStable'))}</span>`;
            }
          } else {
            var barDiff = (entry.value - baselineVal);
            var barDiffFormatted = Math.abs(barDiff).toFixed(1);
            if (barDiff > 0.05) {
              deltaHtml = `<span class="delta-alert">${esc(t('tracker.deltaGrown', { diff: barDiffFormatted, pct: pct }))}</span>`;
            } else if (barDiff < -0.05) {
              deltaHtml = `<span class="delta-neutral">${esc(t('tracker.deltaLessBar', { diff: barDiffFormatted }))}</span>`;
            } else {
              deltaHtml = `<span class="delta-stable">${esc(t('tracker.deltaStable'))}</span>`;
            }
          }
        }

        var changeLabels = {
          jewellery: t('tracker.change_jewellery'),
          sleep: t('tracker.change_sleep'),
          sport: t('tracker.change_sport'),
          snag: t('tracker.change_snag'),
          routine: t('tracker.change_routine'),
          swelling: t('tracker.change_swelling')
        };

        var factorsList = (entry.factors || []).map(function(fKey) {
          return `<span class="tag-pill">${esc(changeLabels[fKey] || fKey)}</span>`;
        }).join(' ');

        var notesText = entry.notes ? `<div class="entry-notes">${esc(entry.notes)}</div>` : '';
        var methodLabel = entry.method === 'bridge' ? t('tracker.method_bridge') : t('tracker.method_bar');

        return `
          <tr>
            <td data-label="${esc(t('tracker.tableDate'))}"><strong>${esc(entry.date)}</strong></td>
            <td data-label="${esc(t('tracker.tableMethod'))}">${esc(methodLabel)}</td>
            <td data-label="${esc(t('tracker.tableValue'))}"><strong>${esc(entry.value.toFixed(1))} mm</strong></td>
            <td data-label="${esc(t('tracker.tableDelta'))}">${deltaHtml}</td>
            <td data-label="${esc(t('tracker.tableFactors'))}">${factorsList} ${notesText}</td>
            <td data-label="${esc(t('tracker.tableAction'))}">
              <button type="button" class="btn-delete-entry" data-index="${index}">${esc(t('tracker.deleteBtn'))}</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Profile form dialog if open
    var profileFormHtml = '';
    if (state.profileModalMode) {
      var isEdit = state.profileModalMode === 'edit';
      var formTitle = isEdit ? t('profiles.editTitle') : t('profiles.newTitle');
      var nameVal = isEdit ? activeProfile.name : '';
      var dateVal = isEdit ? activeProfile.piercingDate : '';
      var baseVal = isEdit ? activeProfile.baselineMeasurement : '';
      var gaugeVal = isEdit ? activeProfile.gauge : '';
      var matVal = isEdit ? activeProfile.material : '';

      profileFormHtml = `
        <div class="profile-form-dialog" id="profile-form-dialog">
          <h3 class="profile-dialog-title">${esc(formTitle)}</h3>
          <form id="form-manage-profile">
            <div class="form-row-grid">
              <div class="form-field">
                <label for="prof-name" class="field-label">${esc(t('profiles.nameLabel'))}</label>
                <input type="text" id="prof-name" class="field-input" value="${esc(nameVal)}" placeholder="${esc(t('profiles.namePlaceholder'))}" required maxlength="40" />
              </div>
              <div class="form-field">
                <label for="prof-date" class="field-label">${esc(t('profiles.piercingDateLabel'))}</label>
                <input type="date" id="prof-date" class="field-input" value="${esc(dateVal)}" max="${today}" />
              </div>
              <div class="form-field">
                <label for="prof-baseline" class="field-label">${esc(t('profiles.baselineLabel'))}</label>
                <input type="number" id="prof-baseline" class="field-input" step="0.1" min="0.1" max="30.0" value="${esc(baseVal)}" placeholder="8.0" />
              </div>
              <div class="form-field">
                <label for="prof-gauge" class="field-label">${esc(t('profiles.gaugeLabel'))}</label>
                <input type="text" id="prof-gauge" class="field-input" value="${esc(gaugeVal)}" placeholder="${esc(t('profiles.gaugePlaceholder'))}" maxlength="20" />
              </div>
              <div class="form-field full-width">
                <label for="prof-material" class="field-label">${esc(t('profiles.materialLabel'))}</label>
                <input type="text" id="prof-material" class="field-input" value="${esc(matVal)}" placeholder="${esc(t('profiles.materialPlaceholder'))}" maxlength="40" />
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">${esc(t('profiles.btnSave'))}</button>
              <button type="button" id="btn-cancel-profile-form" class="btn btn-secondary">${esc(t('profiles.btnCancel'))}</button>
            </div>
          </form>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">${esc(t('tracker.title'))}</h2>
          <p class="section-sub">${esc(t('tracker.intro'))}</p>
        </div>

        <!-- Multi-Piercing Profile Manager (Item 2) -->
        <div class="profile-manager-wrap">
          <div class="profile-bar">
            <div class="profile-select-group">
              <label for="active-profile-select">${esc(t('profiles.switchLabel'))}:</label>
              <select id="active-profile-select" class="profile-select" aria-label="${esc(t('profiles.switchLabel'))}">
                ${profileOptionsHtml}
              </select>
            </div>
            <div class="profile-actions">
              <button type="button" id="btn-profile-new" class="btn-profile">${esc(t('profiles.btnNew'))}</button>
              <button type="button" id="btn-profile-edit" class="btn-profile">${esc(t('profiles.btnEdit'))}</button>
              ${state.profiles.length > 1 ? `<button type="button" id="btn-profile-delete" class="btn-profile btn-profile-delete">${esc(t('profiles.btnDelete'))}</button>` : ''}
              <button type="button" id="btn-profile-export" class="btn-profile">${esc(t('profiles.btnExportJson'))}</button>
              <button type="button" id="btn-profile-import" class="btn-profile">${esc(t('profiles.btnImportJson'))}</button>
              <input type="file" id="file-import-json" accept=".json" style="display:none;" />
            </div>
          </div>

          <!-- Active Profile Metadata Summary -->
          <div class="profile-meta-pills">
            <span class="meta-pill"><strong>${esc(t('profiles.piercingDateLabel'))}:</strong> ${esc(activeProfile.piercingDate || t('profiles.notSet'))}</span>
            <span class="meta-pill"><strong>${esc(t('profiles.baselineLabel'))}:</strong> ${esc(activeProfile.baselineMeasurement ? activeProfile.baselineMeasurement + ' mm' : t('profiles.notSet'))}</span>
            <span class="meta-pill"><strong>${esc(t('profiles.gaugeLabel'))}:</strong> ${esc(activeProfile.gauge || t('profiles.notSet'))}</span>
            <span class="meta-pill"><strong>${esc(t('profiles.materialLabel'))}:</strong> ${esc(activeProfile.material || t('profiles.notSet'))}</span>
          </div>

          ${profileFormHtml}
        </div>

        <!-- Inline SVG Measurement Trend Graph (Item 3) -->
        <div class="trend-graph-section">
          <div class="trend-graph-header">
            <h3 class="trend-graph-title">${esc(t('graph.title'))}</h3>
            <p class="trend-graph-sub">${esc(t('graph.subtitle'))}</p>
          </div>
          ${renderTrendGraph(activeProfile)}
        </div>

        <!-- Form to add measurement for active profile -->
        <form id="form-add-measurement" class="tracker-form">
          <div class="form-row-grid">
            <div class="form-field">
              <label for="track-method" class="field-label">${esc(t('tracker.methodLabel'))}</label>
              <select id="track-method" class="field-select">
                <option value="bridge">${esc(t('tracker.method_bridge'))}</option>
                <option value="visible">${esc(t('tracker.method_visible'))}</option>
              </select>
            </div>

            <div class="form-field">
              <label for="track-date" class="field-label">${esc(t('tracker.dateLabel'))}</label>
              <input type="date" id="track-date" class="field-input" value="${today}" max="${today}" required />
            </div>

            <div class="form-field">
              <label for="track-value" class="field-label">${esc(t('tracker.valueLabel'))}</label>
              <input type="number" id="track-value" class="field-input" step="0.1" min="0.1" max="30.0" placeholder="${esc(t('tracker.valuePlaceholder'))}" required />
            </div>
          </div>

          <div class="form-field full-width">
            <label class="field-label">${esc(t('tracker.changedLabel'))}</label>
            <div class="checkbox-grid">
              <label class="check-label"><input type="checkbox" name="changed_factor" value="jewellery" /> ${esc(t('tracker.change_jewellery'))}</label>
              <label class="check-label"><input type="checkbox" name="changed_factor" value="sleep" /> ${esc(t('tracker.change_sleep'))}</label>
              <label class="check-label"><input type="checkbox" name="changed_factor" value="sport" /> ${esc(t('tracker.change_sport'))}</label>
              <label class="check-label"><input type="checkbox" name="changed_factor" value="snag" /> ${esc(t('tracker.change_snag'))}</label>
              <label class="check-label"><input type="checkbox" name="changed_factor" value="routine" /> ${esc(t('tracker.change_routine'))}</label>
              <label class="check-label"><input type="checkbox" name="changed_factor" value="swelling" /> ${esc(t('tracker.change_swelling'))}</label>
            </div>
          </div>

          <div class="form-field full-width">
            <label for="track-notes" class="field-label">${esc(t('tracker.notesLabel'))}</label>
            <input type="text" id="track-notes" class="field-input" placeholder="${esc(t('tracker.notesPlaceholder'))}" maxlength="120" />
          </div>

          <div id="tracker-error-msg" class="validation-msg" hidden></div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">${esc(t('tracker.btnAdd'))}</button>
            ${measurements.length > 0 ? `<button type="button" id="btn-clear-history" class="btn btn-secondary">${esc(t('tracker.btnClearAll'))}</button>` : ''}
          </div>
        </form>

        <!-- Measurement Series Table -->
        <div class="table-responsive">
          <table class="tracker-table">
            <thead>
              <tr>
                <th>${esc(t('tracker.tableDate'))}</th>
                <th>${esc(t('tracker.tableMethod'))}</th>
                <th>${esc(t('tracker.tableValue'))}</th>
                <th>${esc(t('tracker.tableDelta'))}</th>
                <th>${esc(t('tracker.tableFactors'))}</th>
                <th>${esc(t('tracker.tableAction'))}</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>

        <p class="tracker-notice">${esc(t('tracker.storageNotice'))}</p>
      </div>
    `;

    // Event Listeners for Profile Manager
    var profileSelect = document.getElementById('active-profile-select');
    if (profileSelect) {
      profileSelect.addEventListener('change', function(e) {
        state.activeProfileId = e.target.value;
        state.profileModalMode = null;
        saveProfiles();
        renderMeasurementTracker();
        renderStudioConsultationSummary();
      });
    }

    var btnNew = document.getElementById('btn-profile-new');
    if (btnNew) {
      btnNew.addEventListener('click', function() {
        state.profileModalMode = 'new';
        renderMeasurementTracker();
      });
    }

    var btnEdit = document.getElementById('btn-profile-edit');
    if (btnEdit) {
      btnEdit.addEventListener('click', function() {
        state.profileModalMode = 'edit';
        renderMeasurementTracker();
      });
    }

    var btnDelete = document.getElementById('btn-profile-delete');
    if (btnDelete) {
      btnDelete.addEventListener('click', function() {
        if (state.profiles.length <= 1) return;
        if (window.confirm(t('profiles.confirmDelete'))) {
          state.profiles = state.profiles.filter(function(p) { return p.id !== state.activeProfileId; });
          state.activeProfileId = state.profiles[0].id;
          state.profileModalMode = null;
          saveProfiles();
          renderMeasurementTracker();
          renderStudioConsultationSummary();
        }
      });
    }

    // Export JSON
    var btnExport = document.getElementById('btn-profile-export');
    if (btnExport) {
      btnExport.addEventListener('click', function() {
        var jsonStr = JSON.stringify(state.profiles, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'piercing-profiles-' + getTodayLocalDate() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Import JSON
    var btnImport = document.getElementById('btn-profile-import');
    var fileInput = document.getElementById('file-import-json');
    if (btnImport && fileInput) {
      btnImport.addEventListener('click', function() {
        fileInput.click();
      });

      fileInput.addEventListener('change', function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(evt) {
          try {
            var imported = JSON.parse(evt.target.result);
            if (Array.isArray(imported) && imported.length > 0 && imported[0].id && imported[0].name) {
              state.profiles = imported;
              state.activeProfileId = imported[0].id;
              state.profileModalMode = null;
              saveProfiles();
              renderMeasurementTracker();
              renderStudioConsultationSummary();
            } else {
              window.alert(t('profiles.importError'));
            }
          } catch (err) {
            window.alert(t('profiles.importError'));
          }
        };
        reader.readAsText(file);
      });
    }

    // Profile Modal Save / Cancel
    var profileForm = document.getElementById('form-manage-profile');
    if (profileForm) {
      profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var nameInput = document.getElementById('prof-name');
        var dateInput = document.getElementById('prof-date');
        var baseInput = document.getElementById('prof-baseline');
        var gaugeInput = document.getElementById('prof-gauge');
        var matInput = document.getElementById('prof-material');

        var nameVal = nameInput.value.trim();
        if (!nameVal) return;

        if (state.profileModalMode === 'new') {
          var newProfile = {
            id: 'profile-' + Date.now(),
            name: nameVal,
            piercingDate: dateInput.value,
            baselineMeasurement: baseInput.value,
            gauge: gaugeInput.value.trim(),
            material: matInput.value.trim(),
            measurements: []
          };
          state.profiles.push(newProfile);
          state.activeProfileId = newProfile.id;
        } else if (state.profileModalMode === 'edit') {
          activeProfile.name = nameVal;
          activeProfile.piercingDate = dateInput.value;
          activeProfile.baselineMeasurement = baseInput.value;
          activeProfile.gauge = gaugeInput.value.trim();
          activeProfile.material = matInput.value.trim();
        }

        state.profileModalMode = null;
        saveProfiles();
        renderMeasurementTracker();
        renderStudioConsultationSummary();
      });

      var btnCancelProfile = document.getElementById('btn-cancel-profile-form');
      if (btnCancelProfile) {
        btnCancelProfile.addEventListener('click', function() {
          state.profileModalMode = null;
          renderMeasurementTracker();
        });
      }
    }

    // Measurement Form Submission
    var form = document.getElementById('form-add-measurement');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var errEl = document.getElementById('tracker-error-msg');
      var valInput = document.getElementById('track-value');
      var dateInput = document.getElementById('track-date');
      var methodInput = document.getElementById('track-method');
      var notesInput = document.getElementById('track-notes');

      var rawVal = valInput.value.trim();
      var rawDate = dateInput.value.trim();

      if (!rawVal) {
        errEl.textContent = t('tracker.validationNumber');
        errEl.hidden = false;
        valInput.focus();
        return;
      }

      var parsedVal = parseFloat(rawVal);
      if (isNaN(parsedVal) || parsedVal < 0.1 || parsedVal > 30.0) {
        errEl.textContent = t('tracker.validationNumber');
        errEl.hidden = false;
        valInput.focus();
        return;
      }

      if (!rawDate) {
        errEl.textContent = t('tracker.validationDate');
        errEl.hidden = false;
        dateInput.focus();
        return;
      }

      errEl.hidden = true;

      var checkedFactors = [];
      form.querySelectorAll('input[name="changed_factor"]:checked').forEach(function(cb) {
        checkedFactors.push(cb.value);
      });

      var newEntry = {
        date: rawDate,
        method: methodInput.value,
        value: parsedVal,
        factors: checkedFactors,
        notes: notesInput.value.trim()
      };

      if (!activeProfile.measurements) {
        activeProfile.measurements = [];
      }
      activeProfile.measurements.push(newEntry);
      activeProfile.measurements.sort(function(a, b) {
        return a.date.localeCompare(b.date);
      });

      // If no baseline was manually entered, default profile baseline to first entry
      if (!activeProfile.baselineMeasurement && activeProfile.measurements.length === 1) {
        activeProfile.baselineMeasurement = String(parsedVal);
      }

      saveProfiles();
      renderMeasurementTracker();
      renderStudioConsultationSummary();
    });

    // Delete single measurement entry
    container.querySelectorAll('.btn-delete-entry').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(idx) && activeProfile.measurements) {
          activeProfile.measurements.splice(idx, 1);
          saveProfiles();
          renderMeasurementTracker();
          renderStudioConsultationSummary();
        }
      });
    });

    // Clear all history
    var clearBtn = document.getElementById('btn-clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        activeProfile.measurements = [];
        saveProfiles();
        renderMeasurementTracker();
        renderStudioConsultationSummary();
      });
    }
  }

  // ==========================================================================
  // Formatted Studio Print & Consultation Summary (Item 1)
  // Dedicated consultation sheet for in-studio client and piercer assessment.
  // ==========================================================================
  function renderStudioConsultationSummary() {
    var container = document.getElementById('studio-consultation-summary');
    if (!container) return;

    var activeProfile = getActiveProfile();
    var measurements = activeProfile.measurements || [];
    var f = state.selectedFactors;

    // Evaluated Factors summary
    var evaluatedFactorsHtml = '';
    if (state.hasAssessed) {
      var raising = [];
      var lowering = [];

      if (f.placement === 'surface') raising.push(t('reason.placement_surface'));
      else if (f.placement === 'navel') raising.push(t('reason.placement_navel'));
      else if (f.placement === 'fold') lowering.push(t('reason.placement_fold'));

      if (f.fit === 'long') raising.push(t('reason.fit_long'));
      else if (f.fit === 'tight') raising.push(t('reason.fit_tight'));
      else if (f.fit === 'downsized') lowering.push(t('reason.fit_downsized'));

      if (f.material === 'mystery') raising.push(t('reason.material_mystery'));
      else if (f.material === 'implant') lowering.push(t('reason.material_implant'));

      if (f.trauma === 'frequent') raising.push(t('reason.trauma_frequent'));
      else if (f.trauma === 'occasional') raising.push(t('reason.trauma_occasional'));
      else if (f.trauma === 'none') lowering.push(t('reason.trauma_none'));

      if (f.aftercare === 'harsh') raising.push(t('reason.aftercare_harsh'));
      else if (f.aftercare === 'inconsistent') raising.push(t('reason.aftercare_inconsistent'));
      else if (f.aftercare === 'saline') lowering.push(t('reason.aftercare_saline'));

      if (f.history === 'scar') raising.push(t('reason.history_scar'));
      else if (f.history === 'slow') raising.push(t('reason.history_slow'));
      else if (f.history === 'healthy') lowering.push(t('reason.history_healthy'));

      var tendencyTitle = raising.length >= 3 ? t('results.tendencyHigher') : (raising.length > lowering.length ? t('results.tendencyModerate') : t('results.tendencyLower'));

      evaluatedFactorsHtml = `
        <div class="summary-block">
          <h4 class="summary-block-title">${esc(t('print.summaryTendencyLabel'))}: ${esc(tendencyTitle)}</h4>
          <div class="summary-data-list">
            ${raising.length > 0 ? `<div><strong>${esc(t('results.raisingTitle'))}:</strong> ${esc(raising.join('; '))}</div>` : ''}
            ${lowering.length > 0 ? `<div><strong>${esc(t('results.loweringTitle'))}:</strong> ${esc(lowering.join('; '))}</div>` : ''}
          </div>
        </div>
      `;
    } else {
      evaluatedFactorsHtml = `
        <div class="summary-block">
          <h4 class="summary-block-title">${esc(t('nav.factors'))}</h4>
          <p class="summary-data-list">${esc(t('print.noFactorsYet'))}</p>
        </div>
      `;
    }

    // Measurement summary table (max 8 most recent entries for clean single page fit)
    var recentMeasurements = measurements.slice(-8);
    var measurementRowsHtml = '';
    if (recentMeasurements.length === 0) {
      measurementRowsHtml = `<tr><td colspan="5" class="empty-table-msg">${esc(t('tracker.emptyHistory'))}</td></tr>`;
    } else {
      var baseVal = parseFloat(activeProfile.baselineMeasurement) || recentMeasurements[0].value;
      measurementRowsHtml = recentMeasurements.map(function(m, i) {
        var diff = (baseVal - m.value);
        var diffStr = (i === 0 && !activeProfile.baselineMeasurement) ? t('tracker.baselineBadge') : (diff > 0.05 ? '-' + diff.toFixed(1) + ' mm' : (diff < -0.05 ? '+' + Math.abs(diff).toFixed(1) + ' mm' : t('tracker.deltaStable')));
        var methodStr = m.method === 'bridge' ? t('tracker.method_bridge') : t('tracker.method_bar');
        return `
          <tr>
            <td>${esc(m.date)}</td>
            <td>${esc(methodStr)}</td>
            <td><strong>${esc(m.value.toFixed(1))} mm</strong></td>
            <td>${esc(diffStr)}</td>
            <td>${esc(m.notes || '-')}</td>
          </tr>
        `;
      }).join('');
    }

    container.innerHTML = `
      <div class="summary-header-row">
        <div class="summary-title-block">
          <h3>${esc(t('print.summaryHeading'))}</h3>
          <p>${esc(t('print.summaryIntro'))}</p>
        </div>
        <button type="button" id="btn-print-summary-action" class="btn btn-primary btn-print">${esc(t('print.btnExportSummary'))}</button>
      </div>

      <div class="summary-grid">
        <!-- Profile details -->
        <div class="summary-block">
          <h4 class="summary-block-title">${esc(t('print.profileBlockTitle'))}</h4>
          <div class="summary-data-list">
            <div><strong>${esc(t('profiles.nameLabel'))}:</strong> ${esc(activeProfile.name)}</div>
            <div><strong>${esc(t('profiles.piercingDateLabel'))}:</strong> ${esc(activeProfile.piercingDate || t('profiles.notSet'))}</div>
            <div><strong>${esc(t('profiles.baselineLabel'))}:</strong> ${esc(activeProfile.baselineMeasurement ? activeProfile.baselineMeasurement + ' mm' : t('profiles.notSet'))}</div>
            <div><strong>${esc(t('profiles.gaugeLabel'))}:</strong> ${esc(activeProfile.gauge || t('profiles.notSet'))}</div>
            <div><strong>${esc(t('profiles.materialLabel'))}:</strong> ${esc(activeProfile.material || t('profiles.notSet'))}</div>
          </div>
        </div>

        <!-- Evaluated clinical factors -->
        ${evaluatedFactorsHtml}
      </div>

      <!-- Logged Measurements -->
      <div class="table-responsive">
        <table class="tracker-table">
          <thead>
            <tr>
              <th>${esc(t('tracker.tableDate'))}</th>
              <th>${esc(t('tracker.tableMethod'))}</th>
              <th>${esc(t('tracker.tableValue'))}</th>
              <th>${esc(t('tracker.tableDelta'))}</th>
              <th>${esc(t('tracker.notesLabel'))}</th>
            </tr>
          </thead>
          <tbody>${measurementRowsHtml}</tbody>
        </table>
      </div>

      <!-- In-Studio Piercer Inspection & Downsize Box -->
      <div class="studio-inspection-box">
        <h4 class="studio-inspection-title">${esc(t('print.piercerSectionTitle'))}</h4>
        <ul class="studio-checklist">
          <li><span>[  ]</span> <strong>${esc(t('print.chkVisual'))}:</strong> ${esc(t('print.chkVisualDetail'))}</li>
          <li><span>[  ]</span> <strong>${esc(t('print.chkVerifiedDepth'))}:</strong> _____________________ mm</li>
          <li><span>[  ]</span> <strong>${esc(t('print.chkDownsizePlan'))}:</strong> _____________________ mm</li>
          <li><span>[  ]</span> <strong>${esc(t('print.chkStudioNotes'))}:</strong> __________________________________________________________________</li>
        </ul>
        <div class="studio-signature-row">
          <div>
            <div class="signature-line"></div>
            <span>${esc(t('print.signatureLabel'))}</span>
          </div>
          <div>
            <div class="signature-line"></div>
            <span>${esc(t('print.dateLabel'))}</span>
          </div>
        </div>
      </div>
    `;

    var btnPrint = document.getElementById('btn-print-summary-action');
    if (btnPrint) {
      btnPrint.addEventListener('click', function() {
        document.documentElement.setAttribute('data-print-mode', 'summary');
        window.print();
      });
    }
  }

  // ==========================================================================
  // Acute Rejection vs. Irritation Decision Tree (Item 4)
  // Hard limits: Every branch ends with 'see a professional/doctor'.
  // No instructions for self-removal. No definitive diagnoses ("consistent with").
  // ==========================================================================
  function renderDecisionTree() {
    var container = document.getElementById('decision-tree-container');
    if (!container) return;

    var contentHtml = '';

    if (state.decisionOutcome) {
      var outcomeMap = {
        migration: {
          cls: 'outcome-migration',
          title: t('decision.outcome_migration_title'),
          text: t('decision.outcome_migration_text')
        },
        infection: {
          cls: 'outcome-infection',
          title: t('decision.outcome_infection_title'),
          text: t('decision.outcome_infection_text')
        },
        mechanical: {
          cls: 'outcome-mechanical',
          title: t('decision.outcome_mechanical_title'),
          text: t('decision.outcome_mechanical_text')
        },
        chemical: {
          cls: 'outcome-chemical',
          title: t('decision.outcome_chemical_title'),
          text: t('decision.outcome_chemical_text')
        },
        normal: {
          cls: 'outcome-normal',
          title: t('decision.outcome_normal_title'),
          text: t('decision.outcome_normal_text')
        }
      };

      var res = outcomeMap[state.decisionOutcome];
      contentHtml = `
        <div class="decision-outcome-box ${res.cls}">
          <h3 class="outcome-heading">${esc(res.title)}</h3>
          <p class="outcome-body">${esc(res.text)}</p>
          <button type="button" id="btn-decision-restart" class="btn-decision-restart">${esc(t('decision.btnRestart'))}</button>
        </div>
      `;
    } else if (state.decisionStep === 1) {
      contentHtml = `
        <div class="decision-step-box">
          <p class="decision-question">${esc(t('decision.step1_q'))}</p>
          <div class="decision-options">
            <button type="button" class="btn-decision-option" data-choice="step1-yes">${esc(t('decision.step1_yes'))}</button>
            <button type="button" class="btn-decision-option" data-choice="step1-no">${esc(t('decision.step1_no'))}</button>
          </div>
        </div>
      `;
    } else if (state.decisionStep === 2) {
      contentHtml = `
        <div class="decision-step-box">
          <p class="decision-question">${esc(t('decision.step2_q'))}</p>
          <div class="decision-options">
            <button type="button" class="btn-decision-option" data-choice="step2-infection">${esc(t('decision.step2_infection'))}</button>
            <button type="button" class="btn-decision-option" data-choice="step2-bump">${esc(t('decision.step2_bump'))}</button>
          </div>
        </div>
      `;
    } else if (state.decisionStep === 3) {
      contentHtml = `
        <div class="decision-step-box">
          <p class="decision-question">${esc(t('decision.step3_q'))}</p>
          <div class="decision-options">
            <button type="button" class="btn-decision-option" data-choice="step3-mechanical">${esc(t('decision.step3_mechanical'))}</button>
            <button type="button" class="btn-decision-option" data-choice="step3-chemical">${esc(t('decision.step3_chemical'))}</button>
            <button type="button" class="btn-decision-option" data-choice="step3-normal">${esc(t('decision.step3_normal'))}</button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="section-card decision-tree-card">
        <div class="section-header">
          <h2 class="section-title">${esc(t('decision.title'))}</h2>
          <p class="section-sub">${esc(t('decision.intro'))}</p>
        </div>
        ${contentHtml}
      </div>
    `;

    // Decision option listeners
    container.querySelectorAll('.btn-decision-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var choice = btn.getAttribute('data-choice');
        if (choice === 'step1-yes') {
          state.decisionOutcome = 'migration';
        } else if (choice === 'step1-no') {
          state.decisionStep = 2;
        } else if (choice === 'step2-infection') {
          state.decisionOutcome = 'infection';
        } else if (choice === 'step2-bump') {
          state.decisionStep = 3;
        } else if (choice === 'step3-mechanical') {
          state.decisionOutcome = 'mechanical';
        } else if (choice === 'step3-chemical') {
          state.decisionOutcome = 'chemical';
        } else if (choice === 'step3-normal') {
          state.decisionOutcome = 'normal';
        }
        renderDecisionTree();
      });
    });

    var restartBtn = document.getElementById('btn-decision-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', function() {
        state.decisionStep = 1;
        state.decisionOutcome = null;
        renderDecisionTree();
      });
    }
  }

  // Render the entire app view and redraw all dynamic strings
  function renderAll() {
    // Document title
    document.title = t('app.title');

    // 1. Language selector setup
    var langSelect = document.getElementById('language-select');
    if (langSelect) {
      langSelect.value = window.PoliI18n.getLanguage();
      langSelect.setAttribute('aria-label', t('app.langSelectAria'));
    }

    // 2. Urgent Embedding callout
    var embeddingContainer = document.getElementById('embedding-container');
    if (embeddingContainer) {
      embeddingContainer.innerHTML = `
        <div class="urgent-card">
          <div class="urgent-badge">${esc(t('embedding.tag'))}</div>
          <h2 class="urgent-title">${esc(t('embedding.title'))}</h2>
          <p class="urgent-desc">${esc(t('embedding.desc'))}</p>
          <ul class="urgent-list">
            <li>${esc(t('embedding.sign1'))}</li>
            <li>${esc(t('embedding.sign2'))}</li>
            <li>${esc(t('embedding.sign3'))}</li>
          </ul>
          <div class="urgent-cta">
            <strong>${esc(t('embedding.action'))}</strong>
          </div>
        </div>
      `;
    }

    // 3. Static translated headers / copy
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });

    // 4. Render components
    renderFactorsForm();
    if (state.hasAssessed) {
      renderAssessmentResults();
    }
    renderCaliperGuidance();
    renderMeasurementTracker();
    renderStudioConsultationSummary();
    renderSignsSection();
    renderDecisionTree();
    renderSurfaceExplanation();
    renderPlacementGuidance();
    renderPiercerActions();

    // 5. After it rejects (Requirement G)
    var rejectionContainer = document.getElementById('rejection-scar-container');
    if (rejectionContainer) {
      rejectionContainer.innerHTML = `
        <div class="scar-note-card">
          <h3 class="scar-note-title">${esc(t('rejection.title'))}</h3>
          <p>${esc(t('rejection.text'))} <a href="https://poliinternational.com/keloid-raised-scar-guide/" target="_top" class="scar-link">${esc(t('rejection.link'))} &rarr;</a></p>
        </div>
      `;
    }
  }

  // Initialize application
  function init() {
    loadProfiles();
    renderAll();

    // Language selector listener (Rule 6 & Rule 7: redraws content preserving inputs)
    var langSelect = document.getElementById('language-select');
    if (langSelect) {
      langSelect.addEventListener('change', function(e) {
        var selectedLang = e.target.value;
        try {
          localStorage.setItem('poli_tools_language', selectedLang);
        } catch (err) {}
        window.PoliI18n.setLanguage(selectedLang);
        renderAll();
        window.dispatchEvent(new CustomEvent('poli-language-changed', { detail: { lang: selectedLang } }));
      });
    }

    // Print button handler (F. The signs, printable)
    var printBtn = document.getElementById('btn-print-signs');
    if (printBtn) {
      printBtn.addEventListener('click', function() {
        document.documentElement.setAttribute('data-print-mode', 'signs');
        window.print();
      });
    }

    // Header Print Studio Summary button handler (Item 1)
    var headerPrintSummaryBtn = document.getElementById('btn-header-print-summary');
    if (headerPrintSummaryBtn) {
      headerPrintSummaryBtn.addEventListener('click', function() {
        document.documentElement.setAttribute('data-print-mode', 'summary');
        window.print();
      });
    }

    // Reset print mode after print dialog closes
    window.addEventListener('afterprint', function() {
      document.documentElement.removeAttribute('data-print-mode');
    });

    // Theme handshake listener (Ban 18 & website handshake)
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'poli-theme') {
        document.documentElement.setAttribute('data-theme', e.data.light ? 'light' : 'dark');
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
