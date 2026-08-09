import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProtocolStep } from '../../types';
import { MtkTextField } from '../common/MtkTextField';
import { MtkButton } from '../common/MtkButton';
import { ListChecks } from 'lucide-react';

interface Props {
  projectId: number;
  step?: ProtocolStep | null;
  defaultGroup?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEditStepModal: React.FC<Props> = ({
  projectId,
  step,
  defaultGroup = 'Protocol Steps',
  isOpen,
  onClose,
}) => {
  const { saveStep } = useApp();

  const [groupName, setGroupName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [durationStr, setDurationStr] = useState('');
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (step) {
      setGroupName(step.groupName);
      setTitle(step.title);
      setDescription(step.description || '');
      setNotes(step.notes || '');
      setDurationStr(step.durationMinutes ? step.durationMinutes.toString() : '');
    } else {
      setGroupName(defaultGroup);
      setTitle('');
      setDescription('');
      setNotes('');
      setDurationStr('');
    }
    setTitleError('');
  }, [step, defaultGroup, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Step title is required.');
      return;
    }

    const durationNum = durationStr.trim() !== '' ? parseInt(durationStr, 10) : null;

    saveStep({
      id: step ? step.id : undefined,
      projectId,
      groupName: groupName.trim() || 'Protocol Steps',
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
      durationMinutes: durationNum && !isNaN(durationNum) ? durationNum : null,
      isCompleted: step ? step.isCompleted : false,
      sortOrder: step ? step.sortOrder : 999,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <ListChecks className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {step ? 'Edit Protocol Step' : 'Add Protocol Step'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <MtkTextField
            label="Protocol Group Name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="e.g. PCR Reaction Setup, Gel Preparation"
          />

          <MtkTextField
            label="Step Title *"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              setTitleError('');
            }}
            placeholder="e.g. Combine Master Mix & Primers"
            error={titleError}
          />

          <div className="flex flex-col gap-1.5 mb-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Description / Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed step instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>

          <MtkTextField
            label="Estimated Duration (Minutes)"
            type="number"
            value={durationStr}
            onChange={e => setDurationStr(e.target.value)}
            placeholder="e.g. 15 (leave blank if N/A)"
            unit="min"
          />

          <div className="flex flex-col gap-1.5 mb-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Lab Notes / Warnings (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Keep on ice, vortex thoroughly..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <MtkButton type="button" variant="ghost" onClick={onClose}>
              Cancel
            </MtkButton>
            <MtkButton type="submit" variant="primary">
              {step ? 'Save Step' : 'Add Step'}
            </MtkButton>
          </div>
        </form>
      </div>
    </div>
  );
};
