import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  Users,
  Lock,
  Globe,
  Copy,
  Check,
  Plus,
  Trash2,
  X,
  History,
  Shield,
} from 'lucide-react';
import { SharedProjectConfig, ProjectMember } from '../../types';

interface ProjectSharingModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSharingModal: React.FC<ProjectSharingModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const { sharedProjects, saveSharedProjectConfig, activityLogs, projects } = useApp();

  const project = projects.find(p => p.id === projectId);
  const existingConfig = sharedProjects.find(s => s.projectId === projectId);

  const [accessType, setAccessType] = useState<SharedProjectConfig['accessType']>(
    existingConfig?.accessType || 'SPECIFIC_USERS'
  );
  const [members, setMembers] = useState<ProjectMember[]>(
    existingConfig?.members || [
      { userId: 'usr_owner', name: 'Tayyab Khan', email: 'm.tayyabkhan.eb23221006055@gmail.com', role: 'EDITOR' },
    ]
  );
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const shareLink = `https://mtkmicro.app/share/prj_${projectId}_${Math.random().toString(36).substring(2, 6)}`;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    const newMember: ProjectMember = {
      userId: `usr_${Date.now()}`,
      name: newEmail.split('@')[0],
      email: newEmail,
      role: newRole,
    };

    const updated = [...members, newMember];
    setMembers(updated);
    setNewEmail('');

    saveSharedProjectConfig({
      projectId,
      accessType,
      members: updated,
      shareLink,
    });
  };

  const handleRemoveMember = (email: string) => {
    const updated = members.filter(m => m.email !== email);
    setMembers(updated);
    saveSharedProjectConfig({
      projectId,
      accessType,
      members: updated,
      shareLink,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const projectLogs = activityLogs.filter(l => l.projectId === projectId);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121212] max-w-lg w-full p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white leading-none">
                SHARE & COLLABORATE
              </h3>
              <span className="text-[10px] font-mono text-slate-500">PROJECT #{projectId}: {project.name}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Level Selector */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">
            VISIBILITY & ACCESS PERMISSIONS
          </label>

          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <button
              onClick={() => setAccessType('PRIVATE')}
              className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 cursor-pointer ${
                accessType === 'PRIVATE'
                  ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>PRIVATE</span>
            </button>

            <button
              onClick={() => setAccessType('SPECIFIC_USERS')}
              className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 cursor-pointer ${
                accessType === 'SPECIFIC_USERS'
                  ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>MEMBERS</span>
            </button>

            <button
              onClick={() => setAccessType('PUBLIC_LINK')}
              className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 cursor-pointer ${
                accessType === 'PUBLIC_LINK'
                  ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>ANY LINK</span>
            </button>
          </div>
        </div>

        {/* Share Link */}
        <div className="space-y-1">
          <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">
            SHAREABLE EXPERIMENTAL LINK
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 p-2 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-teal-600 text-white font-mono font-bold text-xs flex items-center gap-1 hover:bg-teal-700 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>

        {/* Invite Team Members */}
        {accessType === 'SPECIFIC_USERS' && (
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-500">
              INVITE COLLABORATORS
            </label>

            <form onSubmit={handleAddMember} className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="colleague@biotech.org"
                className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs font-mono focus:outline-none focus:border-teal-500"
              />
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as any)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-xs font-mono focus:outline-none"
              >
                <option value="VIEWER">VIEWER</option>
                <option value="EDITOR">EDITOR</option>
              </select>
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-mono font-bold text-xs uppercase cursor-pointer"
              >
                ADD
              </button>
            </form>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
              {members.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{m.name}</span>
                    <span className="text-[10px] text-slate-500">{m.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
                      {m.role}
                    </span>
                    {m.email !== 'm.tayyabkhan.eb23221006055@gmail.com' && (
                      <button
                        onClick={() => handleRemoveMember(m.email)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Audit Log */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
            <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>RECENT PROJECT AUDIT LOG</span>
          </div>

          <div className="space-y-1 max-h-28 overflow-y-auto text-[11px] font-mono text-slate-600 dark:text-slate-400">
            {projectLogs.length > 0 ? (
              projectLogs.map(l => (
                <div key={l.id} className="p-1.5 rounded bg-slate-50 dark:bg-black/20 flex justify-between">
                  <span>
                    <strong>{l.userName}</strong>: {l.action} — {l.details}
                  </span>
                  <span className="text-[9px] opacity-60">
                    {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 italic">No logged activity yet for this project.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
