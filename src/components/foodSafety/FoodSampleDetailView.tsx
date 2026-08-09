import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodSample, FoodTestPlanItem, ChainOfCustodyRecord } from '../../types';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Printer,
  ShieldCheck,
  Bug,
  Calendar,
  User,
  FlaskConical,
  ListTodo,
  History,
  FolderPlus,
  ExternalLink,
} from 'lucide-react';

interface Props {
  sample: FoodSample;
  onClose: () => void;
}

export const FoodSampleDetailView: React.FC<Props> = ({ sample, onClose }) => {
  const {
    foodTestPlans,
    saveFoodTestPlanItem,
    deleteFoodTestPlanItem,
    chainOfCustody,
    addChainOfCustodyRecord,
    testingChecklists,
    toggleChecklistItem,
    addChecklistItem,
    createProjectFromFoodSample,
    openProjectDetail,
    userProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'TESTS' | 'COC' | 'CHECKLIST' | 'REPORT'>('TESTS');
  const [editingPlanItem, setEditingPlanItem] = useState<FoodTestPlanItem | null>(null);
  const [showAddTestModal, setShowAddTestModal] = useState(false);

  // Form for new test plan item
  const [newTarget, setNewTarget] = useState('');
  const [newCat, setNewCat] = useState('Pathogen detection');
  const [newType, setNewType] = useState<'Detection' | 'Enumeration' | 'Screening' | 'Confirmation'>('Detection');
  const [newMethod, setNewMethod] = useState('FDA BAM / ISO');
  const [newPurpose, setNewPurpose] = useState('Routine microbiological screening');

  // Form for Chain of Custody
  const [cocReceivedBy, setCocReceivedBy] = useState(userProfile.name || 'Analyst');
  const [cocCondition, setCocCondition] = useState('Intact, cold-chain maintained');
  const [cocStorage, setCocStorage] = useState('Refrigerated Incubator B');
  const [cocNotes, setCocNotes] = useState('');
  const [showAddCoc, setShowAddCoc] = useState(false);

  // New Checklist Item
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  const sampleTestPlans = (foodTestPlans || []).filter(p => p.sampleId === sample.id);
  const sampleCoc = (chainOfCustody || []).filter(c => c.sampleId === sample.id);
  const sampleChecklist = (testingChecklists || []).filter(c => c.sampleId === sample.id);

  const handleAddTestItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.trim()) return;

    saveFoodTestPlanItem({
      sampleId: sample.id,
      targetOrganism: newTarget.trim(),
      testCategory: newCat,
      testType: newType,
      purpose: newPurpose.trim(),
      priority: 'High',
      status: 'Pending',
      referenceMethod: newMethod.trim(),
      confirmationRequired: newType === 'Detection' || newType === 'Screening',
      resourceAvailable: true,
      analyst: userProfile.name,
    });

    setNewTarget('');
    setShowAddTestModal(false);
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlanItem) return;

    saveFoodTestPlanItem({
      ...editingPlanItem,
      status: editingPlanItem.result ? 'Completed' : 'In Progress',
      testDate: new Date().toISOString().split('T')[0],
      analyst: userProfile.name,
    });

    setEditingPlanItem(null);
  };

  const handleAddCoc = (e: React.FormEvent) => {
    e.preventDefault();
    addChainOfCustodyRecord({
      sampleId: sample.id,
      receivedBy: cocReceivedBy,
      dateTime: new Date().toLocaleString(),
      condition: cocCondition,
      storageStatus: cocStorage,
      notes: cocNotes,
    });
    setCocNotes('');
    setShowAddCoc(false);
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    addChecklistItem(sample.id, newChecklistTitle.trim());
    setNewChecklistTitle('');
  };

  const handleCreateProject = () => {
    try {
      const proj = createProjectFromFoodSample(sample.id);
      openProjectDetail(proj.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto print:max-w-none print:w-full print:h-auto print:border-none print:shadow-none print:rounded-none">
        
        {/* Header (Hidden when printing report) */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/80 print:hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                {sample.foodCategory}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">{sample.id}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  sample.status === 'Completed'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}
              >
                {sample.status}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">{sample.sampleName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Source: <strong>{sample.sampleSource || 'N/A'}</strong> | Lot/Batch: <strong>{sample.lotBatchNumber || 'N/A'}</strong> | Intake Date: {sample.collectionDate}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateProject}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" /> Convert to Lab Project
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Nav Tabs (Hidden when printing) */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto print:hidden">
          <button
            onClick={() => setActiveTab('TESTS')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'TESTS'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-4 h-4" /> Recommended Test Plan ({sampleTestPlans.length})
          </button>
          <button
            onClick={() => setActiveTab('COC')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'COC'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" /> Chain of Custody ({sampleCoc.length})
          </button>
          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'CHECKLIST'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-4 h-4" /> Testing Checklist ({sampleChecklist.filter(c => c.isCompleted).length}/{sampleChecklist.length})
          </button>
          <button
            onClick={() => setActiveTab('REPORT')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'REPORT'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Official Testing Report
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: RECOMMENDED TEST PLAN & RESULTS */}
          {activeTab === 'TESTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Microbiological Test Plan & Results</h3>
                  <p className="text-xs text-slate-500">Record observations, presumptive calls, and final verification notes.</p>
                </div>
                <button
                  onClick={() => setShowAddTestModal(true)}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Target Test
                </button>
              </div>

              <div className="space-y-3">
                {sampleTestPlans.map(item => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold italic text-slate-900 dark:text-slate-100 text-sm">{item.targetOrganism}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.testType}
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-500">{item.referenceMethod}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{item.purpose}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                            item.result === 'Not Detected' || item.result === 'Negative'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : item.result === 'Presumptive Positive' || item.result === 'Positive'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-extrabold'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.result || 'Awaiting Result'}
                        </span>
                        <button
                          onClick={() => setEditingPlanItem(item)}
                          className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 cursor-pointer"
                        >
                          Record Result
                        </button>
                      </div>
                    </div>

                    {item.resultValue && (
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <strong>Value / Colony Morphology:</strong> {item.resultValue}
                        </div>
                        {item.notes && <div className="text-slate-500 italic">"{item.notes}"</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CHAIN OF CUSTODY */}
          {activeTab === 'COC' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Chain of Custody & Sample Audit Log</h3>
                  <p className="text-xs text-slate-500">Track sample transfers, temperature compliance, and handling history.</p>
                </div>
                <button
                  onClick={() => setShowAddCoc(true)}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Transfer / Intake
                </button>
              </div>

              {showAddCoc && (
                <form onSubmit={handleAddCoc} className="p-4 bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">New Custody Entry</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Received By</label>
                      <input
                        type="text"
                        value={cocReceivedBy}
                        onChange={e => setCocReceivedBy(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Sample Condition</label>
                      <input
                        type="text"
                        value={cocCondition}
                        onChange={e => setCocCondition(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Storage Location</label>
                      <input
                        type="text"
                        value={cocStorage}
                        onChange={e => setCocStorage(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddCoc(false)} className="px-3 py-1 text-xs font-semibold text-slate-600">
                      Cancel
                    </button>
                    <button type="submit" className="px-3 py-1 bg-teal-600 text-white rounded-xl text-xs font-bold">
                      Save Log Entry
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {sampleCoc.map(log => (
                  <div key={log.id} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                      <span>Received by {log.receivedBy}</span>
                      <span className="text-slate-500 font-normal text-[11px]">{log.dateTime}</span>
                    </div>
                    <div><strong>Condition:</strong> {log.condition}</div>
                    <div><strong>Storage:</strong> {log.storageStatus}</div>
                    {log.notes && <div className="text-slate-500 italic">Notes: {log.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CHECKLIST */}
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Lab Protocol Execution Checklist</h3>
                <p className="text-xs text-slate-500">Step-by-step Quality Assurance checks for standard food safety protocols.</p>
              </div>

              <form onSubmit={handleAddChecklist} className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistTitle}
                  onChange={e => setNewChecklistTitle(e.target.value)}
                  placeholder="Add custom task or QA check step..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700"
                />
                <button type="submit" className="px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                  Add Step
                </button>
              </form>

              <div className="space-y-2">
                {sampleChecklist.map(chk => (
                  <div
                    key={chk.id}
                    onClick={() => toggleChecklistItem(chk.id)}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-teal-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                          chk.isCompleted ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {chk.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-medium ${chk.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {chk.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                      {chk.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL REPORT GENERATOR */}
          {activeTab === 'REPORT' && (
            <div className="space-y-6 print:space-y-4">
              <div className="flex items-center justify-between print:hidden">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Food Microbiological Testing Report</h3>
                  <p className="text-xs text-slate-500">Formal regulatory report layout formatted for printing & export.</p>
                </div>
                <button
                  onClick={handlePrintReport}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>

              {/* Formal Report Printable Header */}
              <div className="p-8 bg-white border border-slate-300 text-slate-900 rounded-3xl space-y-6 print:border-none print:p-0 print:shadow-none">
                <div className="flex justify-between items-start border-b pb-4 border-slate-300">
                  <div>
                    <h1 className="text-xl font-black text-teal-900 uppercase tracking-tight">MTKmicro Lab — Food Safety Unit</h1>
                    <p className="text-xs text-slate-600 font-semibold">Microbiological Testing & Decision Support Engine</p>
                    <p className="text-[10px] text-slate-500">ISO/IEC 17025 Quality System Framework</p>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <p className="font-bold text-slate-900">REPORT NO: RPT-{sample.id}</p>
                    <p className="text-slate-500">Date Issued: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Sample Summary Metadata Table */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <p><strong>Sample Name:</strong> {sample.sampleName}</p>
                    <p><strong>Sample ID:</strong> {sample.id}</p>
                    <p><strong>Food Category:</strong> {sample.foodCategory}</p>
                    <p><strong>Product Type:</strong> {sample.productType || 'N/A'}</p>
                  </div>
                  <div>
                    <p><strong>Lot / Batch No:</strong> {sample.lotBatchNumber || 'N/A'}</p>
                    <p><strong>Sample Source:</strong> {sample.sampleSource || 'N/A'}</p>
                    <p><strong>Collection Date:</strong> {sample.collectionDate}</p>
                    <p><strong>Received By:</strong> {sample.receivedBy || userProfile.name}</p>
                  </div>
                </div>

                {/* Test Results Summary Table */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase text-slate-700 mb-2">Microbiological Test Results</h3>
                  <table className="w-full text-xs text-left border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="p-2 border border-slate-300 font-bold">Target Organism</th>
                        <th className="p-2 border border-slate-300 font-bold">Test Category</th>
                        <th className="p-2 border border-slate-300 font-bold">Method Reference</th>
                        <th className="p-2 border border-slate-300 font-bold">Result Call</th>
                        <th className="p-2 border border-slate-300 font-bold">Value / Observations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleTestPlans.map(tp => (
                        <tr key={tp.id}>
                          <td className="p-2 border border-slate-300 italic font-semibold">{tp.targetOrganism}</td>
                          <td className="p-2 border border-slate-300">{tp.testCategory}</td>
                          <td className="p-2 border border-slate-300 font-mono">{tp.referenceMethod}</td>
                          <td className="p-2 border border-slate-300 font-bold">
                            {tp.result || 'Pending'}
                          </td>
                          <td className="p-2 border border-slate-300">{tp.resultValue || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Statutory Disclaimer & Terminology Notice */}
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] rounded-xl space-y-1">
                  <p className="font-bold uppercase">Regulatory & Methodological Disclaimer:</p>
                  <p>
                    This report details analytical results produced under ISO / FDA BAM methodology. Terminology such as "Presumptive Positive" indicates screening colony isolation requiring secondary biochemical, serological, or nucleic acid amplification confirmation. Presumptive findings are NOT confirmed species identifications until secondary confirmation protocols are complete.
                  </p>
                </div>

                {/* Sign-Off Block */}
                <div className="pt-6 border-t border-slate-300 flex justify-between items-end text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Analyst Sign-Off:</p>
                    <p className="text-slate-600">{userProfile.name} ({userProfile.role || 'Senior Microbiologist'})</p>
                    <p className="text-slate-500 text-[10px]">{userProfile.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="border-b border-slate-400 w-48 mb-1"></div>
                    <p className="text-[10px] text-slate-500">Authorized Signature & Seal</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Result Modal */}
      {editingPlanItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              Record Result: <span className="italic">{editingPlanItem.targetOrganism}</span>
            </h3>

            <form onSubmit={handleSaveResult} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Result Call</label>
                <select
                  value={editingPlanItem.result || 'Not Detected'}
                  onChange={e => setEditingPlanItem({ ...editingPlanItem, result: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold border"
                >
                  <option value="Not Detected">Not Detected / Negative</option>
                  <option value="Presumptive Positive">Presumptive Positive (Requires Confirmation)</option>
                  <option value="Confirmed Positive">Confirmed Species Positive</option>
                  <option value="Detected">Detected (Qualitative)</option>
                  <option value="Satisfactory">Satisfactory (Within Limits)</option>
                  <option value="Unsatisfactory">Unsatisfactory (Exceeds Limits)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Colony Morphology / CFU Value</label>
                <input
                  type="text"
                  value={editingPlanItem.resultValue || ''}
                  onChange={e => setEditingPlanItem({ ...editingPlanItem, resultValue: e.target.value })}
                  placeholder="e.g. Yellow colonies on TCBS, or <10 CFU/g"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Confirmation & Analytical Notes</label>
                <textarea
                  rows={2}
                  value={editingPlanItem.notes || ''}
                  onChange={e => setEditingPlanItem({ ...editingPlanItem, notes: e.target.value })}
                  placeholder="e.g. Gram negative, oxidase positive, salt tolerance verified."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingPlanItem(null)} className="px-3 py-1.5 font-semibold text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl shadow-xs">
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Test Item Modal */}
      {showAddTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Add Test Target Item</h3>

            <form onSubmit={handleAddTestItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Organism</label>
                <input
                  type="text"
                  required
                  value={newTarget}
                  onChange={e => setNewTarget(e.target.value)}
                  placeholder="e.g. Listeria monocytogenes, E. coli O157"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Test Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                >
                  <option value="Detection">Detection (Presence/Absence in 25g)</option>
                  <option value="Enumeration">Enumeration (CFU/g or MPN)</option>
                  <option value="Screening">Rapid Screening</option>
                  <option value="Confirmation">Biochemical / PCR Confirmation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Reference Method</label>
                <input
                  type="text"
                  value={newMethod}
                  onChange={e => setNewMethod(e.target.value)}
                  placeholder="e.g. ISO 11290-1 / FDA BAM Ch 10"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddTestModal(false)} className="px-3 py-1.5 font-semibold text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl shadow-xs">
                  Add to Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
