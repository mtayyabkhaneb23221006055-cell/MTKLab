import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Database,
  CloudOff,
  Sparkles,
  Trash2,
  AlertTriangle,
  HardDrive,
  FileText,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
} from 'lucide-react';

export const PrivacyCenterScreen: React.FC = () => {
  const { userProfile, updateUserProfile, clearAllData, exportData } = useApp();

  const [allowAiCloud, setAllowAiCloud] = useState(userProfile.allowAiCloudProcessing ?? true);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(userProfile.isCloudSyncEnabled ?? true);
  const [confirmClearModal, setConfirmClearModal] = useState(false);

  const handleToggleAiCloud = () => {
    const val = !allowAiCloud;
    setAllowAiCloud(val);
    updateUserProfile({ allowAiCloudProcessing: val });
  };

  const handleToggleCloudSync = () => {
    const val = !cloudSyncEnabled;
    setCloudSyncEnabled(val);
    updateUserProfile({ isCloudSyncEnabled: val });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-2 border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DATA GOVERNANCE & PRIVACY</span>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">PRIVACY & SECURITY CENTER</h2>
          <p className="text-xs text-slate-300 mt-1">
            Local-first architecture assurances, AI processing consents, and data deletion tools.
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
          <Lock className="w-8 h-8 text-teal-400" />
        </div>
      </div>

      {/* Local First Principle Banner */}
      <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
          <HardDrive className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">
            LOCAL-FIRST DATA GUARANTEE
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          MTKmicro Lab stores 100% of your projects, protocols, cell counts, calibrations, and calculations directly in your device’s local database storage. The application is fully functional offline without requiring cloud services or accounts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">STORAGE TYPE</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">IndexedDB & Encrypted LocalStorage</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">OFFLINE CAPABILITY</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Operational Offline</span>
          </div>
        </div>
      </div>

      {/* Cloud & AI Consents */}
      <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-2">
          AI & CLOUD PROCESSING PREFERENCES
        </h3>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Allow AI Cloud Protocol Processing
              </span>
              <p className="text-xs text-slate-500">
                Enables Gemini AI server proxy for protocol image scanning and conversational AI assistant queries.
              </p>
            </div>
            <button onClick={handleToggleAiCloud} className="text-teal-600 dark:text-teal-400 cursor-pointer">
              {allowAiCloud ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
            </button>
          </div>

          <div className="flex items-start justify-between gap-4 border-t border-slate-100 dark:border-white/5 pt-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Background Cloud Synchronization
              </span>
              <p className="text-xs text-slate-500">
                Automatically back up laboratory records to MTKmicro Cloud vault when connected to Wi-Fi.
              </p>
            </div>
            <button onClick={handleToggleCloudSync} className="text-teal-600 dark:text-teal-400 cursor-pointer">
              {cloudSyncEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Data Export & Deletion */}
      <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-2">
          DATA MANAGEMENT & PURGE TOOLS
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportData}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>EXPORT FULL DATABASE (.JSON)</span>
          </button>

          <button
            onClick={() => setConfirmClearModal(true)}
            className="py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 border border-rose-500/30 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>PURGE ALL LOCAL DATA</span>
          </button>
        </div>
      </div>

      {/* Confirm Clear Modal */}
      {confirmClearModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121212] max-w-md w-full p-6 rounded-2xl border border-rose-500/40 space-y-4 text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">PURGE ALL LABORATORY RECORDS?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This action will permanently delete all local projects, protocol steps, multi-timer presets, colony counter sessions, and custom calculations from this device.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmClearModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  setConfirmClearModal(false);
                  clearAllData();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-mono font-bold text-xs uppercase cursor-pointer"
              >
                CONFIRM PURGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
