import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MtkTextField } from '../common/MtkTextField';
import { MtkButton } from '../common/MtkButton';
import { calculateMasterMix, MasterMixComponentCalc } from '../../utils/calculatorLogic';
import { MasterMixComponent } from '../../types';
import { Dna, Plus, Trash2, Save, Bookmark } from 'lucide-react';

export const MasterMixCalculatorScreen: React.FC = () => {
  const { saveMasterMixRecipe, masterMixRecipes } = useApp();

  const [rxnVol, setRxnVol] = useState('25');
  const [rxnVolUnit, setRxnVolUnit] = useState('µL');
  const [numRxns, setNumRxns] = useState('10');
  const [overagePct, setOveragePct] = useState('10');

  const [components, setComponents] = useState<MasterMixComponent[]>([
    { id: '1', name: '2X PCR Master Mix', stockConc: 2, stockConcUnit: 'X', finalConc: 1, finalConcUnit: 'X' },
    { id: '2', name: 'Forward Primer (10 µM)', stockConc: 10, stockConcUnit: 'µM', finalConc: 0.4, finalConcUnit: 'µM' },
    { id: '3', name: 'Reverse Primer (10 µM)', stockConc: 10, stockConcUnit: 'µM', finalConc: 0.4, finalConcUnit: 'µM' },
    { id: '4', name: 'Nuclease-Free Water', stockConc: 1, stockConcUnit: 'X', finalConc: 0.52, finalConcUnit: 'X' },
  ]);

  const [recipeName, setRecipeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ totalMixVolume: number; overageRxns: number; componentCalcs: MasterMixComponentCalc[] } | null>(null);

  const handleAddComponent = () => {
    setComponents([
      ...components,
      {
        id: Date.now().toString(),
        name: `Component ${components.length + 1}`,
        stockConc: 10,
        stockConcUnit: 'mM',
        finalConc: 1,
        finalConcUnit: 'mM',
      },
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const handleUpdateComponent = (id: string, field: keyof MasterMixComponent, value: string | number) => {
    setComponents(
      components.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleCalculate = () => {
    setError(null);
    try {
      const rv = parseFloat(rxnVol);
      const nr = parseInt(numRxns, 10);
      const ov = parseInt(overagePct, 10);

      const calcs = calculateMasterMix(rv, rxnVolUnit, nr, ov, components);
      setResults(calcs);
    } catch (err) {
      setResults(null);
      setError((err as Error).message);
    }
  };

  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      setError('Please enter a recipe name to save.');
      return;
    }
    const rv = parseFloat(rxnVol) || 25;
    const nr = parseInt(numRxns, 10) || 1;
    const ov = parseInt(overagePct, 10) || 10;

    saveMasterMixRecipe({
      name: recipeName.trim(),
      reactionVolume: rv,
      reactionVolumeUnit: rxnVolUnit,
      numReactions: nr,
      overagePercent: ov,
      components,
    });

    setIsSaving(false);
    setRecipeName('');
    alert('Master Mix Recipe saved successfully!');
  };

  const handleLoadRecipe = (recId: number) => {
    const rec = masterMixRecipes.find(r => r.id === recId);
    if (!rec) return;
    setRxnVol(rec.reactionVolume.toString());
    setRxnVolUnit(rec.reactionVolumeUnit);
    setNumRxns(rec.numReactions.toString());
    setOveragePct(rec.overagePercent.toString());
    setComponents(rec.components);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
          <Dna className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Master Mix Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate reagent volumes per reaction and total batch mix with overage compensation.
          </p>
        </div>
      </div>

      {/* Saved Recipes Row */}
      {(masterMixRecipes || []).length > 0 && (
        <div className="bg-purple-50/60 dark:bg-purple-950/30 p-3 rounded-2xl border border-purple-200 dark:border-purple-800/80">
          <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 mb-2">
            <Bookmark className="w-3.5 h-3.5" /> Saved Master Mix Recipes
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(masterMixRecipes || []).map(r => (
              <button
                key={r.id}
                onClick={() => handleLoadRecipe(r.id)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 border border-purple-200 dark:border-purple-800 hover:border-purple-500 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {r.name} ({(r.components || []).length} comps)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reaction Parameters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MtkTextField
            label="Reaction Volume"
            value={rxnVol}
            onChange={e => setRxnVol(e.target.value)}
            unit={rxnVolUnit}
            unitOptions={['µL', 'mL']}
            onUnitChange={setRxnVolUnit}
          />

          <MtkTextField
            label="Number of Reactions"
            type="number"
            min="1"
            value={numRxns}
            onChange={e => setNumRxns(e.target.value)}
          />

          <MtkTextField
            label="Overage (%)"
            type="number"
            min="0"
            value={overagePct}
            onChange={e => setOveragePct(e.target.value)}
            unit="%"
          />
        </div>

        {/* Dynamic Components List */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Reagent Components ({components.length})
            </h3>
            <button
              onClick={handleAddComponent}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Component
            </button>
          </div>

          <div className="space-y-2">
            {components.map(comp => (
              <div
                key={comp.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center gap-2"
              >
                <input
                  type="text"
                  value={comp.name}
                  onChange={e => handleUpdateComponent(comp.id, 'name', e.target.value)}
                  placeholder="Component Name"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Stock:</span>
                    <input
                      type="number"
                      value={comp.stockConc}
                      onChange={e => handleUpdateComponent(comp.id, 'stockConc', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                    <select
                      value={comp.stockConcUnit}
                      onChange={e => handleUpdateComponent(comp.id, 'stockConcUnit', e.target.value)}
                      className="px-1.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    >
                      {['X', 'M', 'mM', 'µM', 'nM', '%'].map(u => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Final:</span>
                    <input
                      type="number"
                      value={comp.finalConc}
                      onChange={e => handleUpdateComponent(comp.id, 'finalConc', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                    <span className="text-xs font-mono text-slate-500">{comp.stockConcUnit}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveComponent(comp.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg ml-auto cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <MtkButton variant="primary" fullWidth onClick={handleCalculate}>
            Calculate Batch Mix
          </MtkButton>
          <MtkButton variant="outlined" onClick={() => setIsSaving(true)} icon={Save}>
            Save Recipe
          </MtkButton>
        </div>
      </div>

      {/* Save Recipe Dialog */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Save Master Mix Recipe</h3>
            <MtkTextField
              label="Recipe Name"
              placeholder="e.g. Standard Taq 16S PCR Mix"
              value={recipeName}
              onChange={e => setRecipeName(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <MtkButton size="sm" variant="ghost" onClick={() => setIsSaving(false)}>
                Cancel
              </MtkButton>
              <MtkButton size="sm" variant="primary" onClick={handleSaveRecipe}>
                Save
              </MtkButton>
            </div>
          </div>
        </div>
      )}

      {/* Results Output Table */}
      {results && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Master Mix Assembly Schedule
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Total Batch Volume: <strong className="text-slate-900 dark:text-slate-100">{results.totalMixVolume.toFixed(2)} {rxnVolUnit}</strong> (scaled for {results.overageRxns.toFixed(1)} rxns)
              </p>
            </div>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <th className="py-2 px-2">Component</th>
                <th className="py-2 px-2 text-right">Per Rxn ({rxnVolUnit})</th>
                <th className="py-2 px-2 text-right">Total Batch Mix ({rxnVolUnit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono">
              {results.componentCalcs.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-2 font-bold text-slate-900 dark:text-slate-100">{c.name}</td>
                  <td className="py-2 px-2 text-right font-semibold text-slate-700 dark:text-slate-300">
                    {c.volPerRxn.toFixed(2)} {c.volPerRxnUnit}
                  </td>
                  <td className="py-2 px-2 text-right font-extrabold text-purple-700 dark:text-purple-400">
                    {c.totalVol.toFixed(2)} {c.totalVolUnit}
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
