import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  BookOpen,
  Plus,
  Trash2,
  FolderCheck,
  Check,
  Lightbulb,
  Calculator,
  HelpCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { AiChatMessage } from '../../types';
import { FormattedText, cleanLatexAndMath } from '../../utils/textFormatting';

export const AiAssistantScreen: React.FC = () => {
  const { projects, activeProject, saveProject, storage, navigateTo } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    activeProject ? activeProject.id : projects.length > 0 ? projects[0].id : null
  );

  const currentProject = projects.find(p => p.id === selectedProjectId) || null;

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg_init',
      role: 'assistant',
      content:
        "Hello! I am your MTKmicro Lab AI Assistant. I can analyze protocols, calculate dilutions, summarize experiment progress, or assist with troubleshooting.",
      timestamp: Date.now(),
      type: 'EXPLANATION',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AiChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    // Build project context payload if a project is selected
    let projectContext: any = undefined;
    if (currentProject) {
      const summary = storage.getProjectSummary(currentProject.id);
      const steps = summary?.steps || [];
      const notes = summary?.notes || [];
      projectContext = {
        id: currentProject.id,
        name: currentProject.name,
        description: currentProject.description,
        stepsCount: steps.length,
        completedSteps: steps.filter(s => s.isCompleted).length,
        notesCount: notes.length,
        steps: steps.map(s => ({ title: s.title, completed: s.isCompleted, duration: s.durationMinutes })),
      };
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })),
          projectContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Chat server returned ${response.status}`);
      }

      const data = await response.json();
      const botMsg: AiChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response returned from AI Assistant.',
        timestamp: Date.now(),
        type: data.responseType || 'EXPLANATION',
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      // Fallback response generator if offline or server error
      let fallbackText = `I analyzed your query: "${textToSend}".`;
      let type: AiChatMessage['type'] = 'EXPLANATION';

      if (textToSend.toLowerCase().includes('summarize')) {
        fallbackText = `**Project Summary for ${currentProject?.name || 'Selected Project'}**:\n\n• **Status**: Active Experiment\n• **Steps Logged**: ${
          currentProject ? (storage.getProjectSummary(currentProject.id)?.steps?.length || 0) : 0
        } steps\n• **Key Materials**: LB Agar, Ampicillin, SOC Medium, Competent E. coli cells.\n• **Observation**: Keep incubations strictly at 37°C.`;
        type = 'SOURCE_INFO';
      } else if (textToSend.toLowerCase().includes('dilution') || textToSend.toLowerCase().includes('calculate')) {
        fallbackText = `**Dilution Formula (C1V1 = C2V2)**:\n\nTo prepare 100 mL of 1X Buffer from 10X Stock:\n• **Stock Volume (V1)** = (1X × 100 mL) / 10X = **10 mL**\n• **Water Volume** = 100 mL - 10 mL = **90 mL**\n\nUse the Calculators tab for live multi-step master mix calculations.`;
        type = 'CALCULATION';
      } else {
        fallbackText += `\n\nHere are the recommended standard scientific guidelines:\n1. Ensure controls are included for validation.\n2. Record exact incubation times in MTKmicro Multi-Timers.\n3. Keep reagents at 4°C unless specified.`;
        type = 'AI_SUGGESTION';
      }

      const botMsg: AiChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: Date.now(),
        type,
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToProjectNotes = (content: string) => {
    if (!currentProject) return;
    storage.addProjectNote(currentProject.id, `MTKmicro AI Note:\n${content}`);
    alert(`Saved response to project notes for "${currentProject.name}"!`);
  };

  const handleClearHistory = () => {
    if (confirm('Clear AI conversation history?')) {
      setMessages([
        {
          id: 'msg_init',
          role: 'assistant',
          content: 'Conversation history reset. How can I assist with your lab work today?',
          timestamp: Date.now(),
          type: 'EXPLANATION',
        },
      ]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 flex flex-col h-[calc(100vh-110px)]">
      {/* Header Context Selection */}
      <div className="bg-white dark:bg-[#121212] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white">MTKMICRO AI ASSISTANT</h2>
            <p className="text-[10px] text-slate-500">PROJECT-AWARE SCIENTIFIC CO-PILOT</p>
          </div>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2 text-xs">
          <FolderCheck className="w-4 h-4 text-slate-400" />
          <select
            value={selectedProjectId || ''}
            onChange={e => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
            className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/40 font-mono text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="">NO PROJECT CONTEXT</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                PROJECT #{p.id}: {p.name}
              </option>
            ))}
          </select>
          {messages.length > 1 && (
            <button
              onClick={handleClearHistory}
              title="Clear Chat"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-mono shrink-0 scrollbar-none">
        <button
          onClick={() => handleSendMessage('Summarize active project progress and completed steps')}
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-teal-500/10 hover:text-teal-600 border border-slate-200 dark:border-white/10 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-teal-500" />
          <span>Summarize Project</span>
        </button>

        <button
          onClick={() => handleSendMessage('Calculate serial dilution ratios for 1:10 series in 5 tubes')}
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-teal-500/10 hover:text-teal-600 border border-slate-200 dark:border-white/10 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5 text-teal-500" />
          <span>Serial Dilution Ratio</span>
        </button>

        <button
          onClick={() => handleSendMessage('Troubleshoot poor bacterial growth on selective ampicillin agar plates')}
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-teal-500/10 hover:text-teal-600 border border-slate-200 dark:border-white/10 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Growth Troubleshooting</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white dark:bg-[#121212] p-4 rounded-2xl border border-slate-200 dark:border-white/10 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-2 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black rounded-tr-none'
                  : 'bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
              }`}
            >
              {/* Type Badge for Bot Responses */}
              {msg.role === 'assistant' && msg.type && (
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10 text-[9px] font-mono font-bold tracking-wider">
                  <span
                    className={`px-1.5 py-0.5 rounded uppercase ${
                      msg.type === 'CALCULATION'
                        ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300'
                        : msg.type === 'SOURCE_INFO'
                        ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                        : msg.type === 'AI_SUGGESTION'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-500/20 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    [{msg.type}]
                  </span>
                  <span className="opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              <FormattedText content={msg.content} />

              {/* Bot Action Tools */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-500">
                  <button
                    onClick={() => handleCopy(msg.id, cleanLatexAndMath(msg.content))}
                    className="hover:text-teal-600 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? 'COPIED' : 'COPY'}</span>
                  </button>

                  {currentProject && (
                    <button
                      onClick={() => handleSaveToProjectNotes(cleanLatexAndMath(msg.content))}
                      className="hover:text-teal-600 flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>SAVE TO PROJECT NOTE</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-black/30 text-xs font-mono text-slate-500 animate-pulse">
              MTKmicro AI is analyzing laboratory context...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="shrink-0 bg-white dark:bg-[#121212] p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            currentProject
              ? `Ask about "${currentProject.name}" or lab procedures...`
              : 'Ask MTKmicro AI a scientific query...'
          }
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-black/40 rounded-xl text-sm border-none focus:outline-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
