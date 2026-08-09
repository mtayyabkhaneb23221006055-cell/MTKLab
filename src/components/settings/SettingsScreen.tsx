import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MtkCard } from '../common/MtkCard';
import { MtkButton } from '../common/MtkButton';
import { MtkDialog } from '../common/MtkDialog';
import {
  Moon,
  Sun,
  Monitor,
  Bell,
  FlaskConical,
  Download,
  Trash2,
  Info,
  Code,
  CheckCircle2,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, exportData, clearAllData } = useApp();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20">
      {/* SECTION 1: APPEARANCE */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Appearance & Theme
            </h2>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Active: {settings.theme}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'LIGHT', label: 'Light', desc: 'Bright lab canvas', icon: Sun },
            { id: 'DARK', label: 'Dark', icon: Moon, desc: 'Eye-safe dark canvas' },
            { id: 'SYSTEM', label: 'System', icon: Monitor, desc: 'Auto OS setting' },
          ].map(themeItem => {
            const Icon = themeItem.icon;
            const isSelected = settings.theme === themeItem.id;

            return (
              <button
                key={themeItem.id}
                type="button"
                onClick={() => updateSettings({ theme: themeItem.id as typeof settings.theme })}
                className={`py-3.5 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm ring-1 ring-teal-500/50'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Icon className="w-4 h-4" />
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                </div>
                <div className="text-center">
                  <span className="block font-bold">{themeItem.label}</span>
                  <span className="block text-[9px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">{themeItem.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Theme Preview */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Theme Visual Preview</span>
            <span className="text-[10px] font-mono font-semibold text-slate-500">MTKMICRO UI</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Lab Protocol Canvas</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">High-contrast legibility verified</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-500 text-white">READY</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: NOTIFICATIONS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Timer Audio Notifications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Play scientific audio chime when a countdown timer reaches 0.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={e => updateSettings({ notificationsEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>
      </section>

      {/* SECTION 3: LAB DEFAULT UNITS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <FlaskConical className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Laboratory Default Units
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Default Volume Unit
            </label>
            <select
              value={settings.defaultVolumeUnit}
              onChange={e => updateSettings({ defaultVolumeUnit: e.target.value as typeof settings.defaultVolumeUnit })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="µL">µL (Microliters)</option>
              <option value="mL">mL (Milliliters)</option>
              <option value="L">L (Liters)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Default Conc Unit
            </label>
            <select
              value={settings.defaultConcUnit}
              onChange={e => updateSettings({ defaultConcUnit: e.target.value as typeof settings.defaultConcUnit })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="M">M (Molar)</option>
              <option value="mM">mM (Millimolar)</option>
              <option value="µM">µM (Micromolar)</option>
            </select>
          </div>
        </div>
      </section>

      {/* SECTION 4: DATA MANAGEMENT */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Download className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Data Export & Reset
          </h2>
        </div>

        <div className="space-y-2 pt-1">
          <MtkButton variant="outlined" fullWidth icon={Download} onClick={exportData}>
            Export Database as JSON
          </MtkButton>

          <MtkButton variant="danger" fullWidth icon={Trash2} onClick={() => setIsDeleteOpen(true)}>
            Clear All Laboratory Data
          </MtkButton>
        </div>
      </section>

      {/* SECTION 5: ABOUT */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            About MTKmicro Lab
          </h2>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-500">App Name:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">MTKmicro Lab</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-500">Android Package:</span>
            <span className="font-mono text-slate-900 dark:text-slate-100">com.mtkmicrolab.app</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-500">Version:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">1.0.0 (Phase 1)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-500">Target Platform:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Android 14 (API 34) / Jetpack Compose</span>
          </div>

          <p className="pt-2">
            MTKmicro Lab is a scientific companion designed for microbiology, molecular biology, biotechnology, and food microbiology research workflows.
          </p>

          <div className="pt-2">
            <MtkButton size="sm" variant="secondary" fullWidth icon={Code} onClick={() => setIsCodeModalOpen(true)}>
              View Native Android Architecture & Source Tree
            </MtkButton>
          </div>
        </div>
      </section>

      {/* SECTION 6: ANDROID APK DOWNLOAD */}
      <section className="bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-teal-200/60 dark:border-teal-800/60">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
              Android Application Package (APK)
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
            v1.0.0 • 1.4 MB
          </span>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          Download and install <strong>MTKmicroLab.apk</strong> directly onto your Android smartphone or tablet.
        </p>

        <div className="pt-1 flex flex-col sm:flex-row gap-2">
          {/* Direct Download Button via JS window.open */}
          <button
            onClick={() => {
              const downloadUrl = `${window.location.origin}/api/download-apk`;
              window.open(downloadUrl, '_blank');
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer text-center"
          >
            <Download className="w-4 h-4" /> Download APK (Direct Link)
          </button>

          {/* Fallback Direct Anchor Download */}
          <a
            href="/MTKmicroLab.apk"
            download="MTKmicroLab.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer text-center"
          >
            <Download className="w-4 h-4" /> Mirror Download
          </a>
        </div>

        {/* Android Installation Instructions */}
        <div className="mt-3 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-teal-200/80 dark:border-teal-800/50 space-y-1.5 text-[11px]">
          <span className="font-bold text-slate-900 dark:text-teal-300 block uppercase font-mono">
            📱 How to Install on Android:
          </span>
          <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-300">
            <li>Click <strong>Download APK</strong> above to save <code className="text-teal-600 dark:text-teal-400 font-mono">MTKmicroLab.apk</code> to your device.</li>
            <li>Open your Android device's <strong>Downloads</strong> folder or tap the notification when download completes.</li>
            <li>If prompted, allow <strong>"Install from Unknown Sources"</strong> in Android Settings → Security / Chrome permissions.</li>
            <li>Tap <strong>Install</strong> to finish launching MTKmicro Lab on your phone.</li>
          </ol>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <MtkDialog
        isOpen={isDeleteOpen}
        title="Delete All Laboratory Data?"
        message="This will permanently delete all projects, protocols, timers, and saved recipes. This action cannot be undone."
        confirmLabel="Permanently Delete All Data"
        isDanger
        onConfirm={() => {
          clearAllData();
          setIsDeleteOpen(false);
        }}
        onCancel={() => setIsDeleteOpen(false)}
      />

      {/* Android Codebase Architecture Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Code className="w-5 h-5 text-teal-600" /> Native Kotlin Android Project Structure
              </h3>
              <button onClick={() => setIsCodeModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-900 text-teal-300 p-4 rounded-xl overflow-x-auto leading-relaxed">
{`MTKmicroLab/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/mtkmicrolab/app/
│   │   │   │   ├── MTKmicroLabApp.kt (Application class, Hilt entry)
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── di/ (AppModule, DatabaseModule)
│   │   │   │   ├── data/
│   │   │   │   │   ├── local/ (AppDatabase, DAOs, Entities)
│   │   │   │   │   └── repository/ (RepositoryImpl)
│   │   │   │   ├── ui/
│   │   │   │   │   ├── theme/ (Theme.kt, Color.kt)
│   │   │   │   │   ├── components/ (MtkButton, MtkCard)
│   │   │   │   │   └── navigation/ (NavGraph)
│   │   │   │   └── service/ (TimerForegroundService.kt)
│   │   │   └── AndroidManifest.xml
├── build.gradle.kts (Project)
└── app/build.gradle.kts (App)`}
            </div>

            <p className="text-xs text-slate-500">
              This layout mirrors the exact production Jetpack Compose MVVM Android application architecture for <strong>com.mtkmicrolab.app</strong>.
            </p>

            <div className="flex justify-end">
              <MtkButton size="sm" variant="primary" onClick={() => setIsCodeModalOpen(false)}>
                Close Window
              </MtkButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
