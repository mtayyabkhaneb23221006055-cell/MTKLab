import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimerType } from '../../types';
import { MtkTextField } from '../common/MtkTextField';
import { MtkDropdown } from '../common/MtkDropdown';
import { MtkButton } from '../common/MtkButton';
import { Timer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTimerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { saveTimer, projects } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<TimerType>('COUNTDOWN');
  const [hrsStr, setHrsStr] = useState('0');
  const [minsStr, setMinsStr] = useState('15');
  const [secsStr, setSecsStr] = useState('0');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Timer name is required.');
      return;
    }

    let totalDurationMs = 0;
    if (type === 'COUNTDOWN') {
      const h = parseInt(hrsStr || '0', 10);
      const m = parseInt(minsStr || '0', 10);
      const s = parseInt(secsStr || '0', 10);

      if (isNaN(h) || isNaN(m) || isNaN(s) || (h === 0 && m === 0 && s === 0)) {
        setError('Please set a duration greater than 0.');
        return;
      }

      totalDurationMs = (h * 3600 + m * 60 + s) * 1000;
    }

    const projIdNum = selectedProjectId ? parseInt(selectedProjectId, 10) : null;

    saveTimer({
      name: name.trim(),
      type,
      totalDurationMs,
      remainingMs: totalDurationMs,
      elapsedMs: 0,
      status: 'IDLE',
      startedAtMs: 0,
      projectId: projIdNum,
      stepId: null,
    });

    // Reset & Close
    setName('');
    setError('');
    onClose();
  };

  const projectOptions = [
    { value: '', label: 'None (Standalone Timer)' },
    ...projects.map(p => ({ value: p.id.toString(), label: p.name })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Timer className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create New Timer</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <MtkTextField
            label="Timer Name *"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g. Centrifuge 10,000 x g Spin"
            error={error}
          />

          <MtkDropdown
            label="Timer Type"
            value={type}
            onChange={val => setType(val as TimerType)}
            options={[
              { value: 'COUNTDOWN', label: 'Countdown Timer' },
              { value: 'STOPWATCH', label: 'Stopwatch (Count Up)' },
            ]}
          />

          {type === 'COUNTDOWN' && (
            <div className="grid grid-cols-3 gap-2">
              <MtkTextField
                label="Hours"
                type="number"
                min="0"
                value={hrsStr}
                onChange={e => setHrsStr(e.target.value)}
              />
              <MtkTextField
                label="Minutes"
                type="number"
                min="0"
                max="59"
                value={minsStr}
                onChange={e => setMinsStr(e.target.value)}
              />
              <MtkTextField
                label="Seconds"
                type="number"
                min="0"
                max="59"
                value={secsStr}
                onChange={e => setSecsStr(e.target.value)}
              />
            </div>
          )}

          <MtkDropdown
            label="Link to Project (Optional)"
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            options={projectOptions}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <MtkButton type="button" variant="ghost" onClick={onClose}>
              Cancel
            </MtkButton>
            <MtkButton type="submit" variant="primary">
              Create Timer
            </MtkButton>
          </div>
        </form>
      </div>
    </div>
  );
};
