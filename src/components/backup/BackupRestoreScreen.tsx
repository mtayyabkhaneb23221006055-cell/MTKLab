import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ArrowRight,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

export const BackupRestoreScreen: React.FC = () => {
  const { exportData, restoreBackup, storage } = useApp();

  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackupFile(file);
      setParseError(null);
      setRestoreSuccess(false);

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          setJsonText(content);
          const parsed = JSON.parse(content);
          if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid JSON format');
          }
          setParsedPreview(parsed);
        } catch (err) {
          setParseError('Uploaded file is not a valid JSON backup package.');
          setParsedPreview(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteRestore = () => {
    if (!jsonText) return;
    const ok = restoreBackup(jsonText);
    if (ok) {
      setRestoreSuccess(true);
      setParsedPreview(null);
      setBackupFile(null);
    } else {
      setParseError('Failed to restore database from selected backup package.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-2 border border-teal-500/30">
            <Database className="w-3.5 h-3.5" />
            <span>DATA REDUNDANCY & RESTORE</span>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">BACKUP & RESTORE</h2>
          <p className="text-xs text-slate-300 mt-1">
            Export offline snapshot backups or restore laboratory records from JSON archives.
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
          <HardDrive className="w-8 h-8 text-teal-400" />
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">
              CREATE OFFLINE BACKUP PACKAGE
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">JSON FORMAT</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          Generates a complete, uncompressed JSON backup file containing all current projects, protocols, timer configurations, colony counter records, and user settings.
        </p>

        <button
          onClick={exportData}
          className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD BACKUP FILE (.JSON)</span>
        </button>
      </div>

      {/* Restore Section */}
      <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">
              RESTORE FROM BACKUP ARCHIVE
            </h3>
          </div>
        </div>

        {restoreSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Database restored successfully! All projects and protocols updated.</span>
          </div>
        )}

        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-black/20">
          <label className="cursor-pointer space-y-2 block">
            <FileCode className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {backupFile ? backupFile.name : 'Select MTKmicro JSON Backup File'}
            </p>
            <p className="text-xs text-slate-500">Click to browse or drag and drop package</p>
            <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {parseError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {parsedPreview && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
            <span className="font-bold text-slate-900 dark:text-white block uppercase">
              BACKUP CONTENTS PREVIEW
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
              <div>• Projects: {parsedPreview.projects?.length || 0}</div>
              <div>• Protocols: {parsedPreview.savedProtocols?.length || 0}</div>
              <div>• Steps: {parsedPreview.steps?.length || 0}</div>
              <div>• Colony Sessions: {parsedPreview.colonyCounts?.length || 0}</div>
              <div>• Cell Counts: {parsedPreview.cellCounts?.length || 0}</div>
              <div>• Export Date: {parsedPreview.exportDate ? new Date(parsedPreview.exportDate).toLocaleDateString() : 'N/A'}</div>
            </div>

            <button
              onClick={handleExecuteRestore}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>OVERWRITE & RESTORE DATABASE</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
