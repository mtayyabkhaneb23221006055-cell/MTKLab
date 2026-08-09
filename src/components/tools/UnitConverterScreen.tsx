import React, { useState } from 'react';
import { MtkTextField } from '../common/MtkTextField';
import { MtkButton } from '../common/MtkButton';
import { UNIT_CATEGORIES, convertValue } from '../../utils/unitConverter';
import { Scale, ArrowRightLeft } from 'lucide-react';

export const UnitConverterScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('mass');
  const [fromValue, setFromValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('g');
  const [toUnit, setToUnit] = useState('mg');

  const currentCategoryObj = UNIT_CATEGORIES.find(c => c.id === activeCategory) || UNIT_CATEGORIES[0];

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    const catObj = UNIT_CATEGORIES.find(c => c.id === catId);
    if (catObj && catObj.units.length >= 2) {
      setFromUnit(catObj.units[0].id);
      setToUnit(catObj.units[1].id);
    }
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const valNum = parseFloat(fromValue);
  const convertedResult = isNaN(valNum) ? 0 : convertValue(activeCategory, valNum, fromUnit, toUnit);

  const formatDisplay = (num: number) => {
    if (isNaN(num)) return '0';
    if (num === 0) return '0';
    const abs = Math.abs(num);
    if (abs >= 1e6 || (abs < 1e-3 && abs > 0)) {
      return num.toExponential(4).replace('e+', 'e');
    }
    return Number(num.toFixed(6)).toString();
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Laboratory Unit Converter</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant conversion for lab metrics across SI, metric, and concentration scales.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl scrollbar-none">
        {UNIT_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Converter Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <MtkTextField
              label="From Value"
              value={fromValue}
              onChange={e => setFromValue(e.target.value)}
              unitOptions={currentCategoryObj.units.map(u => u.id)}
              unit={fromUnit}
              onUnitChange={setFromUnit}
            />
          </div>

          <div className="relative">
            <MtkTextField
              label="To Value (Converted)"
              value={formatDisplay(convertedResult)}
              readOnly
              unitOptions={currentCategoryObj.units.map(u => u.id)}
              unit={toUnit}
              onUnitChange={setToUnit}
              className="bg-slate-50 dark:bg-slate-800 font-extrabold font-mono text-teal-700 dark:text-teal-300"
            />
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <MtkButton variant="outlined" size="sm" icon={ArrowRightLeft} onClick={handleSwap}>
            Swap Units
          </MtkButton>
        </div>
      </div>
    </div>
  );
};
