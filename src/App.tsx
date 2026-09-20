/**
 * @license
 * Poli International: Piercing Migration & Rejection Risk Tool
 * Core state management for piercing factor assessment.
 */

import React, { useState, useEffect, useId } from 'react';

export type PlacementOption = '' | 'fold' | 'navel' | 'surface';
export type FitOption = '' | 'downsized' | 'long' | 'tight';
export type MaterialOption = '' | 'implant' | 'mystery';
export type FrictionOption = '' | 'none' | 'occasional' | 'frequent';
export type AftercareOption = '' | 'saline' | 'inconsistent' | 'harsh';
export type HistoryOption = '' | 'healthy' | 'slow' | 'scar';

export interface PiercingFactors {
  placement: PlacementOption;
  fit: FitOption;
  material: MaterialOption;
  friction: FrictionOption;
  aftercare: AftercareOption;
  history: HistoryOption;
}

export type FactorKey = keyof PiercingFactors;

export type FactorValidationErrors = Partial<Record<FactorKey, string>>;

export interface EvaluatedFactor {
  factor: FactorKey;
  label: string;
  detail: string;
}

export interface FactorAssessmentResult {
  overallTendency: 'lower' | 'moderate' | 'higher';
  tendencyTitle: string;
  tendencyDescription: string;
  raisingFactors: EvaluatedFactor[];
  protectiveFactors: EvaluatedFactor[];
  actionableSteps: string[];
}

export function tr(key: string, fallback: string): string {
  if (typeof window !== 'undefined' && typeof (window as any).translate === 'function') {
    const val = (window as any).translate(key);
    if (val && val !== key) {
      return val;
    }
  }
  return fallback;
}

const VALID_OPTIONS: Record<FactorKey, readonly string[]> = {
  placement: ['fold', 'navel', 'surface'],
  fit: ['downsized', 'long', 'tight'],
  material: ['implant', 'mystery'],
  friction: ['none', 'occasional', 'frequent'],
  aftercare: ['saline', 'inconsistent', 'harsh'],
  history: ['healthy', 'slow', 'scar']
};

export const INITIAL_FACTORS: PiercingFactors = {
  placement: '',
  fit: '',
  material: '',
  friction: '',
  aftercare: '',
  history: ''
};

export function getFactorLabel(key: FactorKey): string {
  switch (key) {
    case 'placement':
      return tr('factors.placement.label', '1. Piercing Placement & Tissue Architecture');
    case 'fit':
      return tr('factors.fit.label', '2. Jewellery Length & Fit');
    case 'material':
      return tr('factors.material.label', '3. Jewellery Material & Biocompatibility');
    case 'friction':
      return tr('factors.trauma.label', '4. Friction, Snagging & Pressure');
    case 'aftercare':
      return tr('factors.aftercare.label', '5. Aftercare & Handling Routine');
    case 'history':
      return tr('factors.history.label', '6. Healing History & Tissue Condition');
  }
}

export function validateSingleFactor(key: FactorKey, value: string): string | null {
  if (!value) {
    return tr('factors.validationError', `Please select an option for ${getFactorLabel(key)}.`);
  }
  const valid = VALID_OPTIONS[key];
  if (!valid.includes(value)) {
    return `Invalid option selected for ${getFactorLabel(key)}.`;
  }
  return null;
}

export function validateAllFactors(factors: PiercingFactors): FactorValidationErrors {
  const errors: FactorValidationErrors = {};
  (Object.keys(INITIAL_FACTORS) as FactorKey[]).forEach((key) => {
    const err = validateSingleFactor(key, factors[key]);
    if (err) {
      errors[key] = err;
    }
  });
  return errors;
}

export function evaluateFactors(factors: PiercingFactors): FactorAssessmentResult {
  const raisingFactors: EvaluatedFactor[] = [];
  const protectiveFactors: EvaluatedFactor[] = [];
  const actionableSteps: string[] = [];

  // 1. Placement
  if (factors.placement === 'surface') {
    raisingFactors.push({
      factor: 'placement',
      label: getFactorLabel('placement'),
      detail: tr('reason.placement_surface', 'Flat surface anatomy under continuous lateral skin tension without a protective tissue fold.')
    });
  } else if (factors.placement === 'navel') {
    raisingFactors.push({
      factor: 'placement',
      label: getFactorLabel('placement'),
      detail: tr('reason.placement_navel', 'Curved torso/facial anatomy subject to frequent flexion and garment friction.')
    });
  } else if (factors.placement === 'fold') {
    protectiveFactors.push({
      factor: 'placement',
      label: getFactorLabel('placement'),
      detail: tr('reason.placement_fold', 'Natural tissue fold with balanced opposing perpendicular tension holding the post.')
    });
  }

  // 2. Fit
  if (factors.fit === 'long') {
    raisingFactors.push({
      factor: 'fit',
      label: getFactorLabel('fit'),
      detail: tr('reason.fit_long', 'Excessive post length creating mechanical leverage and snag hazards against the fistula.')
    });
    actionableSteps.push(tr('change.fit_advice', 'Book a consultation with your piercer to downsize to a shorter, flush-fitting post.'));
  } else if (factors.fit === 'tight') {
    raisingFactors.push({
      factor: 'fit',
      label: getFactorLabel('fit'),
      detail: tr('reason.fit_tight', 'Constricting post indenting tissue and impairing normal fluid drainage.')
    });
    actionableSteps.push(tr('change.fit_advice', 'Visit a professional piercer immediately to install a post with adequate clearance.'));
  } else if (factors.fit === 'downsized') {
    protectiveFactors.push({
      factor: 'fit',
      label: getFactorLabel('fit'),
      detail: tr('reason.fit_downsized', 'Appropriately downsized post minimizing leverage and snags.')
    });
  }

  // 3. Material
  if (factors.material === 'mystery') {
    raisingFactors.push({
      factor: 'material',
      label: getFactorLabel('material'),
      detail: tr('reason.material_mystery', 'Mystery alloy or plated metal triggering immune-mediated contact irritation.')
    });
    actionableSteps.push(tr('change.material_advice', 'Replace mystery alloys with certified implant materials: ASTM F-136 titanium or BioFlex® body jewelry medical PP-R copolymer.'));
  } else if (factors.material === 'implant') {
    protectiveFactors.push({
      factor: 'material',
      label: getFactorLabel('material'),
      detail: tr('reason.material_implant', 'Certified biocompatible material (ASTM F-136 titanium, BioFlex® body jewelry, ASTM F-138 implant steel, niobium).')
    });
  }

  // 4. Friction / Trauma
  if (factors.friction === 'frequent') {
    raisingFactors.push({
      factor: 'friction',
      label: getFactorLabel('friction'),
      detail: tr('reason.trauma_frequent', 'Continuous sleeping pressure or repetitive garment friction tilting the piercing angle.')
    });
    actionableSteps.push(tr('change.trauma_advice', 'Eliminate direct pressure: use an ear pillow or avoid high-waisted waistbands across the site.'));
  } else if (factors.friction === 'occasional') {
    raisingFactors.push({
      factor: 'friction',
      label: getFactorLabel('friction'),
      detail: tr('reason.trauma_occasional', 'Incidental snagging creating minor lateral disturbance to the channel.')
    });
  } else if (factors.friction === 'none') {
    protectiveFactors.push({
      factor: 'friction',
      label: getFactorLabel('friction'),
      detail: tr('reason.trauma_none', 'Channel well-shielded from pressure, direct sleeping, and athletic trauma.')
    });
  }

  // 5. Aftercare
  if (factors.aftercare === 'harsh') {
    raisingFactors.push({
      factor: 'aftercare',
      label: getFactorLabel('aftercare'),
      detail: tr('reason.aftercare_harsh', 'Caustic agents (alcohol, tea tree oil, hydrogen peroxide) destroying delicate healing epithelial cells.')
    });
    actionableSteps.push(tr('change.aftercare_advice', 'Discontinue all harsh chemicals immediately. Switch strictly to sterile 0.9% saline spray twice daily.'));
  } else if (factors.aftercare === 'inconsistent') {
    raisingFactors.push({
      factor: 'aftercare',
      label: getFactorLabel('aftercare'),
      detail: tr('reason.aftercare_inconsistent', 'Irregular cleansing allowing crust buildup or handling with unwashed hands.')
    });
    actionableSteps.push(tr('change.aftercare_advice', 'Maintain consistent twice-daily sterile saline mists and practice LITHA (Leave It The Hell Alone).'));
  } else if (factors.aftercare === 'saline') {
    protectiveFactors.push({
      factor: 'aftercare',
      label: getFactorLabel('aftercare'),
      detail: tr('reason.aftercare_saline', 'Non-irritating saline protocol supporting healthy epithelialization.')
    });
  }

  // 6. Healing History
  if (factors.history === 'scar') {
    raisingFactors.push({
      factor: 'history',
      label: getFactorLabel('history'),
      detail: tr('reason.history_scar', 'Prior piercing rejection or fibrotic scar tissue reducing healthy vascular perfusion.')
    });
  } else if (factors.history === 'slow') {
    raisingFactors.push({
      factor: 'history',
      label: getFactorLabel('history'),
      detail: tr('reason.history_slow', 'Prolonged healing response requiring extended vigilance against micro-trauma.')
    });
  } else if (factors.history === 'healthy') {
    protectiveFactors.push({
      factor: 'history',
      label: getFactorLabel('history'),
      detail: tr('reason.history_healthy', 'Prior track record of prompt, uncomplicated tissue healing.')
    });
  }

  // Overall tendency determination without artificial scores or percentages
  let overallTendency: 'lower' | 'moderate' | 'higher' = 'moderate';
  let tendencyTitle = tr('results.tendencyModerate', 'Overall Tendency: Moderate / Mixed Risk');
  let tendencyDescription = tr('results.tendencyModerateDesc', 'Your piercing exhibits a combination of stabilizing factors and potential irritants. Implementing the practical steps below can help protect your fistula.');

  if (raisingFactors.length >= 4 || (factors.placement === 'surface' && raisingFactors.length >= 3)) {
    overallTendency = 'higher';
    tendencyTitle = tr('results.tendencyHigher', 'Overall Tendency: Higher Likelihood of Migration / Rejection');
    tendencyDescription = tr('results.tendencyHigherDesc', 'Multiple significant mechanical or anatomical forces are acting against this piercing channel. Prompt professional assessment by a piercer is strongly advised to prevent irreversible tissue loss.');
  } else if (raisingFactors.length <= 1 && protectiveFactors.length >= 4) {
    overallTendency = 'lower';
    tendencyTitle = tr('results.tendencyLower', 'Overall Tendency: Lower Likelihood of Migration');
    tendencyDescription = tr('results.tendencyLowerDesc', 'Your piercing has strong anatomical and jewelry factors supporting stability. Continue consistent gentle care and monitor measurements periodically.');
  }

  return {
    overallTendency,
    tendencyTitle,
    tendencyDescription,
    raisingFactors,
    protectiveFactors,
    actionableSteps
  };
}

export default function App() {
  const formId = useId();
  const [, setLangVersion] = useState(0);
  const [factors, setFactors] = useState<PiercingFactors>(INITIAL_FACTORS);
  const [errors, setErrors] = useState<FactorValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FactorKey, boolean>>>({});
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);

  useEffect(() => {
    const handleLang = () => {
      setLangVersion((prev) => prev + 1);
    };
    window.addEventListener('poli-language-changed', handleLang);
    return () => window.removeEventListener('poli-language-changed', handleLang);
  }, []);

  const handleFieldChange = (key: FactorKey, value: string) => {
    const updatedFactors = { ...factors, [key]: value as any };
    setFactors(updatedFactors);
    setTouched((prev) => ({ ...prev, [key]: true }));

    // Immediate validation error check for this field
    const fieldError = validateSingleFactor(key, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (fieldError) {
        next[key] = fieldError;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const allErrors = validateAllFactors(factors);
    setErrors(allErrors);

    // Mark all as touched
    const allTouched: Record<FactorKey, boolean> = {
      placement: true,
      fit: true,
      material: true,
      friction: true,
      aftercare: true,
      history: true
    };
    setTouched(allTouched);

    if (Object.keys(allErrors).length > 0) {
      setHasEvaluated(false);
      return;
    }

    setHasEvaluated(true);
  };

  const handleReset = () => {
    setFactors(INITIAL_FACTORS);
    setErrors({});
    setTouched({});
    setHasEvaluated(false);
  };

  const assessmentResult = hasEvaluated ? evaluateFactors(factors) : null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-slate-100 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          {tr('nav.factors', 'Piercing Migration & Rejection Risk Assessment')}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          {tr('factors.intro', 'Evaluate anatomical, jewelry, and mechanical risk factors across six clinical categories. All fields start empty; selections update validation immediately.')}
        </p>
      </header>

      <form onSubmit={handleEvaluate} id={formId} className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        {/* Factor 1: Placement */}
        <fieldset className="space-y-2">
          <legend className="text-base font-semibold text-slate-200">
            {getFactorLabel('placement')}
          </legend>
          <div className="grid grid-cols-1 gap-2">
            {[
              { val: 'fold', key: 'factors.placement.opt_fold', label: 'Natural tissue fold (earlobe, helix/cartilage fold, septum, lip) with balanced opposing perpendicular tension' },
              { val: 'navel', key: 'factors.placement.opt_navel', label: 'Curved surface anatomy (navel or eyebrow) subject to ongoing facial or torso movement and clothing friction' },
              { val: 'surface', key: 'factors.placement.opt_surface', label: 'Flat surface or single-point anchor (surface bar or dermal) under continuous lateral skin tension' }
            ].map((opt) => (
              <label key={opt.val} className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${factors.placement === opt.val ? 'bg-indigo-950/40 border-indigo-500/80 text-white' : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'}`}>
                <input
                  type="radio"
                  name="placement"
                  value={opt.val}
                  checked={factors.placement === opt.val}
                  onChange={(e) => handleFieldChange('placement', e.target.value)}
                  className="mt-1 accent-indigo-500"
                />
                <span>{tr(opt.key, opt.label)}</span>
              </label>
            ))}
          </div>
          {touched.placement && errors.placement && (
            <p className="text-xs text-rose-400 mt-1 font-medium">{errors.placement}</p>
          )}
        </fieldset>

        {/* Factor 2: Fit */}
        <fieldset className="space-y-2">
          <legend className="text-base font-semibold text-slate-200">
            {getFactorLabel('fit')}
          </legend>
          <div className="grid grid-cols-1 gap-2">
            {[
              { val: 'downsized', key: 'factors.fit.opt_downsized', label: 'Properly fitted post (downsized by a piercer once initial swelling subsided)' },
              { val: 'long', key: 'factors.fit.opt_long', label: 'Excessively long initial post (swelling settled but post was never downsized; snags and levers the channel)' },
              { val: 'tight', key: 'factors.fit.opt_tight', label: 'Excessively tight or pressing post (indenting tissue with zero clearance for normal fluid drainage)' }
            ].map((opt) => (
              <label key={opt.val} className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${factors.fit === opt.val ? 'bg-indigo-950/40 border-indigo-500/80 text-white' : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'}`}>
                <input
                  type="radio"
                  name="fit"
                  value={opt.val}
                  checked={factors.fit === opt.val}
                  onChange={(e) => handleFieldChange('fit', e.target.value)}
                  className="mt-1 accent-indigo-500"
                />
                <span>{tr(opt.key, opt.label)}</span>
              </label>
            ))}
          </div>
          {touched.fit && errors.fit && (
            <p className="text-xs text-rose-400 mt-1 font-medium">{errors.fit}</p>
          )}
        </fieldset>

        {/* Factor 3: Material */}
        <fieldset className="space-y-2">
          <legend className="text-base font-semibold text-slate-200">
            {getFactorLabel('material')}
          </legend>
          <div className="grid grid-cols-1 gap-2">
            {[
              { val: 'implant', key: 'factors.material.opt_implant', label: 'Certified implant-grade material (ASTM F-136 titanium, BioFlex® body jewelry medical PP-R copolymer, ASTM F-138 implant steel, niobium)' },
              { val: 'mystery', key: 'factors.material.opt_mystery', label: 'Plated metal, mystery fashion alloy, acrylic, sterling silver, or non-implant mystery steel' }
            ].map((opt) => (
              <label key={opt.val} className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${factors.material === opt.val ? 'bg-indigo-950/40 border-indigo-500/80 text-white' : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'}`}>
                <input
                  type="radio"
                  name="material"
                  value={opt.val}
                  checked={factors.material === opt.val}
                  onChange={(e) => handleFieldChange('material', e.target.value)}
                  className="mt-1 accent-indigo-500"
                />
                <span>{tr(opt.key, opt.label)}</span>
              </label>
            ))}
          </div>
          {touched.material && errors.material && (
            <p className="text-xs text-rose-400 mt-1 font-medium">{errors.material}</p>
          )}
        </fieldset>

        {/* Factor 4: Friction */}
        <fieldset className="space-y-2">
          <legend className="text-base font-semibold text-slate-200">
            {getFactorLabel('friction')}
          </legend>
          <div className="grid grid-cols-1 gap-2">
            {[
              { val: 'none', key: 'factors.trauma.opt_none', label: 'Well-protected: no direct sleeping pressure, shielded from tight clothing, zero sports impacts' },
              { val: 'occasional', key: 'factors.trauma.opt_occasional', label: 'Occasional minor snags (light clothing contact or incidental touch)' },
              { val: 'frequent', key: 'factors.trauma.opt_frequent', label: 'Frequent friction or pressure (sleeping directly on piercing, high-waisted bands, repetitive athletic friction)' }
            ].map((opt) => (
              <label key={opt.val} className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${factors.friction === opt.val ? 'bg-indigo-950/40 border-indigo-500/80 text-white' : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'}`}>
                <input
                  type="radio"
                  name="friction"
                  value={opt.val}
                  checked={factors.friction === opt.val}
                  onChange={(e) => handleFieldChange('friction', e.target.value)}
                  className="mt-1 accent-indigo-500"
                />
                <span>{tr(opt.key, opt.label)}</span>
              </label>
            ))}
          </div>
          {touched.friction && errors.friction && (
            <p className="text-xs text-rose-400 mt-1 font-medium">{errors.friction}</p>
          )}
        </fieldset>

        {/* Factor 5: Aftercare */}
        <fieldset className="space-y-2">
          <legend className="text-base font-semibold text-slate-200">
            {getFactorLabel('aftercare')}
          </legend>
          <div className="grid grid-cols-1 gap-2">
            {[
              { val: 'saline', key: 'factors.aftercare.opt_saline', label: 'Sterile 0.9% saline spray twice daily, or LITHA (Leave It The Hell Alone), gently patting dry with clean disposable paper' },
              { val: 'inconsistent', key: 'factors.aftercare.opt_inconsistent', label: 'Inconsistent routine: occasional cotton swabs, touching with unwashed hands, or intermittent saline use' },
              { val: 'harsh', key: 'factors.aftercare.opt_harsh', label: 'Harsh chemicals or ointments: rubbing alcohol, hydrogen peroxide, tea tree oil, antibacterial soap, or thick pastes' }
            ].map((opt) => (
              <label key={opt.val} className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${factors.aftercare === opt.val ? 'bg-indigo-950/40 border-indigo-500/80 text-white' : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'}`}>
                <input
                  type="radio"
                  name="aftercare"
                  value={opt.val}
                  checked={factors.aftercare === opt.val}
                  onChange={(e) => handleFieldChange('aftercare', e.target.value)}
                  className="mt-1 accent-indigo-500"
                />
                <span>{tr(opt.key, opt.label)}</span>
              </label>
            ))}
          </div>
          {touched.aftercare && errors.aftercare && (
            <p className="text-xs text-rose-400 mt-1 font-medium">{errors.aftercare}</p>
          )}
        </fieldset>

        {/* Factor 6: Healing History */}
        <fieldset className="space-y-2">
          <legend className="text-base font-semibold text-slate-200">
            {getFactorLabel('history')}
          </legend>
          <div className="grid grid-cols-1 gap-2">
            {[
              { val: 'healthy', key: 'factors.history.opt_healthy', label: 'Healthy healing history: previous piercings healed on schedule without persistent irritation or migration' },
              { val: 'slow', key: 'factors.history.opt_slow', label: 'Slow or complicated healing: prolonged redness, fluid discharge, or recurrent irritation bumps on previous piercings' },
              { val: 'scar', key: 'factors.history.opt_scar', label: 'Prior rejection or prominent scarring: previous piercing migrated out or produced dense raised scar tissue' }
            ].map((opt) => (
              <label key={opt.val} className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${factors.history === opt.val ? 'bg-indigo-950/40 border-indigo-500/80 text-white' : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'}`}>
                <input
                  type="radio"
                  name="history"
                  value={opt.val}
                  checked={factors.history === opt.val}
                  onChange={(e) => handleFieldChange('history', e.target.value)}
                  className="mt-1 accent-indigo-500"
                />
                <span>{tr(opt.key, opt.label)}</span>
              </label>
            ))}
          </div>
          {touched.history && errors.history && (
            <p className="text-xs text-rose-400 mt-1 font-medium">{errors.history}</p>
          )}
        </fieldset>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            {tr('factors.submitBtn', 'Evaluate Risk Factors')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors border border-slate-700 focus:ring-2 focus:ring-slate-500 focus:outline-none"
          >
            {tr('factors.resetBtn', 'Clear All Selections')}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {assessmentResult && (
        <section aria-live="polite" className="mt-8 space-y-6">
          <div className={`p-5 rounded-xl border ${assessmentResult.overallTendency === 'higher' ? 'bg-rose-950/30 border-rose-800/80 text-rose-200' : assessmentResult.overallTendency === 'lower' ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200' : 'bg-amber-950/30 border-amber-800/80 text-amber-200'}`}>
            <h2 className="text-lg font-bold mb-1">{assessmentResult.tendencyTitle}</h2>
            <p className="text-sm opacity-90 leading-relaxed">{assessmentResult.tendencyDescription}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raising Factors */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-400 mb-3">
                {tr('results.raisingTitle', 'Factors That Raise Risk')} ({assessmentResult.raisingFactors.length})
              </h3>
              {assessmentResult.raisingFactors.length === 0 ? (
                <p className="text-xs text-slate-400">{tr('results.noneIdentified', 'None detected based on your selections.')}</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-300">
                  {assessmentResult.raisingFactors.map((f, i) => (
                    <li key={i} className="border-l-2 border-rose-500/80 pl-3 py-0.5">
                      <strong className="text-white block text-xs">{f.label}</strong>
                      <span className="text-xs text-slate-300">{f.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Protective Factors */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3">
                {tr('results.loweringTitle', 'Protective / Stabilizing Factors')} ({assessmentResult.protectiveFactors.length})
              </h3>
              {assessmentResult.protectiveFactors.length === 0 ? (
                <p className="text-xs text-slate-400">{tr('results.noneIdentified', 'None selected.')}</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-300">
                  {assessmentResult.protectiveFactors.map((f, i) => (
                    <li key={i} className="border-l-2 border-emerald-500/80 pl-3 py-0.5">
                      <strong className="text-white block text-xs">{f.label}</strong>
                      <span className="text-xs text-slate-300">{f.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Actionable Steps */}
          {assessmentResult.actionableSteps.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
                {tr('change.title', 'What You Can Change (Actionable Steps)')}
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-300">
                {assessmentResult.actionableSteps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
