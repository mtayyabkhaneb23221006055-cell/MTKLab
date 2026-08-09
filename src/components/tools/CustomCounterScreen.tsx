import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MtkCard } from '../common/MtkCard';
import { exportToCSV, generatePDFReport } from '../../utils/exportService';
import {
  ListPlus,
  Plus,
  Minus,
  RotateCcw,
  Save,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
  Trash2,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  color: string;
}

const CATEGORY_COLORS = ['#0d9488', '#2563eb', '#d97706', '#e11d48', '#7c3aed', '#059669'];

export const CustomCounterScreen: React.FC = () => {
  const { navigateBack, projects, storage } = useApp();

  const [sessionTitle, setSessionTitle] = useState('Morphology Microscopic Tally');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 'cat_1', name: 'Gram-Positive Bacilli', count: 18, color: '#0d9488' },
    { id: 'cat_2', name: 'Gram-Negative Bacilli', count: 42, color: '#2563eb' },
    { id: 'cat_3', name: 'Gram-Positive Cocci', count: 25, color: '#d97706' },
  ]);

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  // Increment / Decrement
  const increment = (id: string) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, count: c.count + 1 } : c))
    );
  };

  const decrement = (id: string) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, count: Math.max(0, c.count - 1) } : c))
    );
  };

  // Add Category
  const addCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: CategoryItem = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      count: 0,
      color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
  };

  // Reset
  const resetAll = () => {
    setCategories(categories.map((c) => ({ ...c, count: 0 })));
  };

  // Save Session
  const handleSave = () => {
    const saved = storage.saveCustomCounter({
      title: sessionTitle,
      categories,
      totalCount,
      projectId: selectedProjectId,
    });
    alert(`Custom Tally Session "${saved.title}" saved!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Category', 'Count', 'Percentage (%)'];
    const rows = categories.map((c) => [
      c.name,
      c.count,
      totalCount > 0 ? ((c.count / totalCount) * 100).toFixed(1) : '0.0',
    ]);
    exportToCSV(`${sessionTitle.replace(/\s+/g, '_')}_tally`, headers, rows);
  };

  // Export PDF
  const handleExportPDF = () => {
    const headers = ['Category Name', 'Total Count', 'Percentage (%)'];
    const rows = categories.map((c) => [
      c.name,
      c.count,
      totalCount > 0 ? `${((c.count / totalCount) * 100).toFixed(1)}%` : '0.0%',
    ]);

    generatePDFReport({
      title: sessionTitle,
      subtitle: 'Laboratory Custom Tally Count Report',
      meta: {
        'Total Tally Count': totalCount,
        'Categories Counted': categories.length,
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
          MICROBIOLOGY
        </span>
      </div>

      {/* Main Banner */}
      <div className="bg-slate-900 dark:bg-[#121215] text-white p-5 rounded-2xl border-2 border-slate-900 dark:border-white/20">
        <div className="flex items-center gap-2">
          <ListPlus className="w-6 h-6 text-teal-400 stroke-[2.5]" />
          <h1 className="text-xl font-black uppercase tracking-tighter">
            CUSTOM TALLY COUNTER
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Multi-category manual counting with touch feedback & ratio calculations.
        </p>
      </div>

      {/* Title & Project Inputs */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500">Session Title</label>
          <input
            type="text"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-bold"
          />
        </div>
      </MtkCard>

      {/* TOTAL GRAND SCORE CARD */}
      <MtkCard className="p-5 bg-slate-900 text-white border-2 border-slate-900 dark:border-white/20 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-teal-400 font-bold tracking-widest">
            TOTAL COUNTED ITEMS
          </span>
          <div className="text-4xl font-mono font-black mt-1 text-white">{totalCount}</div>
        </div>
        <button
          onClick={resetAll}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-slate-700"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </MtkCard>

      {/* ADD CATEGORY INPUT */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New category name (e.g., Yeast Cells)"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
        />
        <button
          onClick={addCategory}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* CATEGORY COUNTER CARDS */}
      <div className="space-y-2.5">
        {categories.map((c) => {
          const pct = totalCount > 0 ? ((c.count / totalCount) * 100).toFixed(1) : '0.0';
          return (
            <MtkCard
              key={c.id}
              className="p-4 border-2 border-slate-300 dark:border-white/15 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-black text-xs uppercase text-slate-900 dark:text-white">
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500">{pct}%</span>
                  <button
                    onClick={() => setCategories(categories.filter((cat) => cat.id !== c.id))}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: c.color }}
                />
              </div>

              {/* Tally Controls */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl font-mono font-black text-slate-900 dark:text-white">
                  {c.count}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decrement(c.id)}
                    className="w-10 h-10 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-900 dark:text-white rounded-xl font-black text-lg flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-5 h-5 stroke-[3]" />
                  </button>
                  <button
                    onClick={() => increment(c.id)}
                    className="w-14 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-lg flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-transform"
                  >
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </button>
                </div>
              </div>
            </MtkCard>
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
          Save Session
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
