# Piercing Migration & Rejection Risk Tool: Technical Documentation

## Architecture Overview

This tool is a pure client-side educational and clinical tracking application published by Poli International. It assesses anatomical, jewelry, and mechanical risk factors associated with piercing migration and rejection, provides illustrated visual warning signs, and records repeatable millimeter measurements over time.

### Technology Stack

- **Client runtime**: Vanilla JavaScript (ES6) and HTML5 semantic elements
- **State management & React component**: TypeScript/React component in \`src/App.tsx\` for modular factor state management and validation
- **Styling**: Modular CSS custom properties in \`css/style.css\`, accessibility stylesheet in \`css/a11y.css\`, and high-contrast print stylesheet in \`css/print.css\`
- **Internationalization**: Centralized translation dictionary in \`js/i18n.js\` supporting seven languages (EN, ES, FR, DE, IT, PT, NL)
- **Zero external CDN dependencies**: No remote fonts, no remote analytics, no remote script or link tags; CSP \`script-src 'self'\` compatible

## File Organization

\`\`\`
/
├── index.html                  # Main application markup
├── js/
│   ├── app.js                  # Core application logic, event listeners, and SVG rendering
│   └── i18n.js                 # Centralized translate(key) engine and 7-language dictionary
├── css/
│   ├── style.css               # Main visual stylesheet using CSS custom properties
│   ├── a11y.css                # High-contrast focus, reduced-motion, and accessibility rules
│   └── print.css               # Clean print styles for studio evidence sheets
├── src/
│   ├── App.tsx                 # Factor assessment state machine and validation logic
│   ├── main.tsx                # React entry point
│   └── index.css               # Entry stylesheet
└── docs/
    ├── USER-GUIDE.md           # English user and studio guide
    ├── USER-GUIDE-fr.md        # French translation
    ├── USER-GUIDE-de.md        # German translation
    ├── USER-GUIDE-it.md        # Italian translation
    ├── USER-GUIDE-es.md        # Spanish translation
    ├── USER-GUIDE-nl.md        # Dutch translation
    ├── USER-GUIDE-pt.md        # Portuguese translation
    └── TECHNICAL-DOCS.md       # Technical specification
\`\`\`

## Data Model & Local Persistence

The application maintains zero backend or database services. All persistent records reside exclusively in the client browser's \`localStorage\`.

### LocalStorage Keys

1. \`poli_migration_measurements\`: JSON array of measurement log entries:
   \`\`\`json
   [
     {
       "date": "2026-09-20",
       "method": "bridge",
       "value": 8.5,
       "factors": ["jewellery", "snag"],
       "notes": "Downsized post installed by piercer"
     }
   ]
   \`\`\`
2. \`poli_tools_language\`: Active language code (\`en\`, \`es\`, \`fr\`, \`de\`, \`it\`, \`pt\`, \`nl\`).
3. \`poli_theme\`: Active theme preference (\`light\` or \`dark\`).

### Factor Assessment Model

The assessment evaluates 6 distinct mechanical and anatomical factors:
- **Placement & Tissue Architecture**: Natural tissue fold vs curved surface vs flat surface / single-point anchor
- **Jewellery Length & Fit**: Properly downsized post vs excessively long post vs tight/pressing post
- **Jewellery Material & Biocompatibility**: Certified implant-grade (ASTM F-136, BioFlex® body jewelry medical PP-R copolymer, ASTM F-138) vs mystery alloy/plated metal
- **Friction, Snagging & Pressure**: Protected vs occasional snags vs frequent friction/sleeping pressure
- **Aftercare & Handling Routine**: Sterile 0.9% saline / LITHA vs inconsistent care vs harsh chemical agents
- **Healing History & Tissue Condition**: Healthy past healing vs slow healing vs prior rejection/prominent scarring

Rather than computing an artificial numeric score or percentage, the evaluation categorizes inputs into protective factors and risk-raising factors, deriving an overall qualitative tendency (Lower Likelihood of Migration, Moderate / Mixed Risk, Higher Likelihood of Migration / Rejection) paired with actionable changes.

## Security & Privacy

- **Content-Security-Policy**: Self-contained relative assets with zero external hosts.
- **Client-Side Privacy**: No user measurement, date, or note is ever transmitted over a network or stored on remote infrastructure.
