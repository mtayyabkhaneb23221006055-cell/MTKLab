import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MtkTextField } from '../common/MtkTextField';
import { MtkButton } from '../common/MtkButton';
import { calculateBuffer, BufferComponentCalc } from '../../utils/calculatorLogic';
import { BufferComponent } from '../../types';
import { TestTube, Plus, Trash2, Save, Bookmark } from 'lucide-react';

export const BufferCalculatorScreen: React.FC = () => {
  const { saveBufferRecipe, bufferRecipes } = useApp();
  const safeBufferRecipes = bufferRecipes || [];

  const [finalVol, setFinalVol] = useState('500');
  const [finalVolUnit, setFinalVolUnit] = useState('mL');

  const [components, setComponents] = useState<BufferComponent[]>([
    { id: '1', name: 'Tris-HCl (pH 8.0)', finalConc: 0.05, finalConcUnit: 'M', mw: 121.14, stockConc: null, stockConcUnit: 'M' },
    { id: '2', name: 'EDTA (pH 8.0)', finalConc: 0.01, finalConcUnit: 'M', mw: 292.24, stockConc: 0.5, stockConcUnit: 'M' },
    { id: '3', name: 'NaCl', finalConc: 0.15, finalConcUnit: 'M', mw: 58.44, stockConc: null, stockConcUnit: 'M' },
  ]);

  const [recipeName, setRecipeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BufferComponentCalc[] | null>(null);

  const handleAddComponent = () => {
    setComponents([
      ...components,
      {
        id: Date.now().toString(),
        name: `Component ${components.length + 1}`,
        finalConc: 0.01,
        finalConcUnit: 'M',
        mw: 100,
        stockConc: null,
        stockConcUnit: 'M',
      },
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const handleUpdateComponent = (id: string, field: keyof BufferComponent, value: unknown) => {
    setComponents(
      components.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleCalculate = () => {
    setError(null);
    try {
      const fv = parseFloat(finalVol);
      const calcs = calculateBuffer(fv, finalVolUnit, components);
      setResults(calcs);
    } catch (err) {
      setResults(null);
      setError((err as Error).message);
    }
  };

  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      setError('Please enter a buffer recipe name to save.');
      return;
    }
    const fv = parseFloat(finalVol) || 500;

    saveBufferRecipe({
      name: recipeName.trim(),
      finalVolume: fv,
      finalVolumeUnit: finalVolUnit,
      components,
    });

    setIsSaving(false);
    setRecipeName('');
    alert('Buffer Recipe saved successfully!');
  };

  const handleLoadRecipe = (recId: number) => {
    const rec = bufferRecipes.find(r => r.id === recId);
    if (!rec) return;
    setFinalVol(rec.finalVolume.toString());
    setFinalVolUnit(rec.finalVolumeUnit);
    setComponents(rec.components);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
          <TestTube className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Medium & Buffer Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Formulate complex growth media or buffer recipes from dry powder mass or stock solutions.
          </p>
        </div>
      </div>

      {/* Saved Buffer Recipes */}
      {safeBufferRecipes.length > 0 && (
        <div className="bg-teal-50/60 dark:bg-teal-950/30 p-3 rounded-2xl border border-teal-200 dark:border-teal-800/80">
          <span className="text-xs font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5 mb-2">
            <Bookmark className="w-3.5 h-3.5" /> Saved Buffer Recipes
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {safeBufferRecipes.map(r => (
              <button
                key={r.id}
                onClick={() => handleLoadRecipe(r.id)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 border border-teal-200 dark:border-teal-800 hover:border-teal-500 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {r.name} ({r.finalVolume} {r.finalVolumeUnit})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <MtkTextField
          label="Total Desired Buffer Volume"
          value={finalVol}
          onChange={e => setFinalVol(e.target.value)}
          unit={finalVolUnit}
          unitOptions={['mL', 'L', 'µL']}
          onUnitChange={setFinalVolUnit}
        />

        {/* Dynamic Components */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Buffer Reagents ({components.length})
            </h3>
            <button
              onClick={handleAddComponent}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Component
            </button>
          </div>

          <div className="space-y-3">
            {components.map(comp => (
              <div
                key={comp.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={comp.name}
                    onChange={e => handleUpdateComponent(comp.id, 'name', e.target.value)}
                    placeholder="Component Name"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={() => handleRemoveComponent(comp.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Final Conc:</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={comp.finalConc}
                        onChange={e => handleUpdateComponent(comp.id, 'finalConc', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono"
                      />
                      <select
                        value={comp.finalConcUnit}
                        onChange={e => handleUpdateComponent(comp.id, 'finalConcUnit', e.target.value)}
                        className="px-1.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      >
                        {['M', 'mM', 'µM', 'g/L', 'mg/mL', '%'].map(u => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">MW (g/mol) [Solid]:</label>
                    <input
                      type="number"
                      value={comp.mw || ''}
                      onChange={e => handleUpdateComponent(comp.id, 'mw', parseFloat(e.target.value) || null)}
                      placeholder="e.g. 58.44"
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Stock Conc [Liquid]:</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={comp.stockConc || ''}
                        onChange={e => handleUpdateComponent(comp.id, 'stockConc', parseFloat(e.target.value) || null)}
                        placeholder="e.g. 0.5"
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono"
                      />
                      <select
                        value={comp.stockConcUnit || 'M'}
                        onChange={e => handleUpdateComponent(comp.id, 'stockConcUnit', e.target.value)}
                        className="px-1.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      >
                        {['M', 'mM', '%'].map(u => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
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
            Calculate Preparation
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Save Buffer Recipe</h3>
            <MtkTextField
              label="Recipe Name"
              placeholder="e.g. 1X TE Buffer (pH 8.0)"
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

      {/* Results Table */}
      {results && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            Buffer Formulation Schedule ({finalVol} {finalVolUnit})
          </h3>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <th className="py-2 px-2">Reagent</th>
                <th className="py-2 px-2 text-right">Quantity Required</th>
                <th className="py-2 px-2">Preparation Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono">
              {results.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-slate-100">{c.name}</td>
                  <td className="py-2.5 px-2 text-right font-extrabold text-teal-700 dark:text-teal-400">
                    {c.quantityNeeded.toFixed(3)} {c.unit}
                  </td>
                  <td className="py-2.5 px-2 text-slate-500 dark:text-slate-400 text-[11px] font-sans">
                    {c.notes}
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
