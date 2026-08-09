import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CalibrationPoint } from '../../types';
import { MtkCard } from '../common/MtkCard';
import { exportToCSV, generatePDFReport } from '../../utils/exportService';
import {
  TrendingUp,
  Plus,
  Trash2,
  Save,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
  Calculator,
  Sparkles,
} from 'lucide-react';

export const CalibrationCurveScreen: React.FC = () => {
  const { navigateBack, projects, storage } = useApp();

  const [assayTitle, setAssayTitle] = useState('BCA Protein Quantification Standard Curve');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Standard curve data points (Conc X, Abs Y)
  const [points, setPoints] = useState<CalibrationPoint[]>([
    { concentration: 0, absorbance: 0.02 },
    { concentration: 125, absorbance: 0.15 },
    { concentration: 250, absorbance: 0.29 },
    { concentration: 500, absorbance: 0.58 },
    { concentration: 750, absorbance: 0.86 },
    { concentration: 1000, absorbance: 1.15 },
  ]);

  // Unknown sample calculation
  const [unknownAbs, setUnknownAbs] = useState<number>(0.45);
  const [notes, setNotes] = useState('BCA Microplate Assay at 562 nm absorbance.');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Perform Linear Regression Analysis (Y = mX + c)
  const calculateRegression = () => {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };

    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0,
      sumY2 = 0;

    points.forEach((p) => {
      sumX += p.concentration;
      sumY += p.absorbance;
      sumXY += p.concentration * p.absorbance;
      sumX2 += p.concentration * p.concentration;
      sumY2 += p.absorbance * p.absorbance;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const num = n * sumXY - sumX * sumY;
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = den !== 0 ? num / den : 0;
    const rSquared = r * r;

    return { slope, intercept, rSquared };
  };

  const { slope, intercept, rSquared } = calculateRegression();

  // Calculated Unknown Concentration X = (Y - c) / m
  const unknownConc = slope !== 0 ? (unknownAbs - intercept) / slope : 0;

  // Add / Remove Points
  const addPoint = () => {
    const lastX = points.length > 0 ? points[points.length - 1].concentration + 100 : 0;
    setPoints([...points, { concentration: lastX, absorbance: 0.1 }]);
  };

  const updatePoint = (index: number, field: 'concentration' | 'absorbance', val: number) => {
    const updated = [...points];
    updated[index][field] = val;
    setPoints(updated);
  };

  const removePoint = (index: number) => {
    if (points.length <= 2) {
      alert('At least 2 points are required for linear regression.');
      return;
    }
    setPoints(points.filter((_, i) => i !== index));
  };

  // Draw Regression Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 300;

    const padding = 50;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Axes bounds
    const maxX = Math.max(...points.map((p) => p.concentration), 10);
    const maxY = Math.max(...points.map((p) => p.absorbance), 0.1);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = padding + (width / 5) * i;
      const y = padding + (height / 5) * i;

      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Regression Line
    if (slope !== 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const x1 = 0;
      const y1 = intercept;
      const x2 = maxX;
      const y2 = slope * maxX + intercept;

      const px1 = padding + (x1 / maxX) * width;
      const py1 = canvas.height - padding - (y1 / maxY) * height;
      const px2 = padding + (x2 / maxX) * width;
      const py2 = canvas.height - padding - (y2 / maxY) * height;

      ctx.moveTo(px1, py1);
      ctx.lineTo(px2, py2);
      ctx.stroke();
    }

    // Plot Data Points
    points.forEach((p) => {
      const px = padding + (p.concentration / maxX) * width;
      const py = canvas.height - padding - (p.absorbance / maxY) * height;

      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Unknown Sample Point
    if (unknownAbs > 0 && unknownConc > 0) {
      const upx = padding + (unknownConc / maxX) * width;
      const upy = canvas.height - padding - (unknownAbs / maxY) * height;

      ctx.beginPath();
      ctx.arc(upx, upy, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [points, slope, intercept, unknownAbs, unknownConc]);

  // Save Session
  const handleSave = () => {
    const saved = storage.saveCalibrationCurve({
      title: assayTitle,
      slope,
      intercept,
      rSquared,
      points,
      unknownAbsorbance: unknownAbs,
      unknownCalculatedValue: unknownConc,
      notes,
      projectId: selectedProjectId,
    });
    alert(`Calibration Curve "${saved.title}" saved!`);
  };

  // Export CSV / PDF
  const handleExportCSV = () => {
    const headers = ['Concentration (X)', 'Absorbance (Y)'];
    const rows = points.map((p) => [p.concentration, p.absorbance]);
    exportToCSV(`${assayTitle.replace(/\s+/g, '_')}_calibration`, headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ['Std Point', 'Concentration (X)', 'Absorbance (Y)'];
    const rows = points.map((p, idx) => [`Std ${idx + 1}`, p.concentration, p.absorbance]);

    generatePDFReport({
      title: assayTitle,
      subtitle: 'Linear Regression Calibration Curve Report',
      meta: {
        'Formula (Y = mX + c)': `Y = ${slope.toFixed(4)}X + ${intercept.toFixed(4)}`,
        'R² Coefficient': rSquared.toFixed(4),
        'Unknown Absorbance': unknownAbs,
        'Calculated Unknown Conc': `${unknownConc.toFixed(2)} µg/mL`,
        Project: projects.find((p) => p.id === selectedProjectId)?.name || 'Unassigned',
      },
      tableHeaders: headers,
      tableRows: rows,
      notes,
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
          MOLECULAR BIOLOGY
        </span>
      </div>

      {/* Main Banner */}
      <div className="bg-slate-900 dark:bg-[#121215] text-white p-5 rounded-2xl border-2 border-slate-900 dark:border-white/20">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-teal-400 stroke-[2.5]" />
          <h1 className="text-xl font-black uppercase tracking-tighter">
            CALIBRATION CURVE & REGRESSION
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Linear regression fit, R² value, slope, intercept & unknown concentration calculation.
        </p>
      </div>

      {/* REGRESSION EQUATION METRICS CARD */}
      <MtkCard className="p-4 bg-teal-950/40 border-2 border-teal-500/40 space-y-3">
        <div className="text-[10px] font-mono font-black uppercase tracking-widest text-teal-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          LINEAR REGRESSION MODEL
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900 p-3 rounded-xl border border-teal-500/30">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
              Equation (Y = mX + c)
            </span>
            <div className="text-sm font-mono font-black text-white mt-0.5">
              Y = {slope.toFixed(4)}X + {intercept.toFixed(4)}
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-teal-500/30">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
              R² Fit Coefficient
            </span>
            <div
              className={`text-sm font-mono font-black mt-0.5 ${
                rSquared >= 0.98 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              R² = {rSquared.toFixed(4)}{' '}
              {rSquared >= 0.98 ? '(Excellent)' : '(Moderate)'}
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-teal-500/30">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
              Slope (m) & Intercept (c)
            </span>
            <div className="text-xs font-mono text-slate-300 mt-0.5">
              m = {slope.toFixed(5)} | c = {intercept.toFixed(5)}
            </div>
          </div>
        </div>
      </MtkCard>

      {/* GRAPH CANVAS */}
      <MtkCard className="p-3 border-2 border-slate-900 dark:border-white/20 bg-slate-950 text-white flex flex-col items-center">
        <canvas ref={canvasRef} className="max-w-full rounded-lg" />
      </MtkCard>

      {/* STANDARDS TABLE */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
            Standard Concentrations & Absorbance
          </h3>
          <button
            onClick={addPoint}
            className="px-2.5 py-1 bg-teal-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Standard
          </button>
        </div>

        <div className="space-y-2">
          {points.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <span className="w-6 font-mono text-[10px] font-bold text-slate-500 text-center">
                #{idx + 1}
              </span>
              <div className="flex-1">
                <label className="text-[8px] font-mono uppercase text-slate-400 block">
                  Concentration (X)
                </label>
                <input
                  type="number"
                  value={p.concentration}
                  onChange={(e) => updatePoint(idx, 'concentration', Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs font-mono font-bold"
                />
              </div>
              <div className="flex-1">
                <label className="text-[8px] font-mono uppercase text-slate-400 block">
                  Absorbance (Y)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={p.absorbance}
                  onChange={(e) => updatePoint(idx, 'absorbance', Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs font-mono font-bold"
                />
              </div>
              <button
                onClick={() => removePoint(idx)}
                className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </MtkCard>

      {/* UNKNOWN CONCENTRATION SOLVER */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-slate-800">
        <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-teal-600" />
          Solve Unknown Sample Concentration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
              Measured Absorbance (Y)
            </label>
            <input
              type="number"
              step="0.01"
              value={unknownAbs}
              onChange={(e) => setUnknownAbs(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono font-black text-slate-900 dark:text-white"
            />
          </div>

          <div className="bg-teal-600 text-white p-3 rounded-xl">
            <span className="text-[9px] font-mono uppercase text-teal-200">
              Calculated Concentration (X)
            </span>
            <div className="text-xl font-mono font-black mt-0.5">
              {unknownConc > 0 ? unknownConc.toFixed(2) : '0.00'} units
            </div>
          </div>
        </div>
      </MtkCard>

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
