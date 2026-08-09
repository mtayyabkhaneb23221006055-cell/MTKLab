import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus } from '../../types';
import { MtkTextField } from '../common/MtkTextField';
import { MtkDropdown } from '../common/MtkDropdown';
import { MtkButton } from '../common/MtkButton';
import { TagChip } from '../common/TagChip';
import { Tag, Calendar, FolderKanban } from 'lucide-react';

interface Props {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEditProjectModal: React.FC<Props> = ({ project, isOpen, onClose }) => {
  const { saveProject } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ProjectStatus>('NOT_STARTED');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setDateStr(new Date(project.date).toISOString().split('T')[0]);
      setStatus(project.status);
      setTags(project.tags || []);
    } else {
      setName('');
      setDescription('');
      setDateStr(new Date().toISOString().split('T')[0]);
      setStatus('NOT_STARTED');
      setTags(['Microbiology']);
    }
    setNameError('');
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Project name is required.');
      return;
    }
    if (name.length > 100) {
      setNameError('Project name must be 100 characters or less.');
      return;
    }

    saveProject({
      id: project ? project.id : undefined,
      name: name.trim(),
      description: description.trim(),
      date: new Date(dateStr).getTime() || Date.now(),
      status,
      tags,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <FolderKanban className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {project ? 'Edit Laboratory Project' : 'Create New Project'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <MtkTextField
            label="Project Name *"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setNameError('');
            }}
            placeholder="e.g. PCR Amplification of 16S Gene"
            maxLength={100}
            error={nameError}
          />

          <div className="flex flex-col gap-1.5 mb-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of objectives and experimental scope..."
              maxLength={500}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
            <span className="text-[10px] text-slate-400 text-right">{description.length}/500</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MtkTextField
              label="Date"
              type="date"
              value={dateStr}
              onChange={e => setDateStr(e.target.value)}
            />

            <MtkDropdown
              label="Status"
              value={status}
              onChange={val => setStatus(val as ProjectStatus)}
              options={[
                { value: 'NOT_STARTED', label: 'Not Started' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
            />
          </div>

          {/* Tags section */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-1.5 block">
              Tags / Categories
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag (press Enter)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <MtkButton type="button" size="sm" variant="secondary" onClick={handleAddTag}>
                + Add
              </MtkButton>
            </div>
            <div className="flex flex-wrap items-center gap-1 min-h-8">
              {tags.map(t => (
                <TagChip key={t} label={t} onRemove={() => handleRemoveTag(t)} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <MtkButton type="button" variant="ghost" onClick={onClose}>
              Cancel
            </MtkButton>
            <MtkButton type="submit" variant="primary">
              {project ? 'Save Changes' : 'Create Project'}
            </MtkButton>
          </div>
        </form>
      </div>
    </div>
  );
};
