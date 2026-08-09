import React, { useState } from 'react';
import { SUSPECTED_ORGANISMS_DB, MEDIA_DATABASE, REFERENCE_STANDARDS_KB } from '../../db/foodSafetyDatabase';
import { Search, Bug, Beaker, BookOpen, ShieldCheck, AlertCircle } from 'lucide-react';

export const FoodReferenceBrowser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ORGANISMS' | 'MEDIA' | 'STANDARDS'>('ORGANISMS');
  const [query, setQuery] = useState('');
  const [selectedOrganismId, setSelectedOrganismId] = useState<string | null>('org_salmonella');

  const filteredOrganisms = SUSPECTED_ORGANISMS_DB.filter(
    o =>
      o.organism.toLowerCase().includes(query.toLowerCase()) ||
      o.foodCategories.some(fc => fc.toLowerCase().includes(query.toLowerCase())) ||
      o.commonFoodAssociations.some(a => a.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredMedia = MEDIA_DATABASE.filter(
    m =>
      m.mediumName.toLowerCase().includes(query.toLowerCase()) ||
      m.abbreviation.toLowerCase().includes(query.toLowerCase()) ||
      m.targetGroup.toLowerCase().includes(query.toLowerCase())
  );

  const filteredStandards = REFERENCE_STANDARDS_KB.filter(
    s =>
      s.referenceName.toLowerCase().includes(query.toLowerCase()) ||
      s.methodIdentifier.toLowerCase().includes(query.toLowerCase()) ||
      s.source.toLowerCase().includes(query.toLowerCase())
  );

  const activeOrganism = SUSPECTED_ORGANISMS_DB.find(o => o.id === selectedOrganismId) || SUSPECTED_ORGANISMS_DB[0];

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('ORGANISMS')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'ORGANISMS'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bug className="w-3.5 h-3.5" /> Suspected Organisms ({SUSPECTED_ORGANISMS_DB.length})
          </button>
          <button
            onClick={() => setActiveTab('MEDIA')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'MEDIA'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Beaker className="w-3.5 h-3.5" /> Growth Media KB ({MEDIA_DATABASE.length})
          </button>
          <button
            onClick={() => setActiveTab('STANDARDS')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'STANDARDS'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Regulatory Methods ({REFERENCE_STANDARDS_KB.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
      </div>

      {/* TAB 1: SUSPECTED ORGANISMS */}
      {activeTab === 'ORGANISMS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Organism List */}
          <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredOrganisms.map(org => (
              <div
                key={org.id}
                onClick={() => setSelectedOrganismId(org.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedOrganismId === org.id
                    ? 'bg-teal-50/70 dark:bg-teal-950/50 border-teal-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold italic text-slate-900 dark:text-slate-100 text-xs">{org.organism}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      org.hazardCategory === 'Pathogen'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : org.hazardCategory === 'Indicator'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {org.hazardCategory}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(org.foodCategories || []).slice(0, 4).map(cat => (
                    <span
                      key={cat}
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      {cat}
                    </span>
                  ))}
                  {(org.foodCategories || []).length > 4 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                      +{(org.foodCategories || []).length - 4}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{org.whyRelevant}</p>
              </div>
            ))}
          </div>

          {/* Organism Detail Card */}
          <div className="lg:col-span-7">
            {activeOrganism ? (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs sticky top-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Microbiological Profile</span>
                    <h3 className="text-lg font-extrabold italic text-slate-900 dark:text-slate-100">{activeOrganism.organism}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeOrganism.whyRelevant}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Ref: {activeOrganism.referenceMethod}
                  </span>
                </div>

                {/* Common Food Associations */}
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">Commonly Associated Food Matrices</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {activeOrganism.commonFoodAssociations.map(assoc => (
                      <span
                        key={assoc}
                        className="text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {assoc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detection & Confirmation Procedures */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Screening & Isolation</span>
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 mt-0.5">{activeOrganism.recommendedDetection}</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Confirmation Protocols</span>
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 mt-0.5">{activeOrganism.recommendedConfirmation}</p>
                  </div>
                </div>

                {/* Notes & Limitations */}
                <div className="p-3 bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 rounded-2xl text-[11px] text-teal-800 dark:text-teal-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Testing Rationale:</strong> {activeOrganism.notes}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: GROWTH MEDIA KB */}
      {activeTab === 'MEDIA' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMedia.map(m => (
            <div
              key={m.id}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 hover:border-teal-500 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 uppercase">
                  {m.abbreviation}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">{m.relevantTestCategory}</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{m.mediumName}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.purpose}</p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                <div><span className="font-semibold text-slate-700 dark:text-slate-300">Target Group:</span> {m.targetGroup}</div>
                <div><span className="font-semibold text-slate-700 dark:text-slate-300">Selective Factors:</span> {m.selectiveCharacteristics}</div>
                <div><span className="font-semibold text-slate-700 dark:text-slate-300">Reference:</span> {m.reference}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: REGULATORY METHODS */}
      {activeTab === 'STANDARDS' && (
        <div className="space-y-3">
          {filteredStandards.map(std => (
            <div
              key={std.id}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold text-xs">
                    {std.methodIdentifier}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{std.source}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {std.verificationStatus}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{std.referenceName}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{std.notes}</p>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1 mt-2">
                <div><strong>Version / Date:</strong> {std.versionDate}</div>
                <div><strong>Last Verified:</strong> {std.lastVerifiedDate}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
