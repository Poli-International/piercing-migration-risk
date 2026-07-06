'use strict';

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Risk factor definitions: id, label, weight, options [{val, label, score}]
const FACTORS = [
  {
    id: 'placement',
    label: 'Piercing placement',
    weight: 3,
    options: [
      { val: 'low',  label: 'Cartilage / lobe (low surface stress)',    score: 1 },
      { val: 'mid',  label: 'Navel / nostril (moderate surface stress)', score: 2 },
      { val: 'high', label: 'Eyebrow / surface / microdermal',           score: 4 },
    ],
  },
  {
    id: 'material',
    label: 'Jewellery material',
    weight: 3,
    options: [
      { val: 'best',  label: 'BioFlex® / ASTM F136 titanium',            score: 1 },
      { val: 'good',  label: 'Implant-grade 316LVM steel / niobium',     score: 2 },
      { val: 'risky', label: 'Surgical steel (non-implant) / acrylic',   score: 3 },
      { val: 'bad',   label: 'Unknown alloy / plated / cheap metal',     score: 5 },
    ],
  },
  {
    id: 'size',
    label: 'Jewellery size for placement',
    weight: 2,
    options: [
      { val: 'correct',   label: 'Correctly sized by a professional',  score: 1 },
      { val: 'slightly',  label: 'Slightly short / tight',             score: 2 },
      { val: 'too_short', label: 'Clearly too short / embedded risk',  score: 4 },
    ],
  },
  {
    id: 'aftercare',
    label: 'Aftercare routine',
    weight: 2,
    options: [
      { val: 'saline',    label: 'Saline spray only, twice daily',      score: 1 },
      { val: 'occasional', label: 'Inconsistent or using mild soap',    score: 2 },
      { val: 'harsh',     label: 'Alcohol / Dettol / rotating jewellery', score: 4 },
    ],
  },
  {
    id: 'trauma',
    label: 'Physical trauma / snagging',
    weight: 2,
    options: [
      { val: 'none',     label: 'No trauma, well-protected placement', score: 1 },
      { val: 'minor',    label: 'Occasional minor snags / pressure',   score: 2 },
      { val: 'frequent', label: 'Frequent trauma (clothing, sleep)',    score: 4 },
    ],
  },
  {
    id: 'skin',
    label: 'Skin type / healing history',
    weight: 2,
    options: [
      { val: 'good',  label: 'Heals quickly, no keloid history',         score: 1 },
      { val: 'slow',  label: 'Slow healer, occasional irritation',       score: 2 },
      { val: 'keloid', label: 'Keloid-prone or prior rejection history', score: 4 },
    ],
  },
  {
    id: 'duration',
    label: 'How long since piercing',
    weight: 1,
    options: [
      { val: 'fresh',  label: 'Less than 3 months (within initial healing)', score: 2 },
      { val: 'mid',    label: '3–12 months (mid-healing)',                    score: 1 },
      { val: 'healed', label: 'Over 12 months (fully healed)',                score: 1 },
      { val: 'worry',  label: 'Less than 3 months — showing warning signs',   score: 4 },
    ],
  },
];

// Score → risk tier
function getTier(score) {
  if (score <= 14)  return { tier: 'Low',       cls: 'tier-low',       pct: 20 };
  if (score <= 22)  return { tier: 'Moderate',  cls: 'tier-moderate',  pct: 50 };
  if (score <= 32)  return { tier: 'High',      cls: 'tier-high',      pct: 78 };
  return               { tier: 'Very High', cls: 'tier-vhigh',     pct: 96 };
}

const formEl  = document.getElementById('risk-form');
const calcBtn = document.getElementById('calc-btn');
const results = document.getElementById('results');

// Build form
FACTORS.forEach(f => {
  const block = document.createElement('div');
  block.className = 'factor-block';
  block.innerHTML = `<div class="factor-label">${escHtml(f.label)}</div>
    <div class="factor-options" id="opts-${escHtml(f.id)}">
      ${f.options.map(o => `
        <label class="opt-label">
          <input type="radio" name="${escHtml(f.id)}" value="${escHtml(o.val)}">
          <span class="opt-text">${escHtml(o.label)}</span>
        </label>`).join('')}
    </div>`;
  formEl.appendChild(block);
});

calcBtn.addEventListener('click', calculate);

function calculate() {
  let score = 0;
  let missing = [];

  FACTORS.forEach(f => {
    const sel = formEl.querySelector(`input[name="${f.id}"]:checked`);
    if (!sel) { missing.push(f.label); return; }
    const opt = f.options.find(o => o.val === sel.value);
    score += (opt ? opt.score : 0) * f.weight;
  });

  if (missing.length > 0) {
    results.innerHTML = `<div class="err-card">Please answer all questions before calculating.<br><small>Missing: ${escHtml(missing.join(', '))}</small></div>`;
    return;
  }

  const { tier, cls, pct } = getTier(score);
  results.innerHTML = buildResult(score, tier, cls, pct);
  results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function buildResult(score, tier, cls, pct) {
  const advice = {
    'Low':       { color: '#38a169', icon: '✅', msg: 'Your combination of factors shows low migration and rejection risk. Continue good aftercare and avoid unnecessary trauma to the area. Monitor for any changes — early signs include consistent tenderness, thinning skin above the jewellery, or visible movement of the entry/exit holes.' },
    'Moderate':  { color: '#d4a847', icon: '⚠️', msg: 'Some risk factors are present. Review your jewellery material, sizing, and aftercare routine. Consider switching to BioFlex® or implant-grade titanium if you have not already. Have a professional piercer assess the current placement.' },
    'High':      { color: '#e07b39', icon: '🔴', msg: 'Multiple high-risk factors are present. This piercing is at significant risk of migrating or being rejected. Consult a professional piercer urgently — they may recommend a jewellery change, downsizing, or in some cases, retiring the piercing before scarring worsens.' },
    'Very High': { color: '#e05252', icon: '🚨', msg: 'Critical risk level. The combination of factors you have described strongly indicates active migration or imminent rejection. See a professional piercer as soon as possible. Continuing with current conditions may result in permanent scarring. Do not attempt to self-treat.' },
  };
  const a = advice[tier];

  return `
    <div class="result-card">
      <div class="result-header ${escHtml(cls)}">
        <span class="tier-icon">${a.icon}</span>
        <div>
          <div class="tier-label">${escHtml(tier)} Risk</div>
          <div class="tier-sub">Weighted risk score: ${score}</div>
        </div>
      </div>

      <div class="risk-bar-wrap">
        <div class="risk-bar">
          <div class="risk-bar-fill ${escHtml(cls)}" style="width: ${pct}%"></div>
        </div>
        <div class="risk-scale">
          <span>Low</span><span>Moderate</span><span>High</span><span>Very High</span>
        </div>
      </div>

      <div class="result-msg">
        ${escHtml(a.msg)}
      </div>

      <div class="result-signs">
        <strong>Warning signs to watch for:</strong>
        <ul>
          <li>Skin visibly thinning over the jewellery bar</li>
          <li>Entry or exit holes appearing to move closer to the surface</li>
          <li>Persistent redness or raised scar tissue (not just post-stretch irritation)</li>
          <li>Jewellery feeling like it sits shallower than when first pierced</li>
        </ul>
      </div>

      <div class="result-material">
        The single most controllable risk factor is jewellery material.
        <a href="https://poliinternational.com/bioflex/" target="_blank" rel="noopener noreferrer">BioFlex® polymer</a>
        is the most biocompatible flexible option — its flexibility reduces the micro-trauma that drives rejection in surface and bending placements.
      </div>
    </div>`;
}
