import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MtkCard } from '../common/MtkCard';
import { generateSampleMicroscopyImage } from '../../utils/imageProcessing';
import { exportToCSV, generatePDFReport } from '../../utils/exportService';
import {
  Eye,
  Camera,
  Upload,
  Save,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';

interface MarkedCell {
  x: number;
  y: number;
  type: 'viable' | 'dead';
}

export const CellCounterScreen: React.FC = () => {
  const { navigateBack, projects, storage } = useApp();

  const [sessionTitle, setSessionTitle] = useState('HEK293 Hemocytometer Viability Log');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string>('');

  // Hemocytometer parameters
  const [numSquares, setNumSquares] = useState<number>(4);
  const [dilutionFactor, setDilutionFactor] = useState<number>(2); // Trypan blue 1:1 = 2
  const [squareVolume, setSquareVolume] = useState<number>(0.0001); // 0.1 mm^3 = 10^-4 mL

  // Cell markers
  const [activeCellType, setActiveCellType] = useState<'viable' | 'dead'>('viable');
  const [markers, setMarkers] = useState<MarkedCell[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setImageUri(generateSampleMicroscopyImage());
  }, []);

  // Compute cell counts
  const viableCount = markers.filter((m) => m.type === 'viable').length;
  const deadCount = markers.filter((m) => m.type === 'dead').length;
  const totalCount = viableCount + deadCount;
  const viabilityPct = totalCount > 0 ? (viableCount / totalCount) * 100 : 0;

  // Cells/mL formula = (Total Cells / Num Squares) * Dilution Factor * 10,000
  const concentrationPerMl =
    numSquares > 0 ? (totalCount / numSquares) * dilutionFactor * 10000 : 0;

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

      // Render markers
      markers.forEach((m) => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = m.type === 'viable' ? '#10b981' : '#f43f5e';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };
  }, [imageUri, markers]);

  // Click Canvas to Add Marker
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setMarkers((prev) => [...prev, { x, y, type: activeCellType }]);
  };

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUri(event.target.result as string);
          setMarkers([]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Session
  const handleSave = () => {
    const saved = storage.saveCellCount({
      title: sessionTitle,
      totalCells: totalCount,
      viableCells: viableCount,
      deadCells: deadCount,
      viabilityPercentage: viabilityPct,
      concentrationPerMl,
      dilutionFactor,
      numSquares,
      projectId: selectedProjectId,
    });
    alert(`Cell Count Session "${saved.title}" saved!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Total Cells',
      'Viable Cells',
      'Dead Cells',
      'Viability (%)',
      'Concentration (cells/mL)',
      'Dilution Factor',
    ];
    const rows = [
      [
        totalCount,
        viableCount,
        deadCount,
        viabilityPct.toFixed(1),
        concentrationPerMl.toExponential(2),
        dilutionFactor,
      ],
    ];
    exportToCSV(`${sessionTitle.replace(/\s+/g, '_')}_cell_count`, headers, rows);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    generatePDFReport({
      title: sessionTitle,
      subtitle: 'Hemocytometer Cell Count & Trypan Blue Viability Report',
      meta: {
        'Total Cells Counted': totalCount,
        'Viable Cells (Green)': viableCount,
        'Dead Cells (Red)': deadCount,
        'Cell Viability': `${viabilityPct.toFixed(1)}%`,
        'Cell Concentration': `${concentrationPerMl.toExponential(2)} cells/mL`,
        'Dilution Factor': `${dilutionFactor}x`,
        'Squares Counted': numSquares,
        Project: projects.find((p) => p.id === selectedProjectId)?.name || 'Unassigned',
      },
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
          CELL BIOLOGY
        </span>
      </div>

      {/* Main Banner */}
      <div className="bg-slate-900 dark:bg-[#121215] text-white p-5 rounded-2xl border-2 border-slate-900 dark:border-white/20">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-teal-400 stroke-[2.5]" />
          <h1 className="text-xl font-black uppercase tracking-tighter">
            HEMOCYTOMETER CELL COUNTER
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Trypan Blue viability scoring, concentration/mL formula & cell suspension calculations.
        </p>
      </div>

      {/* PARAMETERS & METRICS SUMMARY CARD */}
      <MtkCard className="p-4 bg-slate-900 text-white border-2 border-slate-900 dark:border-white/20 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] font-mono uppercase text-slate-400">Total Cells</span>
            <div className="text-2xl font-mono font-black text-white">{totalCount}</div>
          </div>
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] font-mono uppercase text-emerald-400">Viable Cells</span>
            <div className="text-2xl font-mono font-black text-emerald-400">{viableCount}</div>
          </div>
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] font-mono uppercase text-rose-400">Dead Cells</span>
            <div className="text-2xl font-mono font-black text-rose-400">{deadCount}</div>
          </div>
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] font-mono uppercase text-teal-400">Viability %</span>
            <div className="text-2xl font-mono font-black text-teal-400">
              {viabilityPct.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-slate-300 font-bold">
            Cell Concentration:
          </span>
          <span className="text-lg font-mono font-black text-teal-400">
            {concentrationPerMl.toExponential(2)} cells/mL
          </span>
        </div>
      </MtkCard>

      {/* PARAMETERS CONFIGURATION */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">
              Squares Counted
            </label>
            <input
              type="number"
              value={numSquares}
              onChange={(e) => setNumSquares(Number(e.target.value) || 1)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">
              Dilution Factor (e.g. 2 for 1:1)
            </label>
            <input
              type="number"
              value={dilutionFactor}
              onChange={(e) => setDilutionFactor(Number(e.target.value) || 1)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">
              Active Marker Type
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveCellType('viable')}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase ${
                  activeCellType === 'viable'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                Viable (Green)
              </button>
              <button
                onClick={() => setActiveCellType('dead')}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase ${
                  activeCellType === 'dead'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                Dead (Red)
              </button>
            </div>
          </div>
        </div>
      </MtkCard>

      {/* CANVAS IMAGE WORKSPACE */}
      <MtkCard className="p-2 border-2 border-slate-900 dark:border-white/20 bg-slate-950 text-white flex flex-col items-center space-y-2">
        <div className="w-full flex items-center justify-between px-2">
          <span className="text-[10px] font-mono text-amber-400">
            ➔ Click on image to place cell markers
          </span>
          <button
            onClick={() => setMarkers([])}
            className="text-[10px] font-black text-rose-400 uppercase hover:underline"
          >
            Clear Markers
          </button>
        </div>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="max-w-full rounded-lg border border-slate-800 cursor-crosshair shadow-inner"
        />
      </MtkCard>

      {/* EXPORT BUTTONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          onClick={handleSave}
          className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Count
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
