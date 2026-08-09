import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MyLabResource } from '../../types';
import { CheckCircle2, XCircle, Plus, Beaker, Wrench, Dna, PackageCheck } from 'lucide-react';

export const LabResourceCapabilities: React.FC = () => {
  const { myLabResources, toggleLabResourceAvailability, saveMyLabResource } = useApp();
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'MEDIA' | 'EQUIPMENT' | 'MOLECULAR' | 'KITS'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<MyLabResource['category']>('MEDIA');
  const [newNotes, setNewNotes] = useState('');

  const filtered = myLabResources.filter(r => activeCategory === 'ALL' || r.category === activeCategory);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    saveMyLabResource({
      id: `res_${Date.now()}`,
      category: newCat,
      name: newName.trim(),
      isAvailable: true,
      notes: newNotes.trim(),
    });
    setNewName('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: MyLabResource['category']) => {
    switch (cat) {
      case 'MEDIA':
        return <Beaker className="w-4 h-4 text-emerald-500" />;
      case 'EQUIPMENT':
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'MOLECULAR':
        return <Dna className="w-4 h-4 text-purple-500" />;
      case 'KITS':
        return <PackageCheck className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-teal-900 dark:text-teal-200">Laboratory Testing Capabilities & Stock Inventory</h3>
          <p className="text-xs text-teal-700 dark:text-teal-400 mt-0.5">
            Toggle available growth media, equipment, and confirmation kits. MTKmicro Lab recommendation engine matches test plans against your marked inventory.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Inventory Item
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['ALL', 'MEDIA', 'EQUIPMENT', 'MOLECULAR', 'KITS'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat === 'ALL' ? 'All Resources' : cat}
          </button>
        ))}
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(res => (
          <div
            key={res.id}
            onClick={() => toggleLabResourceAvailability(res.id)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
              res.isAvailable
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/60 opacity-60'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 mt-0.5">
                {getCategoryIcon(res.category)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{res.name}</h4>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {res.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{res.notes || 'No description provided'}</p>
              </div>
            </div>

            <button
              type="button"
              className={`p-1 rounded-lg transition-colors ${
                res.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {res.isAvailable ? <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950" /> : <XCircle className="w-5 h-5" />}
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Add Lab Capability / Media Item</h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Item Category</label>
                <select
                  value={newCat}
                  onChange={e => setNewCat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="MEDIA">Selective Growth Media / Broth</option>
                  <option value="EQUIPMENT">Equipment & Incubators</option>
                  <option value="MOLECULAR">Molecular Assays & qPCR</option>
                  <option value="KITS">Biochemical & Staining Kits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. PALCAM Agar, qPCR Salmonella Kit"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Target Purpose</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="e.g. Stocked in Media Room Cabinet 3"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
