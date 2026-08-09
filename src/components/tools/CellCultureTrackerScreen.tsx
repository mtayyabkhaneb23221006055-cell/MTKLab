import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CellCultureRecord } from '../../types';
import { MtkCard } from '../common/MtkCard';
import { exportToCSV, generatePDFReport } from '../../utils/exportService';
import {
  CalendarCheck,
  Plus,
  Save,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
  Calendar,
  Layers,
  FlaskConical,
} from 'lucide-react';

export const CellCultureTrackerScreen: React.FC = () => {
  const { navigateBack, projects, storage } = useApp();

  const [cellLine, setCellLine] = useState('HeLa Human Cervical Carcinoma');
  const [vesselType, setVesselType] = useState('T-75 Flask');
  const [passageNumber, setPassageNumber] = useState('P14');
  const [confluency, setConfluency] = useState(85);
  const [mediaType, setMediaType] = useState('DMEM High Glucose + 10% FBS + 1% P/S');
  const [splitRatio, setSplitRatio] = useState('1:4');
  const [seedingDensity, setSeedingDensity] = useState('5.0 x 10^5 cells');
  const [notes, setNotes] = useState('Healthy morphology, standard 48h subculture cycle.');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [records, setRecords] = useState<CellCultureRecord[]>([]);

  useEffect(() => {
    setRecords(storage.getCellCultureRecords());
  }, [storage]);

  // Add Record
  const handleAddRecord = () => {
    const saved = storage.saveCellCultureRecord({
      cellLine,
      vesselType,
      passageNumber,
      confluency,
      mediaType,
      splitRatio,
      seedingDensity,
      notes,
      date: new Date().toISOString().split('T')[0],
      projectId: selectedProjectId,
    });
    setRecords(storage.getCellCultureRecords());
    alert(`Passage Record "${saved.passageNumber}" logged successfully!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Cell Line',
      'Vessel',
      'Passage',
      'Confluency (%)',
      'Media Type',
      'Split Ratio',
    ];
    const rows = records.map((r) => [
      r.date,
      r.cellLine,
      r.vesselType,
      r.passageNumber,
      r.confluency,
      r.mediaType,
      r.splitRatio,
    ]);
    exportToCSV(`Cell_Culture_Logs`, headers, rows);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    const headers = ['Date', 'Passage', 'Confluency', 'Split Ratio', 'Notes'];
    const rows = records.map((r) => [
      r.date,
      r.passageNumber,
      `${r.confluency}%`,
      r.splitRatio,
      r.notes,
    ]);

    generatePDFReport({
      title: `${cellLine} Culture History Log`,
      subtitle: 'Cell Biology Passage & Subculture Maintenance Record',
      meta: {
        'Cell Line': cellLine,
        'Current Vessel': vesselType,
        'Total Logged Passages': records.length,
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
          <CalendarCheck className="w-6 h-6 text-teal-400 stroke-[2.5]" />
          <h1 className="text-xl font-black uppercase tracking-tighter">
            CELL CULTURE PASSAGE TRACKER
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Log subcultures, confluency timeline, splitting ratios & incubation schedules.
        </p>
      </div>

      {/* NEW PASSAGE LOG FORM */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15">
        <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-teal-600" /> Log New Subculture Record
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Cell Line</label>
            <input
              type="text"
              value={cellLine}
              onChange={(e) => setCellLine(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Vessel Type</label>
            <select
              value={vesselType}
              onChange={(e) => setVesselType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-bold"
            >
              <option value="T-25 Flask">T-25 Flask</option>
              <option value="T-75 Flask">T-75 Flask</option>
              <option value="T-175 Flask">T-175 Flask</option>
              <option value="6-Well Plate">6-Well Plate</option>
              <option value="100mm Dish">100mm Dish</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Passage No.</label>
            <input
              type="text"
              value={passageNumber}
              onChange={(e) => setPassageNumber(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">
              Confluency: {confluency}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={confluency}
              onChange={(e) => setConfluency(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Split Ratio</label>
            <input
              type="text"
              value={splitRatio}
              onChange={(e) => setSplitRatio(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">
              Seeding Density
            </label>
            <input
              type="text"
              value={seedingDensity}
              onChange={(e) => setSeedingDensity(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-bold"
            />
          </div>
        </div>

        <button
          onClick={handleAddRecord}
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Passage Record
        </button>
      </MtkCard>

      {/* LOGGED PASSAGES TIMELINE */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15">
        <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
          Passage History Timeline ({records.length})
        </h3>

        {records.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No cell culture logs saved yet.</p>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div
                key={r.id}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-teal-600 dark:text-teal-400">
                    {r.passageNumber} — {r.cellLine}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{r.date}</span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Vessel: {r.vesselType} | Confluency: {r.confluency}% | Ratio: {r.splitRatio}
                </div>
              </div>
            ))}
          </div>
        )}
      </MtkCard>

      {/* EXPORT BUTTONS */}
      <div className="grid grid-cols-2 gap-2">
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
