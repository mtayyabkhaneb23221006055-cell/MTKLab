import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodSampleWorkflow } from './FoodSampleWorkflow';
import { FoodReferenceBrowser } from './FoodReferenceBrowser';
import { LabResourceCapabilities } from './LabResourceCapabilities';
import { FoodSampleDetailView } from './FoodSampleDetailView';
import { FoodSample } from '../../types';
import {
  ShieldAlert,
  FlaskConical,
  BookOpen,
  Boxes,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  FolderPlus,
  ArrowUpRight,
} from 'lucide-react';

export const FoodSafetyScreen: React.FC = () => {
  const { foodSamples, foodTestPlans, deleteFoodSample, createProjectFromFoodSample, openProjectDetail } = useApp();

  const [activeTab, setActiveTab] = useState<'WORKFLOW' | 'SAMPLES' | 'KNOWLEDGE_BASE' | 'CAPABILITIES'>('SAMPLES');
  const [selectedSample, setSelectedSample] = useState<FoodSample | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const safeFoodSamples = foodSamples || [];
  const safeFoodTestPlans = foodTestPlans || [];

  const filteredSamples = safeFoodSamples.filter(s => {
    const matchesQuery =
      s.sampleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.foodCategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || s.foodCategory === filterCategory;
    return matchesQuery && matchesCat;
  });

  const activeTestingCount = safeFoodSamples.filter(s => s.status === 'Testing in Progress').length;
  const completedCount = safeFoodSamples.filter(s => s.status === 'Completed').length;

  const handleCreateProject = (sampleId: string) => {
    try {
      const proj = createProjectFromFoodSample(sampleId);
      openProjectDetail(proj.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <ShieldAlert className="w-48 h-48 sm:w-64 sm:h-64" />
        </div>

        <div className="relative z-10 space-y-2 sm:space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-xl text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              Phase 4 Major Module
            </span>
            <span className="text-[10px] sm:text-xs text-teal-200/80 font-mono">MTKmicro Decision Engine</span>
          </div>

          <h1 className="text-base sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
            Food Safety Intelligence & Microbiological Recommendation Engine
          </h1>

          <p className="text-xs text-teal-100/80 leading-relaxed font-medium">
            Deterministic rule-based hazard evaluation, regulatory method matching (FDA BAM / ISO), selective media stock integration, and formal report generation for food testing laboratories.
          </p>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-teal-800/60 text-xs">
            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl">
              <span className="text-teal-200 text-[11px] block">Registered Food Samples</span>
              <span className="text-lg font-black text-white">{foodSamples.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl">
              <span className="text-teal-200 text-[11px] block">Active Testing</span>
              <span className="text-lg font-black text-amber-300">{activeTestingCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl">
              <span className="text-teal-200 text-[11px] block">Completed Analyses</span>
              <span className="text-lg font-black text-emerald-300">{completedCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl">
              <span className="text-teal-200 text-[11px] block">Planned Test Targets</span>
              <span className="text-lg font-black text-teal-300">{foodTestPlans.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Module Sub-Navigation Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SAMPLES')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'SAMPLES'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Food Samples Dashboard ({foodSamples.length})
          </button>

          <button
            onClick={() => setActiveTab('WORKFLOW')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'WORKFLOW'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FlaskConical className="w-4 h-4" /> 8-Step Food Safety Analyzer
          </button>

          <button
            onClick={() => setActiveTab('KNOWLEDGE_BASE')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'KNOWLEDGE_BASE'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Reference Knowledge Base
          </button>

          <button
            onClick={() => setActiveTab('CAPABILITIES')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'CAPABILITIES'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" /> Lab Stock & Capabilities
          </button>
        </div>

        {activeTab !== 'WORKFLOW' && (
          <button
            onClick={() => setActiveTab('WORKFLOW')}
            className={`px-3.5 py-2 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0`}
          >
            <Plus className="w-4 h-4" /> Analyze New Food Sample
          </button>
        )}
      </div>

      {/* MODULE TAB 1: SAMPLES DASHBOARD */}
      {activeTab === 'SAMPLES' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search food samples by name, ID, or lot..."
                className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Categories ({foodSamples.length})</option>
                <option value="Seafood">Seafood</option>
                <option value="Dairy">Dairy</option>
                <option value="Poultry & Meat">Poultry & Meat</option>
                <option value="Produce & Fresh Cut Vegetables">Produce & Fresh Cut</option>
                <option value="Ready-To-Eat (RTE) Prepared Meals">Ready-To-Eat (RTE)</option>
              </select>
            </div>
          </div>

          {/* Sample List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSamples.map(s => {
              const plans = safeFoodTestPlans.filter(tp => tp.sampleId === s.id);
              const completedPlans = plans.filter(tp => tp.status === 'Completed').length;

              return (
                <div
                  key={s.id}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 hover:border-teal-500/80 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                            {s.foodCategory}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">{s.id}</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-1">{s.sampleName}</h3>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                          s.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Product: <strong>{s.productType || s.foodCategory}</strong> | Lot: <strong>{s.lotBatchNumber || 'N/A'}</strong>
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        <span>Testing Progress</span>
                        <span>
                          {completedPlans}/{plans.length} Targets Tested
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${plans.length > 0 ? (completedPlans / plans.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedSample(s)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Test Plan & Report
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCreateProject(s.id)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Convert to standard project"
                      >
                        <FolderPlus className="w-3.5 h-3.5" /> Project
                      </button>

                      <button
                        onClick={() => deleteFoodSample(s.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete sample"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODULE TAB 2: 8-STEP WORKFLOW ANALYZER */}
      {activeTab === 'WORKFLOW' && (
        <FoodSampleWorkflow onComplete={() => setActiveTab('SAMPLES')} />
      )}

      {/* MODULE TAB 3: REFERENCE KNOWLEDGE BASE */}
      {activeTab === 'KNOWLEDGE_BASE' && <FoodReferenceBrowser />}

      {/* MODULE TAB 4: LAB CAPABILITIES & STOCK */}
      {activeTab === 'CAPABILITIES' && <LabResourceCapabilities />}

      {/* Sample Detail View Modal */}
      {selectedSample && <FoodSampleDetailView sample={selectedSample} onClose={() => setSelectedSample(null)} />}
    </div>
  );
};
