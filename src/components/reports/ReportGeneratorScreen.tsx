import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FormattedText } from '../../utils/textFormatting';
import {
  FileText,
  Printer,
  Download,
  CheckSquare,
  Square,
  AlertTriangle,
  Microscope,
  Calendar,
  User,
  Building,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ReportGeneratorScreen: React.FC = () => {
  const { projects, userProfile, storage } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<number>(
    (projects || []).length > 0 ? projects[0].id : 0
  );

  const selectedProject = (projects || []).find(p => p.id === selectedProjectId) || null;
  const projectSummary = selectedProject ? storage.getProjectSummary(selectedProject.id) : null;

  // Custom Report Options
  const [reportTitle, setReportTitle] = useState('Laboratory Experiment Summary Report');
  const [includeCover, setIncludeCover] = useState(true);
  const [includeObjective, setIncludeObjective] = useState(true);
  const [includeMaterials, setIncludeMaterials] = useState(true);
  const [includeSteps, setIncludeSteps] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeAnalyses, setIncludeAnalyses] = useState(true);
  const [userConclusion, setUserConclusion] = useState(
    'Bacterial transformation efficiency was within expected operational parameters (~1.2 x 10^6 CFU/µg DNA). No contamination observed on negative control plates.'
  );

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Configuration Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex items-center justify-between print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-2 border border-teal-500/30">
            <FileText className="w-3.5 h-3.5" />
            <span>EXPORT & COMPLIANCE</span>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">LABORATORY REPORT GENERATOR</h2>
          <p className="text-xs text-slate-300 mt-1">
            Generate formal laboratory reports, audit logs, and PDF documentation.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>PRINT / EXPORT PDF</span>
        </button>
      </div>

      {/* Control Configuration Panel */}
      <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm print:hidden">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-2">
          REPORT CONFIGURATION & SECTIONS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
              SELECT TARGET EXPERIMENT
            </label>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs font-mono focus:outline-none focus:border-teal-500"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  PROJECT #{p.id}: {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
              REPORT DOCUMENT TITLE
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={e => setReportTitle(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs font-mono focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Section Checkboxes */}
        <div className="pt-2">
          <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-2">
            INCLUDED SECTIONS
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <button
              onClick={() => setIncludeCover(!includeCover)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/30 text-left border border-slate-200 dark:border-slate-800"
            >
              {includeCover ? <CheckSquare className="w-4 h-4 text-teal-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              <span>Header / Metadata</span>
            </button>
            <button
              onClick={() => setIncludeObjective(!includeObjective)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/30 text-left border border-slate-200 dark:border-slate-800"
            >
              {includeObjective ? <CheckSquare className="w-4 h-4 text-teal-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              <span>Objective</span>
            </button>
            <button
              onClick={() => setIncludeSteps(!includeSteps)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/30 text-left border border-slate-200 dark:border-slate-800"
            >
              {includeSteps ? <CheckSquare className="w-4 h-4 text-teal-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              <span>Execution Steps</span>
            </button>
            <button
              onClick={() => setIncludeNotes(!includeNotes)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/30 text-left border border-slate-200 dark:border-slate-800"
            >
              {includeNotes ? <CheckSquare className="w-4 h-4 text-teal-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              <span>Project Notes</span>
            </button>
            <button
              onClick={() => setIncludeAnalyses(!includeAnalyses)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/30 text-left border border-slate-200 dark:border-slate-800"
            >
              {includeAnalyses ? <CheckSquare className="w-4 h-4 text-teal-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              <span>Analyses & Counts</span>
            </button>
          </div>
        </div>

        {/* AI Scientific Integrity Disclaimer */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>SCIENTIFIC INTEGRITY NOTICE</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            MTKmicro AI strictly refrains from fabricating experimental findings or observations. Please enter your primary scientific observations and conclusion below.
          </p>
          <textarea
            value={userConclusion}
            onChange={e => setUserConclusion(e.target.value)}
            rows={2}
            placeholder="Enter your experimental conclusions and observations..."
            className="w-full mt-1 p-2 bg-white dark:bg-black/50 rounded-lg text-xs font-mono border border-amber-500/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Printable Report Document Card */}
      {selectedProject && (
        <div className="bg-white text-slate-900 p-8 rounded-2xl border border-slate-300 shadow-2xl space-y-6 font-sans print:shadow-none print:border-none print:p-0">
          {/* Cover Header */}
          {includeCover && (
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-teal-700 font-mono font-black text-xs uppercase tracking-widest">
                  <Microscope className="w-4 h-4" />
                  <span>MTKMICRO LABORATORY SUITE • OFFICIAL REPORT</span>
                </div>
                <h1 className="text-2xl font-black uppercase text-slate-900 mt-1">{reportTitle}</h1>
                <p className="text-sm font-bold text-teal-800 mt-0.5">
                  EXPERIMENT: #{selectedProject.id} — {selectedProject.name}
                </p>
              </div>

              <div className="text-right text-xs font-mono text-slate-600 space-y-1">
                <p>
                  <strong>AUTHOR:</strong> {userProfile.name || 'Researcher'}
                </p>
                <p>
                  <strong>INSTITUTION:</strong> {userProfile.institution || 'Lab'}
                </p>
                <p>
                  <strong>DATE:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Objective */}
          {includeObjective && selectedProject.description && (
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                1. EXPERIMENTAL OBJECTIVE
              </h3>
              <p className="text-xs leading-relaxed text-slate-800">{selectedProject.description}</p>
            </div>
          )}

          {/* Execution Steps */}
          {includeSteps && projectSummary && projectSummary.steps && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                2. PROTOCOL EXECUTION LOG ({(projectSummary.steps || []).length} STEPS)
              </h3>
              <div className="space-y-2">
                {(projectSummary.steps || []).map((st, i) => (
                  <div key={st.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>
                        STEP {i + 1}: {st.title} [{st.groupName}]
                      </span>
                      <span className={st.isCompleted ? 'text-emerald-700' : 'text-amber-700'}>
                        {st.isCompleted ? '✓ COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                    {st.description && <p className="text-slate-600">{st.description}</p>}
                    {st.notes && <p className="text-[11px] font-mono text-slate-500">Note: {st.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Notes */}
          {includeNotes && projectSummary && (projectSummary.notes || []).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                3. LABORATORY OBSERVATION NOTES
              </h3>
              <div className="space-y-2">
                {(projectSummary.notes || []).map(n => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <FormattedText content={n.content} />
                    <span className="text-[10px] font-mono text-slate-400 block mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Conclusion */}
          <div className="space-y-1 pt-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
              4. RESEARCHER CONCLUSION & OBSERVATIONS
            </h3>
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-slate-800 leading-relaxed font-mono">
              {userConclusion || 'No conclusions entered.'}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs font-mono">
            <div>
              <p className="font-bold text-slate-700">PRIMARY INVESTIGATOR SIGNATURE</p>
              <div className="h-12 border-b border-slate-400 mt-2"></div>
              <p className="text-[10px] text-slate-500 mt-1">{userProfile.name} • {new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-bold text-slate-700">QUALITY ASSURANCE REVIEW</p>
              <div className="h-12 border-b border-slate-400 mt-2"></div>
              <p className="text-[10px] text-slate-500 mt-1">MTKmicro Lab Compliance Verification</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
