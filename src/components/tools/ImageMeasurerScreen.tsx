import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MeasurementLine } from '../../types';
import { MtkCard } from '../common/MtkCard';
import { generateSampleMicroscopyImage } from '../../utils/imageProcessing';
import { exportToCSV, generatePDFReport, exportImageToFormat } from '../../utils/exportService';
import {
  Ruler,
  Camera,
  Upload,
  Save,
  FileSpreadsheet,
  FileText,
  Trash2,
  ArrowLeft,
  Sparkles,
  Check,
  RefreshCw,
} from 'lucide-react';

export const ImageMeasurerScreen: React.FC = () => {
  const { navigateBack, projects, storage } = useApp();

  const [imageUri, setImageUri] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [sessionTitle, setSessionTitle] = useState('Microscopy Cell Dimension Session');

  // Scale state
  const [mode, setMode] = useState<'CALIBRATE' | 'MEASURE'>('CALIBRATE');
  const [scalePixels, setScalePixels] = useState<number>(100);
  const [scaleRealValue, setScaleRealValue] = useState<number>(100);
  const [scaleUnit, setScaleUnit] = useState<string>('µm');

  // Measurement lines
  const [measurements, setMeasurements] = useState<MeasurementLine[]>([]);
  const [activeLineStart, setActiveLineStart] = useState<{ x: number; y: number } | null>(null);
  const [tempLineEnd, setTempLineEnd] = useState<{ x: number; y: number } | null>(null);
  const [notes, setNotes] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load sample image on initial mount
  useEffect(() => {
    setImageUri(generateSampleMicroscopyImage());
  }, []);

  // Redraw Canvas
  useEffect(() => {
    if (!imageUri || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUri;
    img.onload = () => {
      canvas.width = img.width || 500;
      canvas.height = img.height || 500;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw stored measurements
      measurements.forEach((m, idx) => {
        ctx.beginPath();
        ctx.moveTo(m.x1, m.y1);
        ctx.lineTo(m.x2, m.y2);
        ctx.strokeStyle = m.color || '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // End circles
        ctx.beginPath();
        ctx.arc(m.x1, m.y1, 4, 0, Math.PI * 2);
        ctx.arc(m.x2, m.y2, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();

        // Label text
        const midX = (m.x1 + m.x2) / 2;
        const midY = (m.y1 + m.y2) / 2;
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(`#${idx + 1}: ${m.realDistance.toFixed(1)} ${m.unit}`, midX + 8, midY - 8);
        ctx.shadowBlur = 0;
      });

      // Draw active drawing line
      if (activeLineStart && tempLineEnd) {
        ctx.beginPath();
        ctx.moveTo(activeLineStart.x, activeLineStart.y);
        ctx.lineTo(tempLineEnd.x, tempLineEnd.y);
        ctx.strokeStyle = mode === 'CALIBRATE' ? '#f59e0b' : '#10b981';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };
  }, [imageUri, measurements, activeLineStart, tempLineEnd, mode]);

  // Image Upload Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUri(event.target.result as string);
          setMeasurements([]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Mouse / Touch Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setActiveLineStart(coords);
    setTempLineEnd(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeLineStart) return;
    setTempLineEnd(getCanvasCoords(e));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeLineStart) return;
    const end = getCanvasCoords(e);
    const dx = end.x - activeLineStart.x;
    const dy = end.y - activeLineStart.y;
    const pxDist = Math.sqrt(dx * dx + dy * dy);

    if (pxDist > 5) {
      if (mode === 'CALIBRATE') {
        setScalePixels(pxDist);
        alert(`Scale Reference Set! Drawn line = ${pxDist.toFixed(1)} px.`);
      } else {
        const factor = scaleRealValue / (scalePixels || 1);
        const realVal = pxDist * factor;

        setMeasurements((prev) => [
          ...prev,
          {
            id: `m_${Date.now()}`,
            label: `Measure ${prev.length + 1}`,
            x1: activeLineStart.x,
            y1: activeLineStart.y,
            x2: end.x,
            y2: end.y,
            pixelDistance: pxDist,
            realDistance: realVal,
            unit: scaleUnit,
            color: '#10b981',
          },
        ]);
      }
    }

    setActiveLineStart(null);
    setTempLineEnd(null);
  };

  // Save Session
  const handleSave = () => {
    const saved = storage.saveImageMeasurement({
      title: sessionTitle,
      imageUri,
      scalePixels,
      scaleRealValue,
      scaleUnit,
      measurements,
      notes,
      projectId: selectedProjectId,
    });
    alert(`Measurement session "${saved.title}" saved successfully!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Measurement ID', 'Pixel Distance', 'Calibrated Distance', 'Unit'];
    const rows = measurements.map((m) => [
      m.label,
      m.pixelDistance.toFixed(2),
      m.realDistance.toFixed(2),
      m.unit,
    ]);
    exportToCSV(`${sessionTitle.replace(/\s+/g, '_')}_measurements`, headers, rows);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    const headers = ['Measurement', 'Pixel Dist (px)', 'Real Distance', 'Unit'];
    const rows = measurements.map((m) => [
      m.label,
      m.pixelDistance.toFixed(1),
      m.realDistance.toFixed(2),
      m.unit,
    ]);

    generatePDFReport({
      title: sessionTitle,
      subtitle: 'Scientific Image Measurement & Scale Report',
      meta: {
        'Scale Reference': `${scalePixels.toFixed(1)} px = ${scaleRealValue} ${scaleUnit}`,
        'Total Measurements': measurements.length,
        Project: projects.find((p) => p.id === selectedProjectId)?.name || 'Unassigned',
      },
      tableHeaders: headers,
      tableRows: rows,
      notes,
      imageUri,
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
          IMAGE ANALYSIS
        </span>
      </div>

      {/* Main Title */}
      <div className="bg-slate-900 dark:bg-[#121215] text-white p-5 rounded-2xl border-2 border-slate-900 dark:border-white/20">
        <div className="flex items-center gap-2">
          <Ruler className="w-6 h-6 text-teal-400 stroke-[2.5]" />
          <h1 className="text-xl font-black uppercase tracking-tighter">
            IMAGE MEASUREMENT TOOL
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Calibrate pixel-to-micrometer scale & measure cellular or gel band distances.
        </p>
      </div>

      {/* Mode Controls & Calibration Card */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setMode('CALIBRATE')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                mode === 'CALIBRATE' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              1. Set Scale Line
            </button>
            <button
              onClick={() => setMode('MEASURE')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                mode === 'MEASURE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              2. Measure Distance
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-black uppercase cursor-pointer flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              Upload Image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <button
              onClick={() => setImageUri(generateSampleMicroscopyImage())}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sample
            </button>
          </div>
        </div>

        {/* Calibration inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">
              Drawn Reference Line
            </label>
            <div className="text-sm font-mono font-black text-slate-900 dark:text-white">
              {scalePixels.toFixed(1)} px
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">
              Real World Distance
            </label>
            <input
              type="number"
              value={scaleRealValue}
              onChange={(e) => setScaleRealValue(Number(e.target.value) || 1)}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Unit</label>
            <select
              value={scaleUnit}
              onChange={(e) => setScaleUnit(e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-mono font-bold"
            >
              <option value="µm">Micrometers (µm)</option>
              <option value="mm">Millimeters (mm)</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="m">Meters (m)</option>
            </select>
          </div>
        </div>
      </MtkCard>

      {/* CANVAS DRAWING WORKSPACE */}
      <MtkCard className="p-2 border-2 border-slate-900 dark:border-white/20 bg-slate-950 text-white flex flex-col items-center">
        <div className="w-full text-center text-[10px] font-mono font-bold text-amber-400 mb-1">
          {mode === 'CALIBRATE'
            ? '➔ Click & Drag on image to set reference scale line'
            : '➔ Click & Drag on image to measure distances'}
        </div>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="max-w-full rounded-lg border border-slate-800 cursor-crosshair shadow-inner"
        />
      </MtkCard>

      {/* MEASUREMENTS LIST */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
            Measurements Table ({measurements.length})
          </h3>
          {measurements.length > 0 && (
            <button
              onClick={() => setMeasurements([])}
              className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase hover:underline cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {measurements.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono italic">
            No measurements taken yet. Drag lines on image in "Measure Distance" mode.
          </p>
        ) : (
          <div className="space-y-1.5">
            {measurements.map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-teal-600 text-white font-black text-[10px] rounded-full flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{m.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{m.pixelDistance.toFixed(1)} px</span>
                  <span className="font-black text-teal-600 dark:text-teal-400 text-sm">
                    {m.realDistance.toFixed(2)} {m.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </MtkCard>

      {/* EXPORT & SAVE BUTTONS */}
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
