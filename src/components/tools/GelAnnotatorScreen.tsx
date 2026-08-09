import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GelAnnotation } from '../../types';
import { MtkCard } from '../common/MtkCard';
import { generateSampleGelImage } from '../../utils/imageProcessing';
import { generatePDFReport, exportImageToFormat } from '../../utils/exportService';
import {
  ImageIcon,
  Type,
  MoveRight,
  Square,
  Circle,
  Pencil,
  RotateCcw,
  RotateCw,
  Trash2,
  Save,
  Download,
  FileText,
  ArrowLeft,
  Tag,
  Plus,
} from 'lucide-react';

export const GelAnnotatorScreen: React.FC = () => {
  const { navigateBack, projects, storage } = useApp();

  const [imageUri, setImageUri] = useState<string>('');
  const [title, setTitle] = useState('16S rRNA PCR Gel Verification');
  const [sampleName, setSampleName] = useState('Bacterial Extract DNA');
  const [experiment, setExperiment] = useState('EXP-2026-GEL01');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Active Tool & Style
  const [tool, setTool] = useState<
    'text' | 'arrow' | 'line' | 'rectangle' | 'circle' | 'freehand' | 'lane' | 'band'
  >('lane');
  const [color, setColor] = useState('#38bdf8'); // sky blue default
  const [annotations, setAnnotations] = useState<GelAnnotation[]>([]);
  const [undoStack, setUndoStack] = useState<GelAnnotation[][]>([]);
  const [redoStack, setRedoStack] = useState<GelAnnotation[][]>([]);

  // Text / Label input
  const [labelText, setLabelText] = useState('Lane 1 (Ladder)');
  const [bandText, setBandText] = useState('1500 bp');

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [freehandPoints, setFreehandPoints] = useState<{ x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setImageUri(generateSampleGelImage());
  }, []);

  // Save history state for undo/redo
  const pushHistory = (newAnnotations: GelAnnotation[]) => {
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations(newAnnotations);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [annotations, ...prev]);
    setAnnotations(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setUndoStack((prev) => [...prev, annotations]);
    setAnnotations(next);
  };

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
      canvas.width = img.width || 600;
      canvas.height = img.height || 400;

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Render annotations
      annotations.forEach((ann) => {
        ctx.strokeStyle = ann.color;
        ctx.fillStyle = ann.color;
        ctx.lineWidth = ann.strokeWidth || 2;

        if (ann.type === 'text' || ann.type === 'lane' || ann.type === 'band') {
          ctx.font = 'bold 12px monospace';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          ctx.fillText(ann.text || '', ann.x, ann.y);
          ctx.shadowBlur = 0;
        } else if (ann.type === 'line' && ann.points && ann.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(ann.points[0].x, ann.points[0].y);
          ctx.lineTo(ann.points[1].x, ann.points[1].y);
          ctx.stroke();
        } else if (ann.type === 'arrow' && ann.points && ann.points.length >= 2) {
          const p1 = ann.points[0];
          const p2 = ann.points[1];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Arrowhead
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(p2.x - 10 * Math.cos(angle - Math.PI / 6), p2.y - 10 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(p2.x - 10 * Math.cos(angle + Math.PI / 6), p2.y - 10 * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        } else if (ann.type === 'rectangle') {
          ctx.strokeRect(ann.x, ann.y, ann.width || 40, ann.height || 30);
        } else if (ann.type === 'circle') {
          ctx.beginPath();
          ctx.arc(ann.x, ann.y, ann.width || 20, 0, Math.PI * 2);
          ctx.stroke();
        } else if (ann.type === 'freehand' && ann.points) {
          ctx.beginPath();
          ann.points.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();
        }
      });

      // Render actively drawn shape preview
      if (isDrawing && startPos && currentPos) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        if (tool === 'rectangle') {
          ctx.strokeRect(startPos.x, startPos.y, currentPos.x - startPos.x, currentPos.y - startPos.y);
        } else if (tool === 'arrow' || tool === 'line') {
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(currentPos.x, currentPos.y);
          ctx.stroke();
        }
      }
    };
  }, [imageUri, annotations, isDrawing, startPos, currentPos, color, tool]);

  // Mouse Handlers
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
    setIsDrawing(true);
    setStartPos(coords);
    setCurrentPos(coords);

    if (tool === 'text' || tool === 'lane' || tool === 'band') {
      const textVal = tool === 'lane' ? labelText : tool === 'band' ? bandText : labelText;
      const newAnn: GelAnnotation = {
        id: `ann_${Date.now()}`,
        type: tool,
        x: coords.x,
        y: coords.y,
        text: textVal,
        color,
        strokeWidth: 2,
      };
      pushHistory([...annotations, newAnn]);
      setIsDrawing(false);
    } else if (tool === 'freehand') {
      setFreehandPoints([coords]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    setCurrentPos(coords);
    if (tool === 'freehand') {
      setFreehandPoints((prev) => [...prev, coords]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const endPos = getCanvasCoords(e);

    let newAnn: GelAnnotation | null = null;
    if (tool === 'rectangle') {
      newAnn = {
        id: `ann_${Date.now()}`,
        type: 'rectangle',
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
        color,
        strokeWidth: 2,
      };
    } else if (tool === 'arrow' || tool === 'line') {
      newAnn = {
        id: `ann_${Date.now()}`,
        type: tool,
        x: startPos.x,
        y: startPos.y,
        points: [startPos, endPos],
        color,
        strokeWidth: 2,
      };
    } else if (tool === 'freehand' && freehandPoints.length > 1) {
      newAnn = {
        id: `ann_${Date.now()}`,
        type: 'freehand',
        x: startPos.x,
        y: startPos.y,
        points: freehandPoints,
        color,
        strokeWidth: 2,
      };
    }

    if (newAnn) {
      pushHistory([...annotations, newAnn]);
    }

    setIsDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
    setFreehandPoints([]);
  };

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUri(event.target.result as string);
          setAnnotations([]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Session
  const handleSave = () => {
    const saved = storage.saveGelAnnotation({
      title,
      sampleName,
      experiment,
      imageUri,
      annotations,
      notes: `Annotated gel session with ${annotations.length} items.`,
      projectId: selectedProjectId,
    });
    alert(`Gel session "${saved.title}" saved!`);
  };

  // Export PNG / PDF
  const handleExportPNG = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      exportImageToFormat(dataUrl, `${title.replace(/\s+/g, '_')}_annotated`, 'png');
    }
  };

  const handleExportPDF = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      generatePDFReport({
        title,
        subtitle: 'Gel Electrophoresis / Western Blot Annotation Report',
        meta: {
          'Sample Name': sampleName,
          Experiment: experiment,
          'Total Annotations': annotations.length,
          Project: projects.find((p) => p.id === selectedProjectId)?.name || 'Unassigned',
        },
        imageUri: dataUrl,
      });
    }
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
          <ImageIcon className="w-6 h-6 text-teal-400 stroke-[2.5]" />
          <h1 className="text-xl font-black uppercase tracking-tighter">
            GEL / BLOT ANNOTATOR
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Annotate agarose gel bands, lanes, molecular weights & export high-res figures.
        </p>
      </div>

      {/* Metadata Inputs */}
      <MtkCard className="p-4 space-y-3 border-2 border-slate-300 dark:border-white/15">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Gel Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Sample Name</label>
            <input
              type="text"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Experiment</label>
            <input
              type="text"
              value={experiment}
              onChange={(e) => setExperiment(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-bold"
            />
          </div>
        </div>
      </MtkCard>

      {/* Tool Palette Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border-2 border-slate-300 dark:border-white/10 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Drawing Tool Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'lane', label: 'Lane Label', icon: Tag },
              { id: 'band', label: 'Band (bp/kDa)', icon: Type },
              { id: 'arrow', label: 'Arrow', icon: MoveRight },
              { id: 'rectangle', label: 'Box', icon: Square },
              { id: 'freehand', label: 'Draw', icon: Pencil },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer border ${
                    tool === t.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* History Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 bg-white dark:bg-slate-700 border rounded-md text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 bg-white dark:bg-slate-700 border rounded-md text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => pushHistory([])}
              className="p-1.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 border border-rose-300 rounded-md cursor-pointer"
              title="Clear Annotations"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Label Inputs */}
        {(tool === 'lane' || tool === 'band') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-300 dark:border-slate-700">
            <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
              {tool === 'lane' ? 'Lane Label:' : 'Band Value:'}
            </span>
            <input
              type="text"
              value={tool === 'lane' ? labelText : bandText}
              onChange={(e) =>
                tool === 'lane' ? setLabelText(e.target.value) : setBandText(e.target.value)
              }
              className="px-2.5 py-1 bg-white dark:bg-slate-900 border rounded-md text-xs font-mono font-bold flex-1"
            />
            <span className="text-[10px] text-slate-500 italic">➔ Click on gel to place</span>
          </div>
        )}
      </div>

      {/* CANVAS WORKSPACE */}
      <MtkCard className="p-2 border-2 border-slate-900 dark:border-white/20 bg-slate-950 text-white flex flex-col items-center">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="max-w-full rounded-lg border border-slate-800 cursor-crosshair shadow-inner"
        />
      </MtkCard>

      {/* EXPORT & SAVE ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          onClick={handleSave}
          className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Gel
        </button>
        <button
          onClick={handleExportPNG}
          className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          PNG Image
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
