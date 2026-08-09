import React, { useState } from 'react';
import { evaluate } from 'mathjs';
import { Calculator, Delete, RotateCcw } from 'lucide-react';

export const ScientificCalculatorScreen: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState(false);

  const appendToken = (token: string) => {
    setError(false);
    setExpression(prev => prev + token);
  };

  const handleClear = () => {
    setExpression('');
    setResult('0');
    setError(false);
  };

  const handleDelete = () => {
    setError(false);
    setExpression(prev => prev.slice(0, -1));
  };

  const handleEvaluate = () => {
    if (!expression.trim()) return;
    try {
      // Format operators for mathjs parsing
      let sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/√\(/g, 'sqrt(')
        .replace(/log\(/g, 'log10(')
        .replace(/ln\(/g, 'log(');

      const res = evaluate(sanitized);
      const resFormatted = typeof res === 'number' ? Number(res.toFixed(8)).toString() : String(res);

      setResult(resFormatted);
      setHistory(prev => [ `${expression} = ${resFormatted}`, ...prev.slice(0, 4) ]);
      setError(false);
    } catch {
      setResult('Error');
      setError(true);
    }
  };

  const handleUseResult = () => {
    if (result !== '0' && result !== 'Error') {
      setExpression(result);
      setError(false);
    }
  };

  const keyPadButtons = [
    [
      { label: 'C', action: handleClear, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold' },
      { label: '(', action: () => appendToken('('), color: 'bg-slate-100 dark:bg-slate-800' },
      { label: ')', action: () => appendToken(')'), color: 'bg-slate-100 dark:bg-slate-800' },
      { label: '÷', action: () => appendToken('÷'), color: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold' },
    ],
    [
      { label: '√', action: () => appendToken('√('), color: 'bg-slate-100 dark:bg-slate-800' },
      { label: '^', action: () => appendToken('^'), color: 'bg-slate-100 dark:bg-slate-800' },
      { label: 'log', action: () => appendToken('log('), color: 'bg-slate-100 dark:bg-slate-800' },
      { label: '×', action: () => appendToken('×'), color: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold' },
    ],
    [
      { label: '7', action: () => appendToken('7'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: '8', action: () => appendToken('8'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: '9', action: () => appendToken('9'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: '-', action: () => appendToken('-'), color: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold' },
    ],
    [
      { label: '4', action: () => appendToken('4'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: '5', action: () => appendToken('5'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: '6', action: () => appendToken('6'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: '+', action: () => appendToken('+'), color: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold' },
    ],
    [
      { label: '1', action: () => appendToken('1'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: '2', action: () => appendToken('2'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: '3', action: () => appendToken('3'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: 'ln', action: () => appendToken('ln('), color: 'bg-slate-100 dark:bg-slate-800' },
    ],
    [
      { label: '0', action: () => appendToken('0'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: '.', action: () => appendToken('.'), color: 'bg-white dark:bg-slate-900 font-bold' },
      { label: 'e', action: () => appendToken('e'), color: 'bg-slate-100 dark:bg-slate-800' },
      { label: '=', action: handleEvaluate, color: 'bg-teal-600 text-white font-extrabold shadow-sm' },
    ],
  ];

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Scientific Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Expression evaluator with powers, square roots, logs, and scientific notation.
          </p>
        </div>
      </div>

      {/* Calculator Display Screen */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono min-h-6 overflow-x-auto">
          <span>{expression || '0'}</span>
          <button
            onClick={handleDelete}
            className="p-1 hover:text-rose-400 cursor-pointer"
            title="Delete backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        <div
          onClick={handleUseResult}
          className={`text-3xl font-extrabold font-mono tracking-tight text-right ${
            error ? 'text-rose-400' : 'text-teal-300'
          } cursor-pointer`}
          title="Click to use result in next expression"
        >
          {result}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="space-y-2">
        {keyPadButtons.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-4 gap-2">
            {row.map((btn, bIdx) => (
              <button
                key={bIdx}
                onClick={btn.action}
                className={`py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm transition-all active:scale-95 shadow-2xs cursor-pointer ${btn.color}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Calculations</h4>
          <div className="space-y-1 font-mono text-xs text-slate-700 dark:text-slate-300">
            {history.map((item, idx) => (
              <div key={idx} className="truncate">
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
