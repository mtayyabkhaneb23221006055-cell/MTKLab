import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { evaluateFoodHazards } from '../../db/foodSafetyDatabase';
import { FoodSample, FoodRiskFactors, FoodTestPlanItem } from '../../types';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Bug,
  Beaker,
  ShieldAlert,
  FileSpreadsheet,
  FlaskConical,
  Sparkles,
  Info,
  Check,
  Plus,
  Trash2,
  Printer,
  ShieldCheck,
  Building2,
} from 'lucide-react';

const FOOD_CATEGORIES = [
  'Seafood',
  'Dairy',
  'Poultry & Meat',
  'Produce & Fresh Cut Vegetables',
  'Ready-To-Eat (RTE) Prepared Meals',
  'Low-Acid Canned & Hermetically Sealed',
  'Fermented Foods & Pickles',
  'Confectionery, Chocolate & Dry Powders',
  'Egg Products',
  'Beverages & Juices',
] as const;

export const FoodSampleWorkflow: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { myLabResources, saveFoodSample, saveFoodTestPlanItem, userProfile } = useApp();

  const [step, setStep] = useState<number>(1);

  // Step 1: Sample Info
  const [sampleName, setSampleName] = useState('Raw Frozen Shellfish Sample X-9');
  const [foodCategory, setFoodCategory] = useState<string>('Seafood');
  const [productType, setProductType] = useState('Frozen Raw Tiger Shrimp');
  const [processingStatus, setProcessingStatus] = useState('Raw');
  const [packagingType, setPackagingType] = useState('Vacuum Sealed Plastic');
  const [storageCondition, setStorageCondition] = useState('Frozen (-18°C)');
  const [isReadyToEat, setIsReadyToEat] = useState(false);
  const [isRawOrProcessed, setIsRawOrProcessed] = useState<'RAW' | 'PROCESSED'>('RAW');
  const [sampleSource, setSampleSource] = useState('Processing Facility #2');
  const [lotBatchNumber, setLotBatchNumber] = useState('LOT-2026-0808');

  // Step 2: Risk Factors
  const [riskFactors, setRiskFactors] = useState<FoodRiskFactors>({
    isPhUnder46: false,
    isLowMoisture: false,
    wasHeatProcessed: false,
    isFermented: false,
    isColdChainDependent: true,
    containsPreservatives: false,
    isVacuumPackaged: true,
    isReadyToEat: false,
    targetSpecialPopulation: false,
    isRaw: true,
    isFrozen: true,
    containsDairy: false,
    containsSeafood: true,
    containsPoultryOrMeat: false,
    containsEgg: false,
  });

  // Calculate evaluation from database engine dynamically
  const sampleData: FoodSample = useMemo(() => {
    return {
      id: `MTK-FOOD-${Date.now().toString().slice(-4)}`,
      sampleName,
      foodCategory,
      productType,
      processingStatus,
      packagingType,
      storageCondition,
      isReadyToEat,
      isRawOrProcessed,
      sampleSource,
      collectionDate: new Date().toISOString().split('T')[0],
      lotBatchNumber,
      riskFactors,
      status: 'Registered',
    };
  }, [sampleName, foodCategory, productType, processingStatus, packagingType, storageCondition, isReadyToEat, isRawOrProcessed, sampleSource, lotBatchNumber, riskFactors]);

  const evaluation = useMemo(() => {
    return evaluateFoodHazards(sampleData, myLabResources);
  }, [sampleData, myLabResources]);

  // Step 5 Editable Test Plan Items
  const [customTestPlan, setCustomTestPlan] = useState<FoodTestPlanItem[]>([]);

  // Update test plan whenever evaluation changes if on step <= 4
  React.useEffect(() => {
    const items: FoodTestPlanItem[] = (evaluation.recommendedTestPlan || []).map((rec, idx) => ({
      id: `rec_${idx}_${Date.now()}`,
      sampleId: sampleData.id,
      targetOrganism: rec.targetOrganism,
      testCategory: rec.testCategory,
      testType: rec.testType,
      purpose: rec.purpose,
      priority: rec.priority,
      status: 'Not Started',
      referenceMethod: rec.referenceMethod,
      confirmationRequired: rec.confirmationRequired,
      resourceAvailable: rec.resourceAvailable,
      result: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));
    setCustomTestPlan(items);
  }, [evaluation]);

  // Step 6: Entered Results
  const [testResults, setTestResults] = useState<Record<string, { result: string; value: string; notes: string }>>({});

  // Final step save
  const handleFinalSave = () => {
    const savedSample = saveFoodSample({
      ...sampleData,
      status: 'Testing in Progress',
    });

    customTestPlan.forEach(planItem => {
      const res = testResults[planItem.id];
      saveFoodTestPlanItem({
        ...planItem,
        sampleId: savedSample.id,
        result: res?.result as any || planItem.result,
        resultValue: res?.value || planItem.resultValue,
        notes: res?.notes || planItem.notes,
        status: res?.result ? 'Completed' : 'Pending',
        analyst: userProfile.name,
        testDate: new Date().toISOString().split('T')[0],
      });
    });

    if (onComplete) onComplete();
  };

  const stepsList = [
    '1. Sample Info',
    '2. Risk Assessment',
    '3. Suspected Hazards',
    '4. Recommended Tests',
    '5. Test Plan & Resources',
    '6. Results Entry',
    '7. Confirmation Guidance',
    '8. Final Report',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Step Stepper Header */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <FlaskConical className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Food Safety Intelligence Engine & Workflow
              </h2>
              <p className="text-xs text-slate-500">
                Step {step} of 8 — {stepsList[step - 1]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}

            {step < 8 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinalSave}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Sample & Plan
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Pills */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
          {stepsList.map((stName, idx) => {
            const num = idx + 1;
            const isDone = num < step;
            const isCurrent = num === step;
            return (
              <button
                key={stName}
                onClick={() => setStep(num)}
                className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center truncate transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {stName}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: SAMPLE IDENTIFICATION */}
      {step === 1 && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-xs">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Step 1: Food Sample Identification & Matrix Classification</h3>
            <p className="text-xs text-slate-500 mt-0.5">Define sample characteristics, processing history, and packaging type.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sample Name / Identifier</label>
              <input
                type="text"
                value={sampleName}
                onChange={e => setSampleName(e.target.value)}
                placeholder="e.g. Raw Frozen Tiger Shrimp Batch A"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Food Category</label>
              <select
                value={foodCategory}
                onChange={e => {
                  const val = e.target.value;
                  setFoodCategory(val);
                  setRiskFactors(prev => ({
                    ...prev,
                    containsSeafood: val === 'Seafood',
                    containsDairy: val === 'Dairy',
                    containsPoultryOrMeat: val === 'Poultry & Meat',
                    containsEgg: val === 'Egg Products',
                  }));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold border border-slate-200 dark:border-slate-700"
              >
                {FOOD_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Specific Product Description</label>
              <input
                type="text"
                value={productType}
                onChange={e => setProductType(e.target.value)}
                placeholder="e.g. Peeled & Deveined Frozen Tail-on Shrimp"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Raw vs Processed State</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRawOrProcessed('RAW');
                    setIsReadyToEat(false);
                    setRiskFactors(prev => ({ ...prev, isRaw: true, isReadyToEat: false }));
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isRawOrProcessed === 'RAW'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Raw Food Matrix
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRawOrProcessed('PROCESSED');
                    setRiskFactors(prev => ({ ...prev, isRaw: false }));
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isRawOrProcessed === 'PROCESSED'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Processed / Heat Treated
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Packaging & Storage</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={packagingType}
                  onChange={e => setPackagingType(e.target.value)}
                  placeholder="Packaging e.g. Vacuum Pack"
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={storageCondition}
                  onChange={e => setStorageCondition(e.target.value)}
                  placeholder="Storage e.g. Frozen (-18°C)"
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sample Source & Lot Number</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={sampleSource}
                  onChange={e => setSampleSource(e.target.value)}
                  placeholder="Source e.g. Port Facility"
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={lotBatchNumber}
                  onChange={e => setLotBatchNumber(e.target.value)}
                  placeholder="Lot/Batch No."
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: RISK FACTORS */}
      {step === 2 && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-xs">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Step 2: Microenvironment & Risk Factor Assessment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select key preservation and intrinsic factors. The deterministic hazard engine uses these to evaluate survival and growth risk.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {[
              { key: 'isReadyToEat', label: 'Ready-To-Eat (RTE) Product', desc: 'Consumed without secondary lethal cooking step' },
              { key: 'isPhUnder46', label: 'pH < 4.6 (High Acid)', desc: 'Inhibits Clostridium botulinum spore outgrowth' },
              { key: 'isLowMoisture', label: 'Low Moisture / Low Aw (< 0.85)', desc: 'Inhibits vegetative bacterial growth' },
              { key: 'wasHeatProcessed', label: 'Heat Processed / Pasteurized', desc: 'Eliminates non-sporeforming vegetative pathogens' },
              { key: 'isFermented', label: 'Fermented / Acidified', desc: 'Lactic acid or starter culture preservation' },
              { key: 'isColdChainDependent', label: 'Cold-Chain Dependent', desc: 'Requires refrigeration (< 4°C) or freezing' },
              { key: 'isVacuumPackaged', label: 'Vacuum Packaged / Reduced O2', desc: 'Creates anaerobic niche (Clostridium / Listeria)' },
              { key: 'targetSpecialPopulation', label: 'Targeting Vulnerable Population', desc: 'Infants, elderly, or immunocompromised' },
            ].map(item => (
              <div
                key={item.key}
                onClick={() =>
                  setRiskFactors(prev => ({
                    ...prev,
                    [item.key]: !prev[item.key as keyof FoodRiskFactors],
                  }))
                }
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  riskFactors[item.key as keyof FoodRiskFactors]
                    ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                    riskFactors[item.key as keyof FoodRiskFactors] ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {riskFactors[item.key as keyof FoodRiskFactors] && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{item.label}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: SUSPECTED ORGANISMS & HAZARDS */}
      {step === 3 && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Step 3: Suspected Pathogen & Hazard Evaluation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated by MTKmicro deterministic hazard matrix based on <strong>{foodCategory}</strong> characteristics.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              {(evaluation.potentialHazards || []).length} Potential Targets Found
            </span>
          </div>

          <div className="space-y-3">
            {(evaluation.potentialHazards || []).map(haz => (
              <div
                key={haz.id}
                className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold italic text-slate-900 dark:text-slate-100 text-sm">{haz.organism}</h4>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        haz.riskLevel === 'High'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {haz.riskLevel} Risk Target
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">Method: {haz.referenceMethod}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">{haz.whyRelevant}</p>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap gap-4 text-[11px] text-slate-500">
                  <div>
                    <strong>Screening Media:</strong> {haz.screeningMedia}
                  </div>
                  <div>
                    <strong>Confirmation Media:</strong> {haz.confirmationMedia}
                  </div>
                  <div>
                    <strong>Rationale:</strong> {haz.regulatoryRationale}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: RECOMMENDED TEST CATEGORIES */}
      {step === 4 && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-xs">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Step 4: Recommended Testing Categories & Strategy</h3>
            <p className="text-xs text-slate-500 mt-0.5">Categorized by primary safety objectives: Pathogens, Hygiene Indicators, and Quality Checks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 rounded-2xl space-y-2">
              <h4 className="font-extrabold text-teal-900 dark:text-teal-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-teal-600" /> Pathogen Detection (Zero Tolerance / Compliance)
              </h4>
              <p className="text-xs text-teal-800 dark:text-teal-300">
                Qualitative presence/absence testing (25g sample pre-enrichment). Crucial for safety verification prior to market release.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Beaker className="w-4 h-4 text-slate-600" /> Hygiene & Indicator Organisms (CFU/g)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quantitative enumeration (Aerobic Plate Count, Coliforms, Enterobacteriaceae) assessing process hygiene and shelf-life stability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: TEST PLAN & RESOURCE MATCHING */}
      {step === 5 && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Step 5: Test Plan Customizer & Lab Capability Matching</h3>
              <p className="text-xs text-slate-500 mt-0.5">Review recommended test items and match required growth media against stocked lab resources.</p>
            </div>
            <button
              onClick={() => {
                const newItem: FoodTestPlanItem = {
                  id: `custom_${Date.now()}`,
                  sampleId: sampleData.id,
                  targetOrganism: 'Custom Target Organism',
                  testCategory: 'Microbiological Analysis',
                  testType: 'Detection',
                  purpose: 'Custom analytical requirement',
                  priority: 'Medium',
                  status: 'Not Started',
                  referenceMethod: 'Internal Method',
                  confirmationRequired: false,
                  resourceAvailable: true,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };
                setCustomTestPlan(prev => [...prev, newItem]);
              }}
              className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Test
            </button>
          </div>

          <div className="space-y-3">
            {customTestPlan.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold italic text-slate-900 dark:text-slate-100 text-sm">{item.targetOrganism}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.testType}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{item.referenceMethod}</span>
                  </div>
                  <p className="text-xs text-slate-500">{item.purpose}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                      item.resourceAvailable
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {item.resourceAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {item.resourceAvailable ? 'Media Stocked' : 'Media Reorder Needed'}
                  </span>

                  <button
                    onClick={() => setCustomTestPlan(prev => prev.filter(p => p.id !== item.id))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 6: RESULT ENTRY */}
      {step === 6 && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-xs">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Step 6: Laboratory Result Entry & Observations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Record primary selective agar observations, colony counts, or presumptive calls.</p>
          </div>

          <div className="space-y-3">
            {customTestPlan.map(item => (
              <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold italic text-slate-900 dark:text-slate-100 text-sm">{item.targetOrganism}</h4>
                  <span className="text-xs font-mono text-slate-500">{item.referenceMethod}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Result Call</label>
                    <select
                      value={testResults[item.id]?.result || 'Not Detected'}
                      onChange={e =>
                        setTestResults(prev => ({
                          ...prev,
                          [item.id]: {
                            result: e.target.value,
                            value: prev[item.id]?.value || '',
                            notes: prev[item.id]?.notes || '',
                          },
                        }))
                      }
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 font-bold border"
                    >
                      <option value="Not Detected">Not Detected / Negative</option>
                      <option value="Presumptive Positive">Presumptive Positive</option>
                      <option value="Confirmed Positive">Confirmed Species Positive</option>
                      <option value="Satisfactory">Satisfactory (In Specification)</option>
                      <option value="Unsatisfactory">Unsatisfactory (Out of Spec)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CFU Count / Morphology</label>
                    <input
                      type="text"
                      value={testResults[item.id]?.value || ''}
                      onChange={e =>
                        setTestResults(prev => ({
                          ...prev,
                          [item.id]: {
                            result: prev[item.id]?.result || 'Not Detected',
                            value: e.target.value,
                            notes: prev[item.id]?.notes || '',
                          },
                        }))
                      }
                      placeholder="e.g. Yellow colonies on TCBS"
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Analytical Notes</label>
                    <input
                      type="text"
                      value={testResults[item.id]?.notes || ''}
                      onChange={e =>
                        setTestResults(prev => ({
                          ...prev,
                          [item.id]: {
                            result: prev[item.id]?.result || 'Not Detected',
                            value: prev[item.id]?.value || '',
                            notes: e.target.value,
                          },
                        }))
                      }
                      placeholder="Incubation conditions verified"
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 7: CONFIRMATION GUIDANCE */}
      {step === 7 && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-xs">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Step 7: Presumptive Confirmation & Verification Assistant</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocol verification steps for presumptive colonies. Do not convert a presumptive result into a confirmed species without completing secondary tests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-teal-600">Step 7.1</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Microscopic Morphology</h4>
              <p className="text-slate-500 text-[11px]">Gram stain (Gram-negative bacilli or Gram-positive rods/cocci) and motility check.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-teal-600">Step 7.2</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Biochemical Profiles</h4>
              <p className="text-slate-500 text-[11px]">Oxidase, Catalase, Salt Tolerance (0%, 3%, 6%, 8% NaCl), Indole, and TSI agar slant reactions.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-teal-600">Step 7.3</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Serological Typing</h4>
              <p className="text-slate-500 text-[11px]">Polyvalent O & H agglutination antisera testing for Salmonella or E. coli serogroups.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-teal-600">Step 7.4</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Molecular Confirmation</h4>
              <p className="text-slate-500 text-[11px]">Real-time qPCR thermocycling targeting species-specific gene markers (invA, tlh, hlyA).</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 8: FINAL REPORT */}
      {step === 8 && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Step 8: Final Food Microbiological Testing Report</h3>
              <p className="text-xs text-slate-500 mt-0.5">Generated report summary ready for save and formal export.</p>
            </div>
            <button
              onClick={handleFinalSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save Record & Complete
            </button>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{sampleData.sampleName}</h4>
                <p className="text-slate-500">ID: {sampleData.id} | Category: {sampleData.foodCategory}</p>
              </div>
              <span className="text-xs font-mono text-slate-500">Date: {new Date().toLocaleDateString()}</span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b font-bold text-slate-700 dark:text-slate-300">
                  <th className="py-2">Target Organism</th>
                  <th className="py-2">Method</th>
                  <th className="py-2">Result Call</th>
                  <th className="py-2">Observations</th>
                </tr>
              </thead>
              <tbody>
                {customTestPlan.map(tp => (
                  <tr key={tp.id} className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-2 italic font-semibold">{tp.targetOrganism}</td>
                    <td className="py-2 font-mono text-slate-500">{tp.referenceMethod}</td>
                    <td className="py-2 font-bold">{testResults[tp.id]?.result || 'Pending'}</td>
                    <td className="py-2">{testResults[tp.id]?.value || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
