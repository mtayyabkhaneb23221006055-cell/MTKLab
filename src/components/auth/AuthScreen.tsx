import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Lock,
  Building,
  GraduationCap,
  Globe,
  CheckCircle2,
  CloudCheck,
  LogOut,
  ShieldAlert,
  ArrowRight,
  KeyRound,
  UserCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { userProfile, updateUserProfile, triggerCloudSync, syncStatus, navigateTo, route } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT' | 'PROFILE'>(
    userProfile.isAuthenticated ? 'PROFILE' : route.type === 'AUTH' && route.subView ? (route.subView.toUpperCase() as any) : 'LOGIN'
  );

  // Form State
  const [email, setEmail] = useState(userProfile.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(userProfile.name || '');
  const [institution, setInstitution] = useState(userProfile.institution || '');
  const [role, setRole] = useState(userProfile.role || 'Researcher');
  const [field, setField] = useState(userProfile.preferredField || 'Microbiology');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleDemoLogin = () => {
    updateUserProfile({
      name: 'Tayyab Khan',
      email: 'm.tayyabkhan.eb23221006055@gmail.com',
      institution: 'BioTech Research Institute',
      role: 'Lead Researcher',
      preferredField: 'Microbiology & Molecular Biology',
      isAuthenticated: true,
      isCloudSyncEnabled: true,
    });
    setMessage({ type: 'success', text: 'Successfully authenticated as Tayyab Khan (Lead Researcher).' });
    setActiveTab('PROFILE');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in both email and password.' });
      return;
    }
    updateUserProfile({
      email,
      name: name || email.split('@')[0],
      isAuthenticated: true,
    });
    setMessage({ type: 'success', text: 'Welcome back! Cloud sync enabled.' });
    setActiveTab('PROFILE');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setMessage({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }
    updateUserProfile({
      name,
      email,
      institution,
      role,
      preferredField: field,
      isAuthenticated: true,
      isCloudSyncEnabled: true,
    });
    setMessage({ type: 'success', text: 'Account created! Welcome to MTKmicro Lab.' });
    setActiveTab('PROFILE');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }
    setMessage({ type: 'info', text: `Password reset link sent to ${email}. Check your inbox.` });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      institution,
      role,
      preferredField: field,
    });
    setMessage({ type: 'success', text: 'Profile changes saved successfully.' });
  };

  const handleSignOut = () => {
    updateUserProfile({
      isAuthenticated: false,
    });
    setMessage({ type: 'info', text: 'Signed out. MTKmicro Lab remains 100% operational in offline mode.' });
    setActiveTab('LOGIN');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <User className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-2 border border-teal-500/30">
              <Sparkles className="w-3 h-3" />
              <span>CLOUD & AUTHENTICATION</span>
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase">
              {userProfile.isAuthenticated ? `Dr. ${userProfile.name}` : 'LABORATORY ACCOUNT'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {userProfile.isAuthenticated
                ? `${userProfile.institution || 'BioTech Research'} • ${userProfile.role}`
                : 'Sign in to back up experiments, sync across devices, and collaborate.'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <UserCheck className="w-6 h-6 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-black/50 p-1 border border-slate-200 dark:border-white/10 font-mono text-xs font-bold">
        {userProfile.isAuthenticated ? (
          <>
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                activeTab === 'PROFILE'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              MY PROFILE
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('LOGIN')}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                activeTab === 'LOGIN'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setActiveTab('REGISTER')}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                activeTab === 'REGISTER'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              REGISTER
            </button>
            <button
              onClick={() => setActiveTab('FORGOT')}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                activeTab === 'FORGOT'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              FORGOT
            </button>
          </>
        )}
      </div>

      {/* Feedback Message */}
      {message && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : message.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              : 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs font-mono font-bold opacity-60 hover:opacity-100">
            DISMISS
          </button>
        </div>
      )}

      {/* TAB 1: SIGN IN */}
      {activeTab === 'LOGIN' && (
        <div className="space-y-4 bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <h3 className="text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>SIGN IN TO MTKMICRO CLOUD</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">LOCAL-FIRST SAFE</span>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="researcher@lab.org"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>AUTHENTICATE & SYNC</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-300 dark:border-white/10 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>ONE-CLICK DEMO LOGIN (TAYYAB KHAN)</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              No account? You can continue using MTKmicro Lab in offline mode with complete privacy.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTER */}
      {activeTab === 'REGISTER' && (
        <form onSubmit={handleRegister} className="space-y-4 bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
            <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>CREATE RESEARCHER ACCOUNT</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                FULL NAME *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dr. Tayyab Khan"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                EMAIL ADDRESS *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="m.tayyabkhan@lab.org"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                INSTITUTION / LAB
              </label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="BioTech Research Institute"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                ROLE / TITLE
              </label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="Lead Microbiologist"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
              PRIMARY FIELD OF STUDY
            </label>
            <select
              value={field}
              onChange={e => setField(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
            >
              <option value="Microbiology">Microbiology & Bacteriology</option>
              <option value="Molecular Biology">Molecular Biology & Genetics</option>
              <option value="Cell Culture">Cell Culture & Tissue Engineering</option>
              <option value="Biochemistry">Biochemistry & Enzymology</option>
              <option value="Virology">Virology & Immunology</option>
              <option value="Food & Agri">Food & Agricultural Microbiology</option>
              <option value="Environmental">Environmental Biotechnology</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
              PASSWORD *
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            CREATE ACCOUNT & ENABLE SYNC
          </button>
        </form>
      )}

      {/* TAB 3: FORGOT PASSWORD */}
      {activeTab === 'FORGOT' && (
        <form onSubmit={handleResetPassword} className="space-y-4 bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
            <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>RESET ACCOUNT PASSWORD</span>
          </h3>
          <p className="text-xs text-slate-500">
            Enter your registered laboratory email address and we will send you a secure password reset link.
          </p>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
              REGISTERED EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="researcher@lab.org"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            SEND RESET LINK
          </button>
        </form>
      )}

      {/* TAB 4: PROFILE MANAGER */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-6">
          {/* Cloud Sync Status Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">
                  CLOUD SYNCHRONIZATION
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                {syncStatus}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Your local laboratory database is set to auto-synchronize with your MTKmicro Cloud vault.
            </p>

            <div className="flex gap-2">
              <button
                onClick={triggerCloudSync}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-teal-500/30 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>SYNC NOW</span>
              </button>
              <button
                onClick={() => navigateTo({ type: 'BACKUP_RESTORE' })}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs transition-colors border border-slate-300 dark:border-white/10 cursor-pointer"
              >
                BACKUPS
              </button>
            </div>
          </div>

          {/* Profile Editor */}
          <form onSubmit={handleSaveProfile} className="space-y-4 bg-white dark:bg-[#121212] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>RESEARCHER PROFILE DETAILS</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  INSTITUTION / LAB
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ROLE
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              SAVE PROFILE CHANGES
            </button>
          </form>

          {/* Quick Links & Sign Out */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-3">
            <button
              onClick={() => navigateTo({ type: 'PRIVACY' })}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <span>PRIVACY CENTER & AI DATA SETTINGS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-bold text-xs flex items-center justify-center gap-2 border border-rose-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>SIGN OUT (SWITCH TO LOCAL OFFLINE MODE)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
