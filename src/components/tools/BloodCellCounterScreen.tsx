import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MtkCard } from '../common/MtkCard';
import { exportToCSV, generatePDFReport } from '../../utils/exportService';
import {
  Activity,
  Plus,
  RotateCcw,
  Save,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

interface BloodCellCategory {
  id: string;
  name: string;
  keyLabel: string;
  count: number;
  color: string;
}

export const BloodCellCounterScreen: React.FC = () => {
  const { navigateBack, projects, storage } = useApp();

  const [sessionTitle, setSessionTitle] = useState('Peripheral Blood Smear Differential');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [categories, setCategories] = useState<BloodCellCategory[]>([
    { id: 'neu', name: 'Neutrophils', keyLabel: 'NEU', count: 54, color: '#2563eb' },
    { id: 'lym', name: 'Lymphocytes', keyLabel: 'LYM', count: 28, color: '#0d9488' },
    { id: 'mon', name: 'Monocytes', keyLabel: 'MON', count: 8, color: '#d97706' },
    { id: 'eos', name: 'Eosinophils', keyLabel: 'EOS', count: 4, color: '#e11d48' },
    { id: 'bas', name: 'Basophils', keyLabel: 'BAS', count: 1, color: '#7c3aed' },
    { id: 'rbc', name: 'RBC Morph', keyLabel: 'RBC', count: 120, color: '#dc2626' },
    { id: 'plt', name: 'Platelets', keyLabel: 'PLT', count: 45, color: '#059669' },
  ]);

  const wbcCategories = categories.filter((c) => ['neu', 'lym', 'mon', 'eos', 'bas'].includes(c.id));
  const totalWBC = wbcCategories.reduce((sum, c) => sum + c.count, 0);
  const grandTotal = categories.reduce((sum, c) => sum + c.count, 0);

  // Increment
  const increment = (id: string) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, count: c.count + 1 } : c))
    );
  };

  // Reset
  const resetAll = () => {
    setCategories(categories.map((c) => ({ ...c, count: 0 })));
  };

  // Save Session
  const handleSave = () => {
    const saved = storage.saveBloodCellCount({
      title: sessionTitle,
      neutrophils: categories.find((c) => c.id === 'neu')?.count || 0,
      lymphocytes: categories.find((c) => c.id === 'lym')?.count || 0,
      monocytes: categories.find((c) => c.id === 'mon')?.count || 0,
      eosinophils: categories.find((c) => c.id === 'eos')?.count || 0,
      basophils: categories.find((c) => c.id === 'bas')?.count || 0,
      totalWBC,
      rbcCount: categories.find((c) => c.id === 'rbc')?.count || 0,
      plateletsCount: categories.find((c) => c.id === 'plt')?.count || 0,
      projectId: selectedProjectId,
    });
    alert(`Blood Differential "${saved.title}" saved!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Cell Type', 'Count', 'WBC Differential (%)'];
    const rows = categories.map((c) => [
      c.name,
      c.count,
      ['neu', 'lym', 'mon', 'eos', 'bas'].includes(c.id) && totalWBC > 0
        ? ((c.count / totalWBC) * 100).toFixed(1)
        : 'N/A',
    ]);
    exportToCSV(`${sessionTitle.replace(/\s+/g, '_')}_blood_diff`, headers, rows);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    const headers = ['Cell Type', 'Count', 'WBC Differential (%)'];
    const rows = categories.map((c) => [
      c.name,
      c.count,
      ['neu', 'lym', 'mon', 'eos', 'bas'].includes(c.id) && totalWBC > 0
        ? `${((c.count / totalWBC) * 100).toFixed(1)}%`
        : 'N/A',
    ]);

    generatePDFReport({
      title: sessionTitle,
      subtitle: 'Research Blood Cell Differential Counter Report',
      meta: {
        'Total WBC Counted': totalWBC,
        'Grand Total Events': grandTotal,
        'N/L Ratio':
          categories.find((c) => c.id === 'lym')?.count! > 0
            ? (
                categories.find((c) => c.id === 'neu')?.count! /
                categories.find((c) => c.id === 'lym')?.count!
              ).toFixed(2)
            : 'N/A',
        Project: projects.find((p) => p.id === selectedProjectId)?.name || 'Unassigned',
      },
      tableHeaders: headers,
      tableRows: rows,
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121215] p-3 rounded-xl border-2 border-slate-300 dark:border-white/15 shadow-sm">
        <button
          onClick={navigateBack}
          className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-700 dark:text-slate-300 hover:text-teal-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Tools</span>
        </button>
        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800">
          CELL BIOLOGY
        </span>
      </div>

      {/* Main Banner */}
      <div className="bg-slate-900 dark:bg-[#121215] text-white p-5 rounded-2xl border-2 border-slate-900 dark:border-white/20">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-teal-400 stroke-[2.5]" />
          <h1 className="text-xl font-black uppercase tracking-tighter">
            BLOOD CELL DIFFERENTIAL COUNTER
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Research-grade WBC differential keypad, RBC morphology & platelet counter.
        </p>
      </div>

      {/* RESEARCH USE DISCLAIMER */}
      <div className="bg-amber-500/10 border-2 border-amber-500/40 p-3 rounded-xl text-amber-700 dark:text-amber-400 flex items-start gap-2 text-xs">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p className="font-medium">
          <strong>Research & Educational Use Only:</strong> This counter is designed strictly for laboratory research and academic analysis.
        </p>
      </div>

      {/* GRAND WBC SCORE BANNER */}
      <MtkCard className="p-4 bg-slate-900 text-white border-2 border-slate-900 dark:border-white/20 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-teal-400 font-bold tracking-widest">
            TOTAL WBC COUNTED (Goal: 100)
          </span>
          <div className="text-3xl font-mono font-black text-white mt-0.5">{totalWBC} / 100</div>
        </div>
        <button
          onClick={resetAll}
          className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-black uppercase flex items-center gap-1 cursor-pointer border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </MtkCard>

      {/* TOUCH KEYPAD COUNTER GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {categories.map((c) => {
          const isWbc = ['neu', 'lym', 'mon', 'eos', 'bas'].includes(c.id);
          const pct = isWbc && totalWBC > 0 ? ((c.count / totalWBC) * 100).toFixed(1) : '-';

          return (
            <button
              key={c.id}
              onClick={() => increment(c.id)}
              className="p-3 bg-white dark:bg-[#121215] border-2 border-slate-300 dark:border-white/15 hover:border-teal-500 rounded-2xl flex flex-col justify-between h-28 text-left transition-all active:scale-95 cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase text-white"
                  style={{ backgroundColor: c.color }}
                >
                  {c.keyLabel}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">{pct}%</span>
              </div>

              <div className="my-1">
                <div className="text-2xl font-mono font-black text-slate-900 dark:text-white">
                  {c.count}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase truncate">
                  {c.name}
                </div>
              </div>

              <div className="w-full text-right text-[9px] font-mono font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider group-hover:underline">
                + Tap to Count
              </div>
            </button>
          );
        })}
      </div>

      {/* EXPORT BUTTONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          onClick={handleSave}
          className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Differential
        </button>
        <button
          onClick={handleExportCSV}
          className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          CSV Export
        </button>
        <button
          onClick={handleExportPDF}
          className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
        >
          <FileText className="w-4 h-4 text-sky-400" />
          PDF Report
        </button>
      </div>
    </div>
  );
};
