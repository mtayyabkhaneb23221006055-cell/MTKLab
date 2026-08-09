import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProtocolStep } from '../../types';
import { MtkCard } from '../common/MtkCard';
import { MtkButton } from '../common/MtkButton';
import { StatusChip, TagChip } from '../common/TagChip';
import { MtkDialog } from '../common/MtkDialog';
import { CreateEditProjectModal } from './CreateEditProjectModal';
import { CreateEditStepModal } from './CreateEditStepModal';
import {
  MoreVertical,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Timer,
  Play,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  FileText,
  Boxes,
  Clock,
  ListChecks,
} from 'lucide-react';

export const ProjectDetailScreen: React.FC = () => {
  const {
    activeProject,
    deleteProject,
    storage,
    toggleStep,
    deleteStep,
    reorderSteps,
    createAndStartStepTimer,
    timers,
    navigateTo,
    saveProject,
  } = useApp();

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ProtocolStep | null>(null);
  const [targetGroupForNewStep, setTargetGroupForNewStep] = useState('Protocol Steps');

  // Notes & Materials edit state
  const [isEditingMaterials, setIsEditingMaterials] = useState(false);
  const [materialsText, setMaterialsText] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  // Collapsible sections
  const [isProtocolOpen, setIsProtocolOpen] = useState(true);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isTimersOpen, setIsTimersOpen] = useState(true);

  // Overflow menu state
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-500">
        Project not found or deleted.
        <div className="mt-4">
          <MtkButton onClick={() => navigateTo({ type: 'PROJECTS' })}>Return to Projects</MtkButton>
        </div>
      </div>
    );
  }

  const steps = storage.getStepsByProject(activeProject.id);
  const projectNotes = storage.getNotesForProject(activeProject.id);
  const projectTimers = timers.filter(t => t.projectId === activeProject.id);

  // Group steps by groupName
  const groupedSteps: Record<string, ProtocolStep[]> = {};
  steps.forEach(s => {
    const group = s.groupName || 'Protocol Steps';
    if (!groupedSteps[group]) groupedSteps[group] = [];
    groupedSteps[group].push(s);
  });

  const handleStartMaterialsEdit = () => {
    setMaterialsText(projectNotes.materials);
    setIsEditingMaterials(true);
  };

  const handleSaveMaterials = () => {
    storage.saveProjectNote(activeProject.id, 'MATERIALS', materialsText);
    setIsEditingMaterials(false);
  };

  const handleStartNotesEdit = () => {
    setNotesText(projectNotes.notes);
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    storage.saveProjectNote(activeProject.id, 'NOTES', notesText);
    setIsEditingNotes(false);
  };

  // Step Move Up / Down within group
  const handleMoveStep = (step: ProtocolStep, direction: 'UP' | 'DOWN') => {
    const groupList = groupedSteps[step.groupName] || [];
    const index = groupList.findIndex(s => s.id === step.id);
    if (index === -1) return;

    if (direction === 'UP' && index > 0) {
      const newOrder = [...groupList];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;
      const allStepIds = steps.map(s => {
        const inGroup = newOrder.find(g => g.id === s.id);
        return inGroup ? inGroup.id : s.id;
      });
      reorderSteps(activeProject.id, allStepIds);
    } else if (direction === 'DOWN' && index < groupList.length - 1) {
      const newOrder = [...groupList];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;
      const allStepIds = steps.map(s => {
        const inGroup = newOrder.find(g => g.id === s.id);
        return inGroup ? inGroup.id : s.id;
      });
      reorderSteps(activeProject.id, allStepIds);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Project Header Card */}
      <MtkCard className="relative p-5 border-teal-200 dark:border-teal-900 bg-gradient-to-br from-white to-teal-50/30 dark:from-slate-900 dark:to-teal-950/20">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {activeProject.name}
              </h1>
              <StatusChip status={activeProject.status} />
            </div>

            {activeProject.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeProject.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap pt-2">
              {(activeProject.tags || []).map(t => (
                <TagChip key={t} label={t} />
              ))}
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono ml-auto">
                Created: {new Date(activeProject.date).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Overflow Three Dots Menu */}
          <div className="relative">
            <button
              onClick={() => setIsOverflowOpen(!isOverflowOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Project Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isOverflowOpen && (
              <div className="absolute right-0 top-10 z-30 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    setIsEditProjectOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="w-4 h-4 text-slate-400" /> Edit Project
                </button>
                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    setIsDeleteConfirmOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" /> Delete Project
                </button>
              </div>
            )}
          </div>
        </div>
      </MtkCard>

      {/* SECTION 1: PROTOCOL STEPS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <button
          onClick={() => setIsProtocolOpen(!isProtocolOpen)}
          className="w-full p-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">PROTOCOL STEPS</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
              {steps.filter(s => s.isCompleted).length} / {steps.length}
            </span>
          </div>
          {isProtocolOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {isProtocolOpen && (
          <div className="p-4 space-y-6">
            {Object.keys(groupedSteps).length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                No protocol steps yet. Click below to add your first step.
              </div>
            ) : (
              Object.entries(groupedSteps).map(([groupName, groupStepList]) => (
                <div key={groupName} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      {groupName}
                    </h3>
                    <button
                      onClick={() => {
                        setTargetGroupForNewStep(groupName);
                        setEditingStep(null);
                        setIsAddStepOpen(true);
                      }}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Step
                    </button>
                  </div>

                  {groupStepList.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        step.isCompleted
                          ? 'bg-slate-50/80 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 opacity-75'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-teal-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="mt-0.5 text-teal-600 dark:text-teal-400 hover:scale-110 transition-transform cursor-pointer"
                          aria-label="Toggle Step"
                        >
                          {step.isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 hover:text-teal-500" />
                          )}
                        </button>

                        {/* Step Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-400 font-mono">
                              Step {idx + 1}
                            </span>
                            <h4
                              className={`text-sm font-bold text-slate-900 dark:text-slate-100 ${
                                step.isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : ''
                              }`}
                            >
                              {step.title}
                            </h4>
                            {step.durationMinutes && (
                              <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                                {step.durationMinutes} min
                              </span>
                            )}
                          </div>

                          {step.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {step.description}
                            </p>
                          )}

                          {step.notes && (
                            <div className="mt-2 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2 rounded-lg border border-amber-200 dark:border-amber-800/80">
                              ⚠️ Note: {step.notes}
                            </div>
                          )}

                          {/* Quick Action Buttons per step */}
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {step.durationMinutes && (
                              <button
                                onClick={() =>
                                  createAndStartStepTimer(
                                    activeProject.id,
                                    step.id,
                                    step.title,
                                    step.durationMinutes!
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3 h-3" /> Start {step.durationMinutes}m Timer
                              </button>
                            )}

                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={() => handleMoveStep(step, 'UP')}
                                disabled={idx === 0}
                                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveStep(step, 'DOWN')}
                                disabled={idx === groupStepList.length - 1}
                                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStep(step);
                                  setIsAddStepOpen(true);
                                }}
                                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="Edit Step"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteStep(step.id)}
                                className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                                title="Delete Step"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}

            <div className="pt-2">
              <MtkButton
                variant="outlined"
                fullWidth
                icon={Plus}
                onClick={() => {
                  setTargetGroupForNewStep('New Protocol Group');
                  setEditingStep(null);
                  setIsAddStepOpen(true);
                }}
              >
                Add Protocol Group / Step
              </MtkButton>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: MATERIALS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsMaterialsOpen(!isMaterialsOpen)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Boxes className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">MATERIALS & REAGENTS</h2>
          </button>
          <div className="flex items-center gap-2">
            {!isEditingMaterials && (
              <button
                onClick={handleStartMaterialsEdit}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Edit Materials
              </button>
            )}
            <button onClick={() => setIsMaterialsOpen(!isMaterialsOpen)} className="p-1 text-slate-400 cursor-pointer">
              {isMaterialsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMaterialsOpen && (
          <div className="p-4">
            {isEditingMaterials ? (
              <div className="space-y-3">
                <textarea
                  rows={5}
                  value={materialsText}
                  onChange={e => setMaterialsText(e.target.value)}
                  placeholder="List enzymes, primers, buffers, media, plasmid vectors..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex justify-end gap-2">
                  <MtkButton size="sm" variant="ghost" onClick={() => setIsEditingMaterials(false)}>
                    Cancel
                  </MtkButton>
                  <MtkButton size="sm" variant="primary" onClick={handleSaveMaterials}>
                    Save Materials
                  </MtkButton>
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {projectNotes.materials || 'No materials listed yet. Click "Edit Materials" to add reagents.'}
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 3: NOTES */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setIsNotesOpen(!isNotesOpen)} className="flex items-center gap-2 cursor-pointer">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">LABORATORY NOTES</h2>
          </button>
          <div className="flex items-center gap-2">
            {!isEditingNotes && (
              <button
                onClick={handleStartNotesEdit}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Edit Notes
              </button>
            )}
            <button onClick={() => setIsNotesOpen(!isNotesOpen)} className="p-1 text-slate-400 cursor-pointer">
              {isNotesOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isNotesOpen && (
          <div className="p-4">
            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={notesText}
                  onChange={e => setNotesText(e.target.value)}
                  placeholder="Record observations, gel band sizes, spectrophotometer readings..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex justify-end gap-2">
                  <MtkButton size="sm" variant="ghost" onClick={() => setIsEditingNotes(false)}>
                    Cancel
                  </MtkButton>
                  <MtkButton size="sm" variant="primary" onClick={handleSaveNotes}>
                    Save Notes
                  </MtkButton>
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {projectNotes.notes || 'No notes added yet. Click "Edit Notes" to record laboratory observations.'}
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 4: ASSOCIATED TIMERS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <button
          onClick={() => setIsTimersOpen(!isTimersOpen)}
          className="w-full p-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">ASSOCIATED TIMERS</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-bold">
              {projectTimers.length}
            </span>
          </div>
          {isTimersOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {isTimersOpen && (
          <div className="p-4 space-y-2">
            {projectTimers.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-xs">
                No active or completed timers for this project yet.
              </div>
            ) : (
              projectTimers.map(t => (
                <div
                  key={t.id}
                  onClick={() => navigateTo({ type: 'TIMERS' })}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 cursor-pointer"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.name}</h4>
                    <span className="text-[11px] font-mono text-slate-500">Status: {t.status}</span>
                  </div>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${t.status === 'RUNNING' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'}`}>
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* SECTION 5: LINKED LAB ANALYSES & TOOL OUTPUTS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">LINKED LAB ANALYSES</h2>
          </div>
          <button
            onClick={() => navigateTo({ type: 'TOOLS' })}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            + Open Tools
          </button>
        </div>

        <div className="p-4 space-y-2">
          {(() => {
            const analyses = storage.getProjectAnalyses(activeProject.id);
            const totalItems =
              (analyses?.plates?.length || 0) +
              (analyses?.colonyCounts?.length || 0) +
              (analyses?.gelAnnotations?.length || 0) +
              (analyses?.imageMeasurements?.length || 0) +
              (analyses?.calibrations?.length || 0) +
              (analyses?.cellCounts?.length || 0) +
              (analyses?.bloodCellCounts?.length || 0) +
              (analyses?.cellCultures?.length || 0) +
              (analyses?.customCounters?.length || 0);

            if (totalItems === 0) {
              return (
                <div className="text-center py-4 text-slate-500 text-xs">
                  No plate maps, colony counts, or gel annotations linked to this project yet. Use any tool in the Lab Tools tab to link results.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analyses.plates.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigateTo({ type: 'CALCULATOR', toolId: 'plate_labelling' })}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-teal-500"
                  >
                    <span className="text-[9px] font-mono font-bold uppercase text-teal-600 dark:text-teal-400">
                      Plate Map ({p.plateType}-Well)
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {p.name}
                    </h4>
                  </div>
                ))}

                {analyses.colonyCounts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigateTo({ type: 'CALCULATOR', toolId: 'colony_counter' })}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-teal-500"
                  >
                    <span className="text-[9px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                      Colony Count ({c.totalCount} colonies)
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.title}
                    </h4>
                  </div>
                ))}

                {analyses.gelAnnotations.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => navigateTo({ type: 'CALCULATOR', toolId: 'gel_annotator' })}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-teal-500"
                  >
                    <span className="text-[9px] font-mono font-bold uppercase text-sky-600 dark:text-sky-400">
                      Gel / Blot Annotation
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {g.title}
                    </h4>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Edit Project Modal */}
      <CreateEditProjectModal
        project={activeProject}
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
      />

      {/* Step Modal */}
      <CreateEditStepModal
        projectId={activeProject.id}
        step={editingStep}
        defaultGroup={targetGroupForNewStep}
        isOpen={isAddStepOpen}
        onClose={() => setIsAddStepOpen(false)}
      />

      {/* Delete Project Confirmation */}
      <MtkDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Project?"
        message="Delete this project and all its protocols, steps, and associated timers? This action cannot be undone."
        confirmLabel="Delete Project"
        isDanger
        onConfirm={() => deleteProject(activeProject.id)}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
