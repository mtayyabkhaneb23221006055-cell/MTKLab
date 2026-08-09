import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CalculatorType } from '../../types';
import { MtkCard } from '../common/MtkCard';
import {
  Atom,
  FlaskConical,
  Binary,
  Dna,
  TestTube,
  Scale,
  Calculator,
  ArrowRight,
  Disc,
  ListPlus,
  Grid3X3,
  ImageIcon,
  TrendingUp,
  Eye,
  Activity,
  CalendarCheck,
  Ruler,
  Sparkles,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

interface ToolItem {
  id: CalculatorType;
  title: string;
  subtitle: string;
  category: 'MICROBIOLOGY' | 'MOLECULAR BIOLOGY' | 'CELL BIOLOGY' | 'IMAGE ANALYSIS' | 'CALCULATORS';
  icon: React.FC<{ className?: string }>;
  color: string;
}

export const ToolsGridScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const tools: ToolItem[] = [
    // MICROBIOLOGY
    {
      id: 'equipment_sop',
      title: 'EQUIPMENT & INSTRUMENTS HUB',
      subtitle: 'SOP instructions, calibration methods & validity verification',
      category: 'MICROBIOLOGY',
      icon: Wrench,
      color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
    },
    {
      id: 'food_safety_analyzer',
      title: 'FOOD SAFETY INTELLIGENCE',
      subtitle: '8-step hazard evaluation, BAM/ISO methods & testing reports',
      category: 'MICROBIOLOGY',
      icon: ShieldAlert,
      color: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'colony_counter',
      title: 'AI COLONY COUNTER',
      subtitle: 'Image processing, colony detection & CFU/mL formula',
      category: 'MICROBIOLOGY',
      icon: Disc,
      color: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30',
    },
    {
      id: 'custom_counter',
      title: 'CUSTOM TALLY COUNTER',
      subtitle: 'Multi-category manual counting & session logging',
      category: 'MICROBIOLOGY',
      icon: ListPlus,
      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'plate_labelling',
      title: 'PLATE LABELLING',
      subtitle: 'Interactive 6 to 96 well map, auto-fill & pattern copy',
      category: 'MICROBIOLOGY',
      icon: Grid3X3,
      color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
    },

    // MOLECULAR BIOLOGY
    {
      id: 'gel_annotator',
      title: 'GEL / BLOT ANNOTATOR',
      subtitle: 'Draw lanes, bands, text, arrows & export images',
      category: 'MOLECULAR BIOLOGY',
      icon: ImageIcon,
      color: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
    },
    {
      id: 'calibration_curve',
      title: 'CALIBRATION CURVE',
      subtitle: 'Linear regression, R², slope & unknown concentration',
      category: 'MOLECULAR BIOLOGY',
      icon: TrendingUp,
      color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
    },
    {
      id: 'master_mix',
      title: 'MASTER MIX CALCULATOR',
      subtitle: 'PCR reaction volume, overage % & recipes',
      category: 'MOLECULAR BIOLOGY',
      icon: Dna,
      color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
    },
    {
      id: 'buffer',
      title: 'MEDIUM / BUFFER PREP',
      subtitle: 'Solid mass & liquid stock calculations',
      category: 'MOLECULAR BIOLOGY',
      icon: TestTube,
      color: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30',
    },

    // CELL BIOLOGY
    {
      id: 'cell_counter',
      title: 'CELL COUNTER',
      subtitle: 'Microscopy cell detection & concentration / mL',
      category: 'CELL BIOLOGY',
      icon: Eye,
      color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
    },
    {
      id: 'blood_cell_counter',
      title: 'BLOOD CELL COUNTER',
      subtitle: 'Research RBC, WBC & Platelet differential counting',
      category: 'CELL BIOLOGY',
      icon: Activity,
      color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    },
    {
      id: 'cell_culture_tracker',
      title: 'CELL CULTURE TRACKER',
      subtitle: 'Passage records, confluency timeline & vessel logs',
      category: 'CELL BIOLOGY',
      icon: CalendarCheck,
      color: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/30',
    },

    // IMAGE ANALYSIS
    {
      id: 'image_measurer',
      title: 'IMAGE MEASUREMENT TOOL',
      subtitle: 'Scale calibration & micron/mm distance measuring',
      category: 'IMAGE ANALYSIS',
      icon: Ruler,
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    },

    // CALCULATORS
    {
      id: 'molarity',
      title: 'MOLARITY CALCULATOR',
      subtitle: 'Solve Molar, Mass, MW, Volume or Moles',
      category: 'CALCULATORS',
      icon: Atom,
      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'dilution',
      title: 'DILUTION (C1V1 = C2V2)',
      subtitle: 'Stock volume, diluent & dilution factor',
      category: 'CALCULATORS',
      icon: FlaskConical,
      color: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30',
    },
    {
      id: 'serial_dilution',
      title: 'SERIAL DILUTION',
      subtitle: 'Multi-tube step table generator',
      category: 'CALCULATORS',
      icon: Binary,
      color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'unit_converter',
      title: 'UNIT CONVERTER',
      subtitle: 'Mass, Vol, Length, Time, Temp, Conc',
      category: 'CALCULATORS',
      icon: Scale,
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    },
    {
      id: 'scientific',
      title: 'SCIENTIFIC CALCULATOR',
      subtitle: 'Expression parser with logs & powers',
      category: 'CALCULATORS',
      icon: Calculator,
      color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    },
  ];

  const categories = [
    'ALL',
    'MICROBIOLOGY',
    'MOLECULAR BIOLOGY',
    'CELL BIOLOGY',
    'IMAGE ANALYSIS',
    'CALCULATORS',
  ];

  const filteredTools = selectedCategory === 'ALL'
    ? tools
    : tools.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-slate-900 dark:bg-[#121215] text-white p-5 rounded-2xl border-2 border-slate-900 dark:border-white/20">
        <div className="flex items-center gap-1.5 text-teal-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em]">
            LABORATORY ANALYSIS SUITE v2.0
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tighter uppercase text-white mt-1">
          ADVANCED LAB TOOLS
        </h2>
        <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
          Complete scientific suite featuring AI image analysis, colony counting, gel annotation, micro-measurements, and calibration curves.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-white dark:bg-[#121215] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/15 hover:border-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <MtkCard
              key={tool.id}
              onClick={() => navigateTo({ type: 'CALCULATOR', toolId: tool.id })}
              className="flex items-center justify-between p-4 border-2 border-slate-300 dark:border-white/15 hover:border-slate-900 dark:hover:border-teal-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 ${tool.color} group-hover:scale-105 transition-transform flex-shrink-0`}
                >
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                    {tool.category}
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider leading-tight">
                    {tool.title}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {tool.subtitle}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 stroke-[2.5] group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2" />
            </MtkCard>
          );
        })}
      </div>
    </div>
  );
};
