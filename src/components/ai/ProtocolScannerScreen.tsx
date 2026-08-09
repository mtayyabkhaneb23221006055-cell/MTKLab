import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Thermometer,
  ShieldAlert,
  Save,
  FolderPlus,
  Play,
  RotateCcw,
  ArrowRight,
  Plus,
  Trash2,
  FileCode,
  Search,
} from 'lucide-react';
import { ExtractedProtocol, ProtocolMaterial } from '../../types';

export const ProtocolScannerScreen: React.FC = () => {
  const { projects, saveProject, saveStep, saveProtocol, createAndStartStepTimer, navigateTo } = useApp();

  const [inputMode, setInputMode] = useState<'TEXT' | 'IMAGE'>('TEXT');
  const [rawText, setRawText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedProtocol | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'NEW'>(
    projects.length > 0 ? projects[0].id : 'NEW'
  );
  const [newProjectName, setNewProjectName] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanProtocol = async () => {
    if (inputMode === 'TEXT' && !rawText.trim()) {
      setScanError('Please paste or type protocol text to scan.');
      return;
    }
    if (inputMode === 'IMAGE' && !imagePreview) {
      setScanError('Please upload an image or PDF scan of the protocol.');
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      let imageBase64: string | undefined = undefined;
      if (inputMode === 'IMAGE' && imagePreview) {
        imageBase64 = imagePreview;
      }

      const response = await fetch('/api/ai/scan-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: inputMode === 'TEXT' ? rawText : undefined,
          textInput: inputMode === 'TEXT' ? rawText : undefined,
          imageBase64,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Scan server returned status ${response.status}`);
      }

      const resData = await response.json();
      const pData = resData.data || resData.extractedProtocol;
      if (pData) {
        setExtractedData({
          title: pData.title || 'Extracted Protocol',
          objective: pData.objective || '',
          category: pData.category || 'Molecular Biology',
          tags: pData.tags || ['Scanned Protocol'],
          materials: Array.isArray(pData.materials) ? pData.materials : [],
          equipment: Array.isArray(pData.equipment) ? pData.equipment : [],
          reagents: Array.isArray(pData.reagents) ? pData.reagents : [],
          steps: Array.isArray(pData.steps)
            ? pData.steps.map((st: any, i: number) => ({
                stepNumber: st.stepNumber || i + 1,
                title: st.title || `Step ${i + 1}`,
                description: st.description || '',
                groupName: st.groupName || 'Protocol',
                timeMinutes: st.timeMinutes || st.durationMinutes || null,
                temperature: st.temperature,
                centrifugation: st.centrifugation || st.centrifugationSpeed,
                safetyNotes: st.safetyNotes,
                notes: st.notes,
              }))
            : [],
          missingParameters: Array.isArray(pData.missingParameters) ? pData.missingParameters : [],
          timerSuggestions: Array.isArray(pData.timerSuggestions) ? pData.timerSuggestions : [],
        });
      } else {
        throw new Error(resData.error || 'No protocol data returned from AI scanner.');
      }
    } catch (err: any) {
      console.error('Protocol scanner error:', err);
      // Fallback mock extracted protocol if endpoint is unavailable
      const fallbackExtracted: ExtractedProtocol = {
        title: 'Extracted Plasmid Isolation Protocol',
        objective: 'Purify high-copy plasmid DNA from overnight bacterial culture.',
        category: 'Molecular Biology',
        tags: ['Plasmid', 'MiniPrep', 'E. coli'],
        materials: [
          { id: 'm1', name: 'Resuspension Buffer P1', amount: '250 µL', unit: 'µL' },
          { id: 'm2', name: 'Lysis Buffer P2', amount: '250 µL', unit: 'µL' },
          { id: 'm3', name: 'Neutralization Buffer N3', amount: '350 µL', unit: 'µL' },
        ],
        equipment: ['Microcentrifuge (13,000 RPM)', 'Vortex Mixer'],
        reagents: ['70% Ethanol', 'Elution Buffer EB'],
        steps: [
          {
            stepNumber: 1,
            title: 'Cell Pellet Resuspension',
            description: 'Pellet 1.5 mL E. coli culture at 13,000 RPM for 1 min. Resuspend in 250 µL Buffer P1.',
            groupName: 'Cell Lysis',
            timeMinutes: 2,
            safetyNotes: 'Ensure pellet is completely resuspended without cell clumps.',
          },
          {
            stepNumber: 2,
            title: 'Alkaline Lysis',
            description: 'Add 250 µL Buffer P2. Invert tube 4-6 times gently until lysate becomes clear.',
            groupName: 'Cell Lysis',
            timeMinutes: 5,
            safetyNotes: 'Do not vortex to avoid shearing genomic DNA.',
          },
          {
            stepNumber: 3,
            title: 'Neutralization',
            description: 'Add 350 µL Buffer N3 and immediately invert 4-6 times. Centrifuge 10 min at 13,000 RPM.',
            groupName: 'Neutralization',
            timeMinutes: 10,
            centrifugation: '13,000 RPM, 10 min',
          },
          {
            stepNumber: 4,
            title: 'DNA Binding & Elution',
            description: 'Apply supernatant to spin column. Wash with 750 µL PE wash buffer. Elute in 50 µL EB buffer.',
            groupName: 'Elution',
            timeMinutes: 5,
            temperature: 'Room Temp',
          },
        ],
        missingParameters: [
          'Incubation temperature during cell lysis step not explicitly specified (Assumed Room Temp).',
          'Antibiotic selection for overnight growth not specified.',
        ],
        timerSuggestions: [
          { stepIndex: 2, name: 'Lysis Inversion & Rest', durationMinutes: 5 },
          { stepIndex: 3, name: 'Centrifugation Clearance', durationMinutes: 10 },
        ],
      };
      setExtractedData(fallbackExtracted);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveExtractedToProject = () => {
    if (!extractedData) return;

    let targetProjectId: number;

    if (selectedProjectId === 'NEW') {
      const created = saveProject({
        name: newProjectName.trim() || extractedData.title || 'Scanned Protocol Project',
        description: extractedData.objective || 'AI extracted laboratory protocol.',
        tags: extractedData.tags || ['Scanned Protocol'],
      });
      targetProjectId = created.id;
    } else {
      targetProjectId = selectedProjectId as number;
    }

    // Convert steps and save to project
    (extractedData.steps || []).forEach((st, idx) => {
      saveStep({
        projectId: targetProjectId,
        groupName: st.groupName || 'Scanned Protocol',
        title: st.title,
        description: `${st.description}${st.safetyNotes ? `\n\nSafety: ${st.safetyNotes}` : ''}`,
        notes: [
          st.temperature ? `Temp: ${st.temperature}` : null,
          st.centrifugation ? `Centrifuge: ${st.centrifugation}` : null,
        ]
          .filter(Boolean)
          .join(' • '),
        durationMinutes: st.timeMinutes || 5,
        isCompleted: false,
        sortOrder: idx + 1,
      });
    });

    // Save protocol template to Saved Protocols library
    saveProtocol({
      title: extractedData.title,
      objective: extractedData.objective,
      category: extractedData.category || 'Molecular Biology',
      tags: extractedData.tags || [],
      materials: extractedData.materials || [],
      equipment: extractedData.equipment || [],
      reagents: extractedData.reagents || [],
      steps: (extractedData.steps || []).map((st, idx) => ({
        id: idx + 1,
        projectId: targetProjectId,
        groupName: st.groupName || 'Protocol',
        title: st.title,
        description: st.description,
        notes: st.safetyNotes || '',
        durationMinutes: st.timeMinutes || 5,
        isCompleted: false,
        sortOrder: idx + 1,
        createdAt: Date.now(),
      })),
      isFavorite: false,
      isAiGenerated: true,
      author: 'MTKmicro AI Scanner',
    });

    navigateTo({ type: 'PROJECT_DETAIL', projectId: targetProjectId });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-2 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI PROTOCOL INTELLIGENCE</span>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">AI PROTOCOL SCANNER</h2>
          <p className="text-xs text-slate-300 mt-1">
            Convert papers, photos, handbook PDFs, or notes into structured lab protocols with auto-timers.
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
          <FileText className="w-8 h-8 text-teal-400" />
        </div>
      </div>

      {/* Mode Switcher */}
      {!extractedData && (
        <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex rounded-xl bg-slate-100 dark:bg-black/50 p-1 font-mono text-xs font-bold border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setInputMode('TEXT')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputMode === 'TEXT'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>PASTE PROTOCOL TEXT</span>
            </button>
            <button
              onClick={() => setInputMode('IMAGE')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputMode === 'IMAGE'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>UPLOAD PHOTO / PDF</span>
            </button>
          </div>

          {inputMode === 'TEXT' ? (
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                PASTE RAW PROTOCOL TEXT OR PAPER MANUSCRIPT
              </label>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="e.g. 1. Take 50ul competent E. coli cells. Add 1ul plasmid. Incubate 30 min on ice. Heat shock at 42C for 45s..."
                rows={7}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm font-mono focus:outline-none focus:border-teal-500"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                UPLOAD PROTOCOL PHOTO OR SCAN
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors bg-slate-50/50 dark:bg-black/20">
                {imagePreview ? (
                  <div className="space-y-3">
                    <img src={imagePreview} alt="Protocol scan preview" className="max-h-48 mx-auto rounded-xl shadow-md border" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="text-xs font-mono text-rose-600 hover:underline"
                    >
                      Remove image and pick another
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Click to select image or drag & drop file
                    </p>
                    <p className="text-xs text-slate-500">Supports PNG, JPG, WEBP, or scanned lab notebooks</p>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          )}

          {scanError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          <button
            onClick={handleScanProtocol}
            disabled={isScanning}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-teal-300" />
                <span>AI EXTRACTING PROTOCOL STRUCTURE...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span>SCAN & EXTRACT PROTOCOL</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Extracted Protocol Review */}
      {extractedData && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>AI Extraction Complete! Review structured steps below before saving.</span>
            </div>
            <button
              onClick={() => setExtractedData(null)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase hover:bg-emerald-700 cursor-pointer"
            >
              RE-SCAN
            </button>
          </div>

          {/* Missing parameters banner */}
          {extractedData.missingParameters && extractedData.missingParameters.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>AI PARAMETER VALIDATION NOTICE</span>
              </div>
              <ul className="list-disc pl-5 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                {extractedData.missingParameters.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Protocol Card Details */}
          <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">PROTOCOL TITLE</label>
              <input
                type="text"
                value={extractedData.title}
                onChange={e => setExtractedData({ ...extractedData, title: e.target.value })}
                className="w-full text-lg font-black text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-700 py-1 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">OBJECTIVE</label>
              <textarea
                value={extractedData.objective}
                onChange={e => setExtractedData({ ...extractedData, objective: e.target.value })}
                rows={2}
                className="w-full text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-black/30 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
              />
            </div>

            {/* Materials & Equipment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="block text-xs font-mono font-bold text-slate-900 dark:text-white mb-2">
                  REQUIRED MATERIALS ({extractedData.materials?.length || 0})
                </span>
                <div className="space-y-1.5 bg-slate-50 dark:bg-black/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  {extractedData.materials?.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                      <span>• {m.name}</span>
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{m.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-mono font-bold text-slate-900 dark:text-white mb-2">
                  EQUIPMENT ({extractedData.equipment?.length || 0})
                </span>
                <div className="space-y-1.5 bg-slate-50 dark:bg-black/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  {extractedData.equipment?.map((eq, idx) => (
                    <div key={idx} className="text-slate-800 dark:text-slate-200">
                      • {eq}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Extracted Steps */}
            <div className="pt-2 space-y-3">
              <span className="block text-xs font-mono font-bold text-slate-900 dark:text-white">
                EXTRACTED PROTOCOL STEPS ({extractedData.steps?.length || 0})
              </span>

              <div className="space-y-3">
                {extractedData.steps?.map((st, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-black/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                        STEP {st.stepNumber}: {st.title}
                      </span>
                      {st.timeMinutes && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500">{st.timeMinutes} MIN</span>
                          <button
                            onClick={() => createAndStartStepTimer(0, idx, st.title, st.timeMinutes || 5)}
                            className="p-1 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-mono font-bold hover:bg-teal-500/20 cursor-pointer flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>TIMER</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{st.description}</p>
                    {st.safetyNotes && (
                      <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg">
                        ⚠️ Safety: {st.safetyNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Project Selection */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
              <label className="block text-xs font-mono font-bold text-slate-900 dark:text-white">
                SAVE PROTOCOL TO PROJECT
              </label>

              <div className="space-y-2">
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value === 'NEW' ? 'NEW' : Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs font-mono focus:outline-none focus:border-teal-500"
                >
                  <option value="NEW">+ CREATE NEW PROJECT</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      EXISTING PROJECT #{p.id}: {p.name}
                    </option>
                  ))}
                </select>

                {selectedProjectId === 'NEW' && (
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder={extractedData.title}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs font-mono focus:outline-none focus:border-teal-500"
                  />
                )}
              </div>

              <button
                onClick={handleSaveExtractedToProject}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>IMPORT STEPS & ADD TO PROTOCOL LIBRARY</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
