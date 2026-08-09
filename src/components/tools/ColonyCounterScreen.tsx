import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { DetectedColony } from '../../types';
import { MtkCard } from '../common/MtkCard';
import { generateSampleAgarPlateImage, detectColoniesInCanvas } from '../../utils/imageProcessing';
import { cleanLatexAndMath } from '../../utils/textFormatting';
import { exportToCSV, generatePDFReport, exportImageToFormat } from '../../utils/exportService';
import {
  Disc,
  Upload,
  Save,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Plus,
  Minus,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const ColonyCounterScreen: React.FC = () => {
  const { navigateBack, projects, storage } = useApp();

  const [sessionTitle, setSessionTitle] = useState('E. coli CFU Plate Assay');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string>('');

  // Image Processing Parameters
  const [sensitivity, setSensitivity] = useState<number>(110);
  const [minRadius, setMinRadius] = useState<number>(4);
  const [maxRadius, setMaxRadius] = useState<number>(25);

  // CFU Parameters
  const [platedVolumeMl, setPlatedVolumeMl] = useState<number>(0.1); // 100 µL = 0.1 mL
  const [dilutionFactor, setDilutionFactor] = useState<number>(10000); // 10^-4

  // Colony detections
  const [colonies, setColonies] = useState<DetectedColony[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiAnalysisStatus, setAiAnalysisStatus] = useState<'IDLE' | 'ANALYZING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [aiNote, setAiNote] = useState<string>('');
  const [manualMode, setManualMode] = useState<'add' | 'remove'>('add');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Redraw canvas background image & current colony markers
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImageRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = loadedImageRef.current;
    canvas.width = img.width || 500;
    canvas.height = img.height || 500;

    // Clear and draw plate image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw colony markers
    colonies.forEach((col, idx) => {
      // Outer ring
      ctx.beginPath();
      ctx.arc(col.x, col.y, Math.max(5, col.radius + 2), 0, Math.PI * 2);
      ctx.strokeStyle = col.isManual ? '#f59e0b' : '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(col.x, col.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = col.isManual ? '#f59e0b' : '#10b981';
      ctx.fill();

      // Number badge for large canvases
      if (colonies.length <= 120) {
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.fillText(`${idx + 1}`, col.x + col.radius + 3, col.y + 3);
        ctx.shadowBlur = 0;
      }
    });
  }, [colonies]);

  // Load image when imageUri changes
  useEffect(() => {
    if (!imageUri) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUri;
    img.onload = () => {
      loadedImageRef.current = img;

      // Run initial computer vision detection
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width || 500;
        canvas.height = img.height || 500;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const found = detectColoniesInCanvas(canvas, sensitivity, minRadius, maxRadius);
          setColonies(found);
          setAiAnalysisStatus('IDLE');
          setAiNote('');
        }
      }
    };
  }, [imageUri]);

  // Re-run CV detection when threshold sensitivity changes
  const handleSensitivityChange = (newSens: number) => {
    setSensitivity(newSens);
    if (!loadedImageRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(loadedImageRef.current, 0, 0, canvas.width, canvas.height);
    const found = detectColoniesInCanvas(canvas, newSens, minRadius, maxRadius);
    setColonies(found);
  };

  // Redraw whenever colonies state updates
  useEffect(() => {
    redraw();
  }, [colonies, redraw]);

  // Trigger AI Vision Analysis
  const runAiVisionCount = async () => {
    if (!imageUri) return;
    setAiAnalysisStatus('ANALYZING');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/ai/count-colonies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageUri,
          mimeType: imageUri.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
        }),
      });

      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.colonies)) {
        const canvas = canvasRef.current;
        const w = canvas?.width || 500;
        const h = canvas?.height || 500;

        const aiColonies: DetectedColony[] = json.data.colonies.map((c: any, i: number) => ({
          id: `ai_col_${i}_${Date.now()}`,
          x: Math.round((c.xPercent / 100) * w),
          y: Math.round((c.yPercent / 100) * h),
          radius: c.estimatedRadiusPx || 7,
          isManual: false,
        }));

        setColonies(aiColonies);
        setAiAnalysisStatus('SUCCESS');
        setAiNote(json.data.notes || `AI detected ${json.data.totalCount || aiColonies.length} colonies.`);
      } else {
        // Fallback to enhanced local CV algorithm
        if (canvasRef.current) {
          const found = detectColoniesInCanvas(canvasRef.current, sensitivity, minRadius, maxRadius);
          setColonies(found);
        }
        setAiAnalysisStatus('SUCCESS');
        setAiNote('Computer vision threshold analysis completed.');
      }
    } catch (err) {
      console.error('AI vision error:', err);
      // Fallback
      if (canvasRef.current) {
        const found = detectColoniesInCanvas(canvasRef.current, sensitivity, minRadius, maxRadius);
        setColonies(found);
      }
      setAiAnalysisStatus('SUCCESS');
      setAiNote('Computer vision local analysis applied.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Initial load
  useEffect(() => {
    setImageUri(generateSampleAgarPlateImage());
  }, []);

  // Manual Add/Remove Colony on Canvas Click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (manualMode === 'add') {
      const newColony: DetectedColony = {
        id: `c_${Date.now()}`,
        x: clickX,
        y: clickY,
        radius: 7,
        isManual: true,
      };
      setColonies((prev) => [...prev, newColony]);
    } else {
      // Remove closest colony within 18px radius
      setColonies((prev) =>
        prev.filter((c) => {
          const dist = Math.sqrt((c.x - clickX) ** 2 + (c.y - clickY) ** 2);
          return dist > 18;
        })
      );
    }
  };

  // Clear all colonies
  const handleClearAll = () => {
    setColonies([]);
  };

  // Compute CFU / mL = (Colonies * Dilution) / Volume
  const cfuPerMl = platedVolumeMl > 0 ? (colonies.length * dilutionFactor) / platedVolumeMl : 0;

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUri(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Session
  const handleSave = () => {
    const saved = storage.saveColonyCount({
      title: sessionTitle,
      totalCount: colonies.length,
      cfuPerMl,
      platedVolumeMl,
      dilutionFactor,
      imageUri,
      colonies,
      projectId: selectedProjectId,
    });
    alert(`Colony Session "${saved.title}" saved!`);
  };

  // Export PNG / CSV / PDF
  const handleExportPNG = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      exportImageToFormat(dataUrl, `${sessionTitle.replace(/\s+/g, '_')}_counted`, 'png');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Colony ID', 'X Coordinate', 'Y Coordinate', 'Radius', 'Type'];
    const rows = colonies.map((c, i) => [
      i + 1,
      c.x.toFixed(1),
      c.y.toFixed(1),
      c.radius.toFixed(1),
      c.isManual ? 'Manual Tag' : 'AI/CV Detected',
    ]);
    exportToCSV(`${sessionTitle.replace(/\s+/g, '_')}_colonies`, headers, rows);
  };

  const handleExportPDF = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      generatePDFReport({
        title: sessionTitle,
        subtitle: 'AI Colony Detection & CFU/mL Microbiology Analysis',
        meta: {
          'Total Colonies Counted': colonies.length,
          'Calculated CFU / mL': `${cfuPerMl.toExponential(2)} CFU/mL`,
          'Plated Volume': `${platedVolumeMl} mL`,
          'Dilution Factor': `${dilutionFactor}x`,
          Project: projects.find((p) => p.id === selectedProjectId)?.name || 'Unassigned',
        },
        imageUri: dataUrl,
      });
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121215] p-3 rounded-xl border-2 border-slate-300 dark:border-white/15 shadow-2xs">
        <button
          onClick={navigateBack}
          className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 hover:text-teal-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Tools</span>
        </button>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800">
          MICROBIOLOGY
        </span>
      </div>

      {/* Main Banner */}
      <div className="bg-slate-900 dark:bg-[#121215] text-white p-4 sm:p-5 rounded-2xl border-2 border-slate-900 dark:border-white/20">
        <div className="flex items-center gap-2">
          <Disc className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 stroke-[2.5]" />
          <h1 className="text-base sm:text-xl font-extrabold uppercase tracking-tight">
            AI COLONY COUNTER
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
          Automated agar plate image processing, AI Vision detection, manual touch editing & CFU/mL concentration calculations.
        </p>
      </div>

      {/* CFU RESULTS BANNER */}
      <MtkCard className="p-4 sm:p-5 bg-teal-950/40 border-2 border-teal-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-teal-400 font-bold tracking-widest">
            TOTAL DETECTED COLONIES
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white mt-0.5">
            {colonies.length} <span className="text-xs font-sans text-slate-300">colonies</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-xl border border-teal-500/30 text-right w-full sm:w-auto">
          <span className="text-[9px] font-mono uppercase text-slate-400">Calculated Concentration</span>
          <div className="text-lg sm:text-xl font-mono font-extrabold text-teal-400 mt-0.5">
            {cfuPerMl.toExponential(2)} CFU/mL
          </div>
        </div>
      </MtkCard>

      {/* PARAMETERS & PREPROCESSING CONTROLS */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase text-slate-900 dark:text-white tracking-wider">
            Assay Parameters & Image Controls
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={runAiVisionCount}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-extrabold uppercase cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {aiAnalysisStatus === 'ANALYZING' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Ai Vision
            </button>
            <label className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-extrabold uppercase cursor-pointer flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> Upload Photo
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <button
              onClick={() => setImageUri(generateSampleAgarPlateImage())}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-[10px] font-extrabold uppercase cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Sample
            </button>
          </div>
        </div>

        {aiNote && (
          <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{cleanLatexAndMath(aiNote)}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block">
              Plated Volume (mL)
            </label>
            <input
              type="number"
              step="0.01"
              value={platedVolumeMl}
              onChange={(e) => setPlatedVolumeMl(Number(e.target.value) || 0.1)}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block">
              Dilution Factor
            </label>
            <input
              type="number"
              value={dilutionFactor}
              onChange={(e) => setDilutionFactor(Number(e.target.value) || 1)}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block">
              CV Sensitivity ({sensitivity})
            </label>
            <input
              type="range"
              min="50"
              max="220"
              value={sensitivity}
              onChange={(e) => handleSensitivityChange(Number(e.target.value))}
              className="w-full accent-teal-600 mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block">
              Touch Editing Mode
            </label>
            <div className="flex gap-1 mt-1">
              <button
                type="button"
                onClick={() => setManualMode('add')}
                className={`flex-1 py-1 rounded text-[10px] font-extrabold uppercase cursor-pointer ${
                  manualMode === 'add'
                    ? 'bg-amber-500 text-black shadow-2xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                + Add
              </button>
              <button
                type="button"
                onClick={() => setManualMode('remove')}
                className={`flex-1 py-1 rounded text-[10px] font-extrabold uppercase cursor-pointer ${
                  manualMode === 'remove'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                - Remove
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                title="Clear all colony tags"
                className="px-2 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-600 rounded text-[10px] font-extrabold uppercase cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </MtkCard>

      {/* CANVAS IMAGE WORKSPACE */}
      <MtkCard className="p-2 border-2 border-slate-900 dark:border-white/20 bg-slate-950 text-white flex flex-col items-center">
        <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between w-full px-2">
          <span>Click on canvas to {manualMode === 'add' ? 'add colony (+)' : 'remove colony (-)'}</span>
          <span>{colonies.length} Colonies Marked</span>
        </div>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="max-w-full rounded-lg border border-slate-800 cursor-crosshair shadow-inner"
        />
      </MtkCard>

      {/* EXPORT BUTTONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={handleSave}
          className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <Save className="w-4 h-4" />
          Save Session
        </button>
        <button
          onClick={handleExportPNG}
          className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          PNG Image
        </button>
        <button
          onClick={handleExportCSV}
          className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          CSV Export
        </button>
        <button
          onClick={handleExportPDF}
          className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
        >
          <FileText className="w-4 h-4 text-sky-400" />
          PDF Report
        </button>
      </div>
    </div>
  );
};
