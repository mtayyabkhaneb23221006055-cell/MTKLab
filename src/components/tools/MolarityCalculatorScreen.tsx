import React, { useState } from 'react';
import { MtkTextField } from '../common/MtkTextField';
import { MtkButton } from '../common/MtkButton';
import { ResultCard } from '../common/ResultCard';
import { calculateMolarity, MolarityInputs, MolarityResult } from '../../utils/calculatorLogic';
import { Atom, RotateCcw } from 'lucide-react';

export const MolarityCalculatorScreen: React.FC = () => {
  const [inputs, setInputs] = useState<MolarityInputs>({
    molarity: '',
    molarityUnit: 'mM',
    mass: '',
    massUnit: 'mg',
    mw: '180.16', // default MW e.g. Glucose
    volume: '100',
    volumeUnit: 'mL',
    moles: '',
    molesUnit: 'mmol',
  });

  const [result, setResult] = useState<MolarityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    try {
      const res = calculateMolarity(inputs);
      setResult(res);
    } catch (err) {
      setResult(null);
      setError((err as Error).message);
    }
  };

  const handleReset = () => {
    setInputs({
      molarity: '',
      molarityUnit: 'mM',
      mass: '',
      massUnit: 'mg',
      mw: '',
      volume: '',
      volumeUnit: 'mL',
      moles: '',
      molesUnit: 'mmol',
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
          <Atom className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Molarity Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Leave <strong className="text-teal-600 dark:text-teal-400">exactly one target field blank</strong> to solve for it.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <MtkTextField
          label="1. Molarity (M)"
          placeholder="Leave blank to solve for Molar conc"
          value={inputs.molarity}
          onChange={e => setInputs({ ...inputs, molarity: e.target.value })}
          unit={inputs.molarityUnit}
          unitOptions={['M', 'mM', 'µM']}
          onUnitChange={u => setInputs({ ...inputs, molarityUnit: u })}
        />

        <MtkTextField
          label="2. Mass"
          placeholder="Leave blank to solve for Mass"
          value={inputs.mass}
          onChange={e => setInputs({ ...inputs, mass: e.target.value })}
          unit={inputs.massUnit}
          unitOptions={['g', 'mg', 'µg', 'kg']}
          onUnitChange={u => setInputs({ ...inputs, massUnit: u })}
        />

        <MtkTextField
          label="3. Molecular Weight (MW)"
          placeholder="e.g. 58.44 for NaCl, 180.16 for Glucose"
          value={inputs.mw}
          onChange={e => setInputs({ ...inputs, mw: e.target.value })}
          unit="g/mol"
        />

        <MtkTextField
          label="4. Solution Volume"
          placeholder="Leave blank to solve for Volume"
          value={inputs.volume}
          onChange={e => setInputs({ ...inputs, volume: e.target.value })}
          unit={inputs.volumeUnit}
          unitOptions={['L', 'mL', 'µL']}
          onUnitChange={u => setInputs({ ...inputs, volumeUnit: u })}
        />

        <MtkTextField
          label="5. Moles (Optional alternative)"
          placeholder="Leave blank if using Mass + MW"
          value={inputs.moles}
          onChange={e => setInputs({ ...inputs, moles: e.target.value })}
          unit={inputs.molesUnit}
          unitOptions={['mol', 'mmol', 'µmol']}
          onUnitChange={u => setInputs({ ...inputs, molesUnit: u })}
        />

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <MtkButton variant="primary" fullWidth onClick={handleCalculate}>
            Calculate
          </MtkButton>
          <MtkButton variant="outlined" onClick={handleReset} icon={RotateCcw}>
            Reset
          </MtkButton>
        </div>
      </div>

      {result && (
        <ResultCard
          title={`Calculated ${result.fieldLabel}`}
          value={result.formattedValue}
          unit={result.unit}
          formula={result.formulaString}
          substitutedFormula={result.substitutedFormula}
        />
      )}
    </div>
  );
};
