# Piercing Migration & Rejection Risk Calculator - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Schemas](#data-schemas)
3. [Calculation / Logic Algorithms](#calculation--logic-algorithms)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Customization](#customization)
7. [Performance](#performance)
8. [Browser Compatibility](#browser-compatibility)
9. [Security](#security)
10. [Version History](#version-history)
11. [Support / Contact](#support--contact)

---

## Architecture Overview

### Technology Stack

- **HTML5**, Semantic markup with meta tags for viewport and description
- **CSS3**, External stylesheet (`/tools/piercing-migration-risk/css/style.css`)
- **Vanilla JavaScript (ES6)**, No frameworks, libraries, or dependencies
- **No backend**, All logic executes client-side with no server requests

### File Structure

```
/tools/piercing-migration-risk/
├── index.html          # Main HTML document (entry point)
├── css/
│   └── style.css       # Styling (external)
└── js/
    └── app.js          # Application logic (form building, calculation, rendering)
```

### Component / Logic Breakdown

| Component | File | Description |
|-----------|------|-------------|
| HTML shell | `index.html` | Page structure, meta tags, iframe detection, disclaimer |
| Form builder | `app.js` | Dynamically generates 7 factor question blocks from `FACTORS` array |
| Calculation engine | `app.js` | `calculate()` function processes user input and computes weighted score |
| Risk tier classifier | `app.js` | `getTier()` maps numeric scores to risk categories |
| Result renderer | `app.js` | `buildResult()` generates HTML output with risk level, advice, and warning signs |
| Theme detection | `index.html` | Inline script detects iframe embedding and listens for theme messages |

---

## Data Schemas

### `FACTORS` Array (Constant)

The core data structure defining all 7 risk factors. Each factor object has:

```javascript
{
  id: 'placement',          // String - unique identifier, used as radio input name
  label: 'Piercing placement', // String - display label for the question
  weight: 3,                // Number - multiplier applied to selected option's score
  options: [                // Array of option objects
    {
      val: 'low',           // String - option value (stored in radio input)
      label: 'Cartilage / lobe (low surface stress)', // String - display text
      score: 1              // Number - base score for this option
    }
  ]
}
```

#### Complete Factor Definitions

| id | label | weight | Options (val, score) |
|----|-------|--------|----------------------|
| `placement` | Piercing placement | 3 | `low`=1, `mid`=2, `high`=4 |
| `material` | Jewellery material | 3 | `best`=1, `good`=2, `risky`=3, `bad`=5 |
| `size` | Jewellery size for placement | 2 | `correct`=1, `slightly`=2, `too_short`=4 |
| `aftercare` | Aftercare routine | 2 | `saline`=1, `occasional`=2, `harsh`=4 |
| `trauma` | Physical trauma / snagging | 2 | `none`=1, `minor`=2, `frequent`=4 |
| `skin` | Skin type / healing history | 2 | `good`=1, `slow`=2, `keloid`=4 |
| `duration` | How long since piercing | 1 | `fresh`=2, `mid`=1, `healed`=1, `worry`=4 |

### Risk Tier Schema

Returned by `getTier(score)`:

```javascript
{
  tier: 'Low',       // String - risk level name
  cls: 'tier-low',   // String - CSS class for styling
  pct: 20            // Number - percentage for progress bar width
}
```

### Advice Schema

Defined inside `buildResult()` as a lookup object:

```javascript
{
  'Low': {
    color: '#38a169',   // Hex color string
    icon: '✅',          // Emoji string
    msg: '...'           // String - contextual advice message
  },
  'Moderate': { /* ... */ },
  'High': { /* ... */ },
  'Very High': { /* ... */ }
}
```

---

## Calculation / Logic Algorithms

### `calculate()` Function

**Purpose:** Main event handler triggered by the "Calculate Risk Score" button click.

**Step-by-step logic:**

1. **Initialize** `score = 0` and `missing = []` (empty array)
2. **Iterate** over each factor in `FACTORS` array
3. **For each factor:**
   - Query the DOM for the selected radio input: `formEl.querySelector(`input[name="${f.id}"]:checked`)`
   - If no selection found, push `f.label` to `missing` array and skip
   - If selection found, find matching option object via `f.options.find(o => o.val === sel.value)`
   - Add `(option.score * factor.weight)` to total `score`
4. **Validation check:** If `missing.length > 0`, render error message listing missing factors and exit
5. **Classify risk:** Call `getTier(score)` to get tier object
6. **Render results:** Call `buildResult(score, tier, cls, pct)` and set `results.innerHTML`
7. **Scroll:** Call `results.scrollIntoView({ behavior: 'smooth', block: 'nearest' })`

### `getTier(score)` Function

**Purpose:** Maps a numeric score to a risk tier with CSS class and progress bar percentage.

**Logic:**

| Score Range | Tier | CSS Class | Progress % |
|-------------|------|-----------|------------|
| ≤ 14 | Low | `tier-low` | 20 |
| 15-22 | Moderate | `tier-moderate` | 50 |
| 23-32 | High | `tier-high` | 78 |
| ≥ 33 | Very High | `tier-vhigh` | 96 |

### `buildResult(score, tier, cls, pct)` Function

**Purpose:** Generates complete HTML string for the results section.

**Logic:**
1. Looks up advice object from tier name
2. Constructs HTML string containing:
   - Result header with tier icon, label, and numeric score
   - Progress bar with percentage width
   - Contextual advice message
   - Warning signs checklist (static HTML list)
   - Material recommendation with link to BioFlex® product page

### Score Calculation Formula

```
Total Score = Σ (selected_option_score × factor_weight) for all 7 factors
```

**Minimum possible score:** 1×3 + 1×3 + 1×2 + 1×2 + 1×2 + 1×2 + 1×1 = 15
**Maximum possible score:** 4×3 + 5×3 + 4×2 + 4×2 + 4×2 + 4×2 + 4×1 = 57

---

## API Reference

### Public Functions

#### `calculate()`
- **Signature:** `function calculate()`
- **Parameters:** None (reads DOM state)
- **Returns:** `undefined` (side-effect: updates `results.innerHTML`)
- **Behavior:** Validates all 7 radio groups are selected, computes weighted score, renders result or error

#### `getTier(score)`
- **Signature:** `function getTier(score)`
- **Parameters:**
  - `score` (Number) - Weighted risk score
- **Returns:** Object `{ tier: String, cls: String, pct: Number }`

#### `buildResult(score, tier, cls, pct)`
- **Signature:** `function buildResult(score, tier, cls, pct)`
- **Parameters:**
  - `score` (Number) - Weighted risk score
  - `tier` (String) - Risk tier name
  - `cls` (String) - CSS class for styling
  - `pct` (Number) - Progress bar percentage
- **Returns:** String (HTML markup)

#### `escHtml(s)`
- **Signature:** `function escHtml(s)`
- **Parameters:**
  - `s` (String) - Untrusted string to escape
- **Returns:** String with HTML entities escaped (`&`, `<`, `>`, `"`)

### Event Handlers

- **`calcBtn.addEventListener('click', calculate)`**, Button click triggers risk calculation

### DOM References

- `formEl` = `document.getElementById('risk-form')`, Container for dynamically generated form
- `calcBtn` = `document.getElementById('calc-btn')`, Calculate button
- `results` = `document.getElementById('results')`, Container for result output

---

## Integration Guide

### Standalone Embedding

The tool is a self-contained static HTML page. Embed via iframe:

```html
<iframe
  src="https://poliinternational.com/tools/piercing-migration-risk/"
  width="100%"
  height="800"
  frameborder="0"
  allowtransparency="true"
  title="Piercing Migration & Rejection Risk Calculator"
></iframe>
```

### Theme Support

When embedded in an iframe, the tool automatically detects iframe context and enables dark mode by default. The parent page can communicate theme preference:

```javascript
// Send theme from parent to iframe
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage({
  type: 'poli-theme',
  light: true   // false for dark mode
}, '*');
```

### Dependencies

- **Zero external dependencies**, No jQuery, React, or third-party libraries
- **No API calls**, All logic runs client-side
- **No cookies or localStorage**, Stateless operation

---

## Customization

### Modifying Risk Factors

Edit the `FACTORS` array in `app.js`:

```javascript
// Add a new factor
{
  id: 'new_factor',
  label: 'Your custom factor',
  weight: 2,
  options: [
    { val: 'option1', label: 'Option 1 description', score: 1 },
    { val: 'option2', label: 'Option 2 description', score: 3 }
  ]
}
```

### Adjusting Risk Tiers

Modify the `getTier()` function thresholds:

```javascript
function getTier(score) {
  if (score <= 10)  return { tier: 'Low', cls: 'tier-low', pct: 15 };
  // Adjust thresholds and percentages as needed
}
```

### Styling

Override CSS classes in `style.css`:

| Class | Purpose |
|-------|---------|
| `.tier-low` | Low risk styling (green) |
| `.tier-moderate` | Moderate risk styling (yellow) |
| `.tier-high` | High risk styling (orange) |
| `.tier-vhigh` | Very high risk styling (red) |
| `.result-card` | Results container |
| `.factor-block` | Individual question block |

---

## Performance

- **Bundle size:** ~4KB total (HTML + JS, excluding CSS)
- **No network requests** after initial page load
- **DOM manipulation:** Minimal, form built once on load, results rendered on button click
- **Memory usage:** Negligible, no persistent state or complex data structures
- **Render time:** Sub-millisecond calculation, no animations or heavy DOM updates

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 49+ | Full |
| Firefox 45+ | Full |
| Safari 10+ | Full |
| Edge 14+ | Full |
| IE 11 | Partial (no `scrollIntoView` smooth behavior) |
| Mobile browsers | Full (responsive design via viewport meta tag) |

**Features used:**
- `querySelector` / `querySelectorAll` (IE9+)
- `addEventListener` (IE9+)
- `Array.find()` (IE polyfill may be needed for IE11)
- `scrollIntoView` with options (Chrome 61+, Firefox 36+, Safari 15.4+)
- Template literals (ES6, not supported in IE11)

---

## Security

### XSS Prevention

The `escHtml()` function sanitizes all user-facing text before DOM insertion:

```javascript
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

**Applied to:**
- Factor labels and option text
- Missing field names in error messages
- All result text content

### Input Handling

- **No user text input fields**, All inputs are radio buttons with predefined values
- **No form submission**, Data never leaves the browser
- **No cookies or localStorage**, No persistent data storage

### Iframe Security

- `robots` meta tag set to `noindex, nofollow` to prevent search indexing of iframe content
- Theme communication via `postMessage` with type-checking (`e.data.type === 'poli-theme'`)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial release | 7-factor risk assessment with weighted scoring, risk tiers, and contextual advice |

---

## Support / Contact

For technical issues, feature requests, or integration questions:

- **Email:** support@poliinternational.com
- **Website:** https://poliinternational.com
- **Tool URL:** https://poliinternational.com/tools/piercing-migration-risk/
