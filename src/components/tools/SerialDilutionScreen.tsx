import React, { useState } from 'react';
import { MtkTextField } from '../common/MtkTextField';
import { MtkButton } from '../common/MtkButton';
import { calculateSerialDilution, SerialDilutionRow } from '../../utils/calculatorLogic';
import { Binary, RotateCcw } from 'lucide-react';

export const SerialDilutionScreen: React.FC = () => {
  const [startConc, setStartConc] = useState('1');
  const [concUnit, setConcUnit] = useState('M');
  const [factor, setFactor] = useState('10');
  const [numSteps, setNumSteps] = useState('5');
  const [finalVol, setFinalVol] = useState('1000');
  const [volUnit, setVolUnit] = useState('µL');

  const [rows, setRows] = useState<SerialDilutionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    try {
      const sc = parseFloat(startConc);
      const f = parseFloat(factor);
      const n = parseInt(numSteps, 10);
      const fv = parseFloat(finalVol);

      if (isNaN(sc) || isNaN(f) || isNaN(n) || isNaN(fv)) {
        throw new Error('Please enter valid numeric values for all fields.');
      }

      const table = calculateSerialDilution(sc, concUnit, f, n, fv, volUnit);
      setRows(table);
    } catch (err) {
      setRows(null);
      setError((err as Error).message);
    }
  };

  const handleReset = () => {
    setStartConc('1');
    setConcUnit('M');
    setFactor('10');
    setNumSteps('5');
    setFinalVol('1000');
    setVolUnit('µL');
    setRows(null);
    setError(null);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200 dark:border-cyan-800">
          <Binary className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Serial Dilution Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate stepwise dilution protocol tables for microbial assays and standard curves.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MtkTextField
            label="Starting Concentration"
            value={startConc}
            onChange={e => setStartConc(e.target.value)}
            unit={concUnit}
            unitOptions={['M', 'mM', 'µM', 'nM', 'mg/mL', 'µg/mL']}
            onUnitChange={setConcUnit}
          />

          <MtkTextField
            label="Dilution Factor"
            placeholder="e.g. 10 for 1:10, 2 for 1:2"
            value={factor}
            onChange={e => setFactor(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MtkTextField
            label="Number of Steps / Tubes"
            type="number"
            max={20}
            value={numSteps}
            onChange={e => setNumSteps(e.target.value)}
          />

          <MtkTextField
            label="Final Volume per Tube"
            value={finalVol}
            onChange={e => setFinalVol(e.target.value)}
            unit={volUnit}
            unitOptions={['mL', 'µL', 'L']}
            onUnitChange={setVolUnit}
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <MtkButton variant="primary" fullWidth onClick={handleCalculate}>
            Generate Serial Table
          </MtkButton>
          <MtkButton variant="outlined" onClick={handleReset} icon={RotateCcw}>
            Reset
          </MtkButton>
        </div>
      </div>

      {rows && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs overflow-x-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-3">
            Serial Dilution Schedule ({rows.length} Steps)
          </h3>

          <table className="w-full text-xs text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <th className="py-2 px-2">Tube #</th>
                <th className="py-2 px-2">Ratio</th>
                <th className="py-2 px-2">Concentration</th>
                <th className="py-2 px-2">Transfer Vol</th>
                <th className="py-2 px-2">Diluent Vol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono">
              {rows.map(r => (
                <tr key={r.tubeNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-2 font-bold text-teal-600 dark:text-teal-400">Tube {r.tubeNumber}</td>
                  <td className="py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">{r.dilutionRatio}</td>
                  <td className="py-2 px-2 font-bold text-slate-900 dark:text-slate-100">{r.concFormatted}</td>
                  <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                    {r.transferVolFormatted} {r.transferVolUnit}
                  </td>
                  <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                    {r.diluentVolFormatted} {r.diluentVolUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
