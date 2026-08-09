import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PlateFormat, PlateWell, Plate } from '../../types';
import { MtkCard } from '../common/MtkCard';
import { exportToCSV, generatePDFReport } from '../../utils/exportService';
import {
  Grid3X3,
  Save,
  FileSpreadsheet,
  FileText,
  Copy,
  Trash2,
  Paintbrush,
  Check,
  Tag,
  ArrowLeft,
  FolderPlus,
} from 'lucide-react';

const WELL_COLOR_PRESETS = [
  { name: 'Teal Control', value: '#0d9488' },
  { name: 'Blue Sample', value: '#2563eb' },
  { name: 'Amber Treated', value: '#d97706' },
  { name: 'Rose Standard', value: '#e11d48' },
  { name: 'Purple Blank', value: '#7c3aed' },
  { name: 'Slate Empty', value: '#64748b' },
];

export const PlateLabellingScreen: React.FC = () => {
  const { navigateBack, projects, storage } = useApp();

  const [plateName, setPlateName] = useState('Experiment 96-Well Microplate');
  const [format, setFormat] = useState<PlateFormat>('96');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [wells, setWells] = useState<Record<string, PlateWell>>({});
  const [selectedWellIds, setSelectedWellIds] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<PlateWell[]>([]);

  // Well Edit Form
  const [batchLabel, setBatchLabel] = useState('Sample A');
  const [batchSampleId, setBatchSampleId] = useState('SMP-001');
  const [batchColor, setBatchColor] = useState('#2563eb');
  const [batchNotes, setBatchNotes] = useState('');
  const [plateNotes, setPlateNotes] = useState('Standard 96-well culture format.');

  // Saved Plates
  const [savedPlates, setSavedPlates] = useState<Plate[]>([]);

  useEffect(() => {
    setSavedPlates(storage.getPlates());
  }, [storage]);

  // Compute Grid Rows and Columns
  const getGridDimensions = (fmt: PlateFormat) => {
    switch (fmt) {
      case '6':
        return { rows: 2, cols: 3 };
      case '12':
        return { rows: 3, cols: 4 };
      case '24':
        return { rows: 4, cols: 6 };
      case '48':
        return { rows: 6, cols: 8 };
      case '96':
      default:
        return { rows: 8, cols: 12 };
    }
  };

  const { rows, cols } = getGridDimensions(format);

  // Initialize Well Grid
  useEffect(() => {
    const newWells: Record<string, PlateWell> = {};
    for (let r = 0; r < rows; r++) {
      const rowLetter = String.fromCharCode(65 + r);
      for (let c = 1; c <= cols; c++) {
        const key = `${rowLetter}${c}`;
        newWells[key] = {
          id: key,
          row: r + 1,
          col: c,
          label: wells[key]?.label || '',
          sampleId: wells[key]?.sampleId || '',
          description: wells[key]?.description || '',
          colorTag: wells[key]?.colorTag || '#ffffff',
          notes: wells[key]?.notes || '',
        };
      }
    }
    setWells(newWells);
    setSelectedWellIds([]);
  }, [format]);

  // Toggle Selection
  const toggleSelectWell = (wellId: string) => {
    setSelectedWellIds((prev) =>
      prev.includes(wellId) ? prev.filter((id) => id !== wellId) : [...prev, wellId]
    );
  };

  const selectAll = () => {
    setSelectedWellIds(Object.keys(wells));
  };

  const clearSelection = () => {
    setSelectedWellIds([]);
  };

  // Fill Selected Wells
  const applyToSelected = () => {
    if (selectedWellIds.length === 0) return;
    const updated = { ...wells };
    selectedWellIds.forEach((id, idx) => {
      updated[id] = {
        ...updated[id],
        label: `${batchLabel} ${selectedWellIds.length > 1 ? idx + 1 : ''}`.trim(),
        sampleId: batchSampleId,
        colorTag: batchColor,
        notes: batchNotes,
      };
    });
    setWells(updated);
  };

  // Clear Selected Wells Data
  const clearSelectedWellsData = () => {
    const updated = { ...wells };
    selectedWellIds.forEach((id) => {
      updated[id] = {
        ...updated[id],
        label: '',
        sampleId: '',
        description: '',
        colorTag: '#ffffff',
        notes: '',
      };
    });
    setWells(updated);
  };

  // Duplicate Pattern (Control, Sample 1, Sample 2...)
  const applyStandardPattern = () => {
    const updated = { ...wells };
    const wellKeys = Object.keys(updated);
    wellKeys.forEach((key, idx) => {
      if (idx % 12 === 0) {
        updated[key] = { ...updated[key], label: 'Control', colorTag: '#0d9488' };
      } else if (idx % 12 === 11) {
        updated[key] = { ...updated[key], label: 'Blank', colorTag: '#7c3aed' };
      } else {
        updated[key] = {
          ...updated[key],
          label: `Sample ${idx}`,
          sampleId: `SMP-${100 + idx}`,
          colorTag: '#2563eb',
        };
      }
    });
    setWells(updated);
  };

  // Save Plate
  const handleSave = () => {
    const saved = storage.savePlate({
      name: plateName,
      plateType: format,
      wells,
      projectId: selectedProjectId,
      notes: plateNotes,
    });
    setSavedPlates(storage.getPlates());
    alert(`Plate map "${saved.name}" saved successfully!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Well ID', 'Row', 'Column', 'Label', 'Sample ID', 'Color Tag', 'Notes'];
    const wellList = Object.values(wells) as PlateWell[];
    const rowsList = wellList.map((w) => [
      w.id,
      w.row,
      w.col,
      w.label,
      w.sampleId,
      w.colorTag,
      w.notes,
    ]);
    exportToCSV(`${plateName.replace(/\s+/g, '_')}_wells`, headers, rowsList);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    const tableHeaders = ['Well', 'Label', 'Sample ID', 'Notes'];
    const wellList = Object.values(wells) as PlateWell[];
    const tableRows = wellList
      .filter((w) => w.label || w.sampleId)
      .map((w) => [w.id, w.label || '-', w.sampleId || '-', w.notes || '-']);

    generatePDFReport({
      title: plateName,
      subtitle: `${format}-Well Microplate Layout Map`,
      meta: {
        'Plate Format': `${format}-Well Grid`,
        'Total Populated Wells': wellList.filter((w) => w.label).length,
        Project: projects.find((p) => p.id === selectedProjectId)?.name || 'Unassigned',
      },
      tableHeaders,
      tableRows,
      notes: plateNotes,
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121215] p-3 rounded-xl border-2 border-slate-300 dark:border-white/15 shadow-sm">
        <button
          onClick={navigateBack}
          className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Tools</span>
        </button>
        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800">
          MICROBIOLOGY
        </span>
      </div>

      {/* Main Title Banner */}
      <div className="bg-slate-900 dark:bg-[#121215] text-white p-5 rounded-2xl border-2 border-slate-900 dark:border-white/20">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-6 h-6 text-teal-400 stroke-[2.5]" />
          <h1 className="text-xl font-black uppercase tracking-tighter">
            INTERACTIVE PLATE LABELLING
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Custom 6, 12, 24, 48, or 96-well grid mapping with color tags and batch fill.
        </p>
      </div>

      {/* Configuration Form */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Plate Map Name
            </label>
            <input
              type="text"
              value={plateName}
              onChange={(e) => setPlateName(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Plate Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as PlateFormat)}
              className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="6">6-Well Plate (2×3)</option>
              <option value="12">12-Well Plate (3×4)</option>
              <option value="24">24-Well Plate (4×6)</option>
              <option value="48">48-Well Plate (6×8)</option>
              <option value="96">96-Well Plate (8×12)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Link to Project (Optional)
          </label>
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
            className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="">-- Standalone (No Project) --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </MtkCard>

      {/* Batch Tools Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border-2 border-slate-300 dark:border-white/10 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Selected Wells: <span className="text-teal-600 font-mono">{selectedWellIds.length}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={selectAll}
              className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-[10px] font-black uppercase"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-[10px] font-black uppercase"
            >
              Deselect
            </button>
            <button
              onClick={applyStandardPattern}
              className="px-2.5 py-1 bg-teal-600 text-white rounded-md text-[10px] font-black uppercase"
            >
              Auto-Fill Pattern
            </button>
          </div>
        </div>

        {/* Batch Input controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-300 dark:border-slate-700">
          <div>
            <input
              type="text"
              placeholder="Label e.g. Sample A"
              value={batchLabel}
              onChange={(e) => setBatchLabel(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Sample ID e.g. SMP-001"
              value={batchSampleId}
              onChange={(e) => setBatchSampleId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {WELL_COLOR_PRESETS.map((cp) => (
                <button
                  key={cp.value}
                  onClick={() => setBatchColor(cp.value)}
                  className={`w-6 h-6 rounded-full border ${
                    batchColor === cp.value ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: cp.value }}
                  title={cp.name}
                />
              ))}
            </div>
            <button
              onClick={applyToSelected}
              className="flex-1 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-md text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1"
            >
              <Paintbrush className="w-3.5 h-3.5" />
              Fill Wells
            </button>
          </div>
        </div>
      </div>

      {/* PLATE GRID VIEW */}
      <MtkCard className="p-4 border-2 border-slate-900 dark:border-white/20 bg-slate-950 text-white overflow-x-auto">
        <div className="min-w-[340px]">
          {/* Column Header Numbers */}
          <div className="flex mb-1.5 pl-6">
            {Array.from({ length: cols }, (_, i) => (
              <div
                key={i}
                className="flex-1 text-center font-mono text-[10px] font-bold text-slate-400"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          {Array.from({ length: rows }, (_, r) => {
            const rowLetter = String.fromCharCode(65 + r);
            return (
              <div key={r} className="flex items-center gap-1 mb-1">
                {/* Row Letter */}
                <div className="w-5 font-mono text-[11px] font-bold text-slate-400 text-center">
                  {rowLetter}
                </div>

                {/* Row Wells */}
                <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                  {Array.from({ length: cols }, (_, c) => {
                    const key = `${rowLetter}${c + 1}`;
                    const well = wells[key];
                    const isSelected = selectedWellIds.includes(key);
                    const hasData = well && well.label;

                    return (
                      <button
                        key={key}
                        onClick={() => toggleSelectWell(key)}
                        className={`aspect-square rounded-full flex flex-col items-center justify-center border transition-all relative cursor-pointer ${
                          isSelected
                            ? 'ring-4 ring-teal-400 border-white scale-105 z-10'
                            : 'border-slate-700 hover:border-slate-400'
                        }`}
                        style={{
                          backgroundColor: hasData ? well.colorTag : '#1e293b',
                          color: hasData ? '#ffffff' : '#94a3b8',
                        }}
                        title={`${key}: ${well?.label || 'Empty'} (${well?.sampleId || 'No ID'})`}
                      >
                        <span className="text-[9px] font-mono font-black drop-shadow">
                          {key}
                        </span>
                        {hasData && (
                          <span className="text-[7px] font-bold truncate max-w-[90%] px-0.5 leading-tight drop-shadow">
                            {well.label.slice(0, 5)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </MtkCard>

      {/* Action Buttons & Export */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={handleSave}
          className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Map
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
        <button
          onClick={clearSelectedWellsData}
          className="p-3 bg-rose-900/80 hover:bg-rose-900 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Clear Wells
        </button>
      </div>
    </div>
  );
};
