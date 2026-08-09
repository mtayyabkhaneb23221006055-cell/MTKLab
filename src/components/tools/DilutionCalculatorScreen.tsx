import React, { useState } from 'react';
import { MtkTextField } from '../common/MtkTextField';
import { MtkButton } from '../common/MtkButton';
import { ResultCard } from '../common/ResultCard';
import { calculateDilution, DilutionInputs, DilutionResult } from '../../utils/calculatorLogic';
import { FlaskConical, RotateCcw } from 'lucide-react';

export const DilutionCalculatorScreen: React.FC = () => {
  const [inputs, setInputs] = useState<DilutionInputs>({
    c1: '10', c1Unit: 'mg/mL',
    v1: '', v1Unit: 'mL',
    c2: '1', c2Unit: 'mg/mL',
    v2: '10', v2Unit: 'mL',
  });

  const [result, setResult] = useState<DilutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    try {
      const res = calculateDilution(inputs);
      setResult(res);
    } catch (err) {
      setResult(null);
      setError((err as Error).message);
    }
  };

  const handleReset = () => {
    setInputs({
      c1: '', c1Unit: 'M',
      v1: '', v1Unit: 'mL',
      c2: '', c2Unit: 'M',
      v2: '', v2Unit: 'mL',
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Dilution Calculator (C1V1 = C2V2)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Leave <strong className="text-teal-600 dark:text-teal-400">one field blank</strong> to solve for it.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MtkTextField
            label="Stock Conc (C1)"
            placeholder="Stock concentration"
            value={inputs.c1}
            onChange={e => setInputs({ ...inputs, c1: e.target.value })}
            unit={inputs.c1Unit}
            unitOptions={['M', 'mM', 'µM', 'mg/mL', 'µg/mL', '%']}
            onUnitChange={u => setInputs({ ...inputs, c1Unit: u })}
          />

          <MtkTextField
            label="Stock Volume (V1)"
            placeholder="Leave blank to solve"
            value={inputs.v1}
            onChange={e => setInputs({ ...inputs, v1: e.target.value })}
            unit={inputs.v1Unit}
            unitOptions={['L', 'mL', 'µL']}
            onUnitChange={u => setInputs({ ...inputs, v1Unit: u })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MtkTextField
            label="Desired Conc (C2)"
            placeholder="Final concentration"
            value={inputs.c2}
            onChange={e => setInputs({ ...inputs, c2: e.target.value })}
            unit={inputs.c2Unit}
            unitOptions={['M', 'mM', 'µM', 'mg/mL', 'µg/mL', '%']}
            onUnitChange={u => setInputs({ ...inputs, c2Unit: u })}
          />

          <MtkTextField
            label="Final Volume (V2)"
            placeholder="Total final volume"
            value={inputs.v2}
            onChange={e => setInputs({ ...inputs, v2: e.target.value })}
            unit={inputs.v2Unit}
            unitOptions={['L', 'mL', 'µL']}
            onUnitChange={u => setInputs({ ...inputs, v2Unit: u })}
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <MtkButton variant="primary" fullWidth onClick={handleCalculate}>
            Calculate Dilution
          </MtkButton>
          <MtkButton variant="outlined" onClick={handleReset} icon={RotateCcw}>
            Reset
          </MtkButton>
        </div>
      </div>

      {result && (
        <div className="space-y-3">
          <ResultCard
            title="Required Stock Volume (V1)"
            value={result.stockVolumeReqFormatted}
            unit={result.stockVolumeReqUnit}
            secondaryValue={`Diluent Volume Required: ${result.diluentVolumeFormatted} ${result.diluentVolumeUnit}`}
            formula="C1 × V1 = C2 × V2"
            substitutedFormula={`Factor: ${result.dilutionFactorRatio} — Add ${result.stockVolumeReqFormatted} ${result.stockVolumeReqUnit} Stock to ${result.diluentVolumeFormatted} ${result.diluentVolumeUnit} Diluent`}
          />
        </div>
      )}
    </div>
  );
};
