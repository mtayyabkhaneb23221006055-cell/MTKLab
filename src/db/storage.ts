/**
 * MTKmicro Lab - Local Database & Offline Storage Layer
 * Manages Room-like persistent entity storage in browser local database with reactivity
 */

import {
  Project,
  ProtocolStep,
  LabTimer,
  MasterMixRecipe,
  BufferRecipe,
  ProjectNote,
  SavedCalculation,
  AppSettings,
  SearchResultItem,
  ColonyCountSession,
  Plate,
  GelAnnotationSession,
  ImageMeasurementSession,
  CalibrationCurveSession,
  CellCountSession,
  BloodCellCountSession,
  CellCultureRecord,
  CustomCounterSession,
  UserProfile,
  SyncStatus,
  SyncConflict,
  SavedProtocol,
  SharedProjectConfig,
  ActivityLogEntry,
  AiConversation,
  LabCalendarEvent,
  LabNotification,
  FoodSample,
  FoodTestPlanItem,
  MyLabResource,
  ChainOfCustodyRecord,
  TestingChecklistItem,
} from '../types';
import {
  SUSPECTED_ORGANISMS_DB,
  MEDIA_DATABASE,
  REFERENCE_STANDARDS_KB,
  INITIAL_LAB_RESOURCES,
} from './foodSafetyDatabase';

const STORAGE_KEYS = {
  PROJECTS: 'mtkmicro_projects_v1',
  STEPS: 'mtkmicro_steps_v1',
  TIMERS: 'mtkmicro_timers_v1',
  MASTER_MIX: 'mtkmicro_mastermix_v1',
  BUFFERS: 'mtkmicro_buffers_v1',
  NOTES: 'mtkmicro_notes_v1',
  CALCS: 'mtkmicro_calcs_v1',
  SETTINGS: 'mtkmicro_settings_v1',
  COLONY_COUNTS: 'mtkmicro_colony_counts_v2',
  PLATES: 'mtkmicro_plates_v2',
  GEL_ANNOTATIONS: 'mtkmicro_gel_annotations_v2',
  IMAGE_MEASUREMENTS: 'mtkmicro_image_measurements_v2',
  CALIBRATIONS: 'mtkmicro_calibrations_v2',
  CELL_COUNTS: 'mtkmicro_cell_counts_v2',
  BLOOD_CELL_COUNTS: 'mtkmicro_blood_cell_counts_v2',
  CELL_CULTURES: 'mtkmicro_cell_cultures_v2',
  CUSTOM_COUNTERS: 'mtkmicro_custom_counters_v2',
  USER_PROFILE: 'mtkmicro_user_profile_v3',
  SAVED_PROTOCOLS: 'mtkmicro_saved_protocols_v3',
  ACTIVITY_LOG: 'mtkmicro_activity_log_v3',
  AI_CONVERSATIONS: 'mtkmicro_ai_conversations_v3',
  CALENDAR_EVENTS: 'mtkmicro_calendar_events_v3',
  NOTIFICATIONS: 'mtkmicro_notifications_v3',
  FAVORITES: 'mtkmicro_favorites_v3',
  SYNC_STATUS: 'mtkmicro_sync_status_v3',
  SYNC_CONFLICTS: 'mtkmicro_sync_conflicts_v3',
  SHARED_PROJECTS: 'mtkmicro_shared_projects_v3',
  FOOD_SAMPLES: 'mtkmicro_food_samples_v4',
  FOOD_TEST_PLANS: 'mtkmicro_food_test_plans_v4',
  FOOD_LAB_RESOURCES: 'mtkmicro_food_lab_resources_v4',
  FOOD_CHAIN_OF_CUSTODY: 'mtkmicro_food_chain_custody_v4',
  FOOD_CHECKLISTS: 'mtkmicro_food_checklists_v4',
};

// Initial Seed Data for first run
const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'PCR Detection of Target Gene',
    description: 'Amplification and gel electrophoresis verification of 16S rRNA gene sequence in bacterial isolates.',
    date: Date.now() - 86400000 * 2,
    tags: ['Microbiology', 'PCR', 'Genomics'],
    status: 'IN_PROGRESS',
    lastOpenedTimestamp: Date.now(),
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 2,
    name: 'E. coli Plasmid Extraction & Gel Analysis',
    description: 'High-yield alkaline lysis isolation of pUC19 plasmid DNA from recombinant DH5α culture.',
    date: Date.now() - 86400000 * 5,
    tags: ['Molecular Biology', 'Plasmid', 'DNA'],
    status: 'NOT_STARTED',
    lastOpenedTimestamp: Date.now() - 86400000 * 3,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 3,
    name: 'LB Broth & Agar Media Preparation',
    description: 'Formulation, pH adjustment, and autoclave sterilization of Luria-Bertani nutrient broth.',
    date: Date.now() - 86400000 * 7,
    tags: ['Media Prep', 'Autoclave', 'Culture'],
    status: 'COMPLETED',
    lastOpenedTimestamp: Date.now() - 86400000 * 6,
    createdAt: Date.now() - 86400000 * 7,
  },
];

const INITIAL_STEPS: ProtocolStep[] = [
  // Project 1 Steps
  {
    id: 101,
    projectId: 1,
    groupName: 'PCR Reaction Setup',
    title: 'Prepare Master Mix',
    description: 'Combine 2X PCR Master Mix, forward & reverse primers, and nuclease-free water into sterile PCR tube.',
    notes: 'Keep all reagents on ice during assembly.',
    durationMinutes: 15,
    isCompleted: true,
    sortOrder: 1,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 102,
    projectId: 1,
    groupName: 'PCR Reaction Setup',
    title: 'Add Template DNA',
    description: 'Pipette 2 µL extracted genomic DNA into reaction tube to bring total reaction volume to 25 µL.',
    notes: 'Mix gently by pipetting up and down 5 times.',
    durationMinutes: 5,
    isCompleted: true,
    sortOrder: 2,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 103,
    projectId: 1,
    groupName: 'Thermocycling',
    title: 'Run PCR Thermal Program',
    description: 'Initial denaturation at 95°C for 5 min, followed by 30 cycles of (95°C 30s, 55°C 30s, 72°C 1 min).',
    notes: 'Thermal cycler program #4 saved on Bio-Rad unit.',
    durationMinutes: 90,
    isCompleted: false,
    sortOrder: 3,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 104,
    projectId: 1,
    groupName: 'Gel Electrophoresis',
    title: 'Analyze on 1% Agarose Gel',
    description: 'Cast 1% agarose gel with ethidium bromide, load samples alongside 1 kb DNA ladder, and run at 100V for 45 min.',
    notes: 'Visualize band size under UV transilluminator.',
    durationMinutes: 60,
    isCompleted: false,
    sortOrder: 4,
    createdAt: Date.now() - 86400000 * 2,
  },
  // Project 2 Steps
  {
    id: 201,
    projectId: 2,
    groupName: 'Cell Lysis',
    title: 'Resuspend Bacterial Pellet',
    description: 'Centrifuge 5 mL overnight E. coli culture at 6000 x g for 5 min. Resuspend pellet in 250 µL Buffer P1.',
    notes: 'Ensure pellet is completely homogenized.',
    durationMinutes: 10,
    isCompleted: false,
    sortOrder: 1,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 202,
    projectId: 2,
    groupName: 'Cell Lysis',
    title: 'Alkaline Lysis Reaction',
    description: 'Add 250 µL Buffer P2 and invert 4-6 times. Incubate at room temperature for 3 minutes.',
    notes: 'Do not vortex to avoid genomic DNA shear.',
    durationMinutes: 3,
    isCompleted: false,
    sortOrder: 2,
    createdAt: Date.now() - 86400000 * 5,
  },
];

const INITIAL_TIMERS: LabTimer[] = [
  {
    id: 301,
    name: 'Agarose Gel Electrophoresis Run',
    type: 'COUNTDOWN',
    projectId: 1,
    stepId: 104,
    totalDurationMs: 45 * 60 * 1000,
    remainingMs: 28 * 60 * 1000 + 45 * 1000,
    elapsedMs: 0,
    status: 'RUNNING',
    startedAtMs: Date.now(),
    createdAt: Date.now() - 1000000,
  },
  {
    id: 302,
    name: 'Alkaline Lysis Incubation',
    type: 'COUNTDOWN',
    projectId: 2,
    stepId: 202,
    totalDurationMs: 3 * 60 * 1000,
    remainingMs: 3 * 60 * 1000,
    elapsedMs: 0,
    status: 'IDLE',
    startedAtMs: 0,
    createdAt: Date.now() - 500000,
  },
  {
    id: 303,
    name: 'Media Autoclave Sterilization',
    type: 'STOPWATCH',
    projectId: 3,
    stepId: null,
    totalDurationMs: 0,
    remainingMs: 0,
    elapsedMs: 1215000,
    status: 'COMPLETED',
    startedAtMs: Date.now() - 3600000,
    createdAt: Date.now() - 4000000,
    completedAt: Date.now() - 2385000,
  },
];

const INITIAL_NOTES: ProjectNote[] = [
  {
    id: 401,
    projectId: 1,
    contentType: 'MATERIALS',
    content: '- 2X Taq Polymerase Master Mix (Promega)\n- Forward Primer: 16S_27F (10 µM)\n- Reverse Primer: 16S_1492R (10 µM)\n- Nuclease-free H2O\n- Template DNA (20 ng/µL)\n- 100 bp DNA Ladder (NEB)',
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 402,
    projectId: 1,
    contentType: 'NOTES',
    content: 'Anterior extraction yielded A260/280 ratio of 1.84. High quality DNA. Store remaining PCR product at -20°C after gel verification.',
    updatedAt: Date.now() - 86400000,
  },
];

const INITIAL_SETTINGS: AppSettings = {
  theme: 'LIGHT',
  notificationsEnabled: true,
  defaultVolumeUnit: 'µL',
  defaultConcUnit: 'M',
};

export class StorageRepository {
  private static instance: StorageRepository;

  private listeners: (() => void)[] = [];
  private isNotifying = false;
  private pendingNotify = false;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): StorageRepository {
    if (!StorageRepository.instance) {
      StorageRepository.instance = new StorageRepository();
    }
    return StorageRepository.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    if (this.isNotifying) {
      this.pendingNotify = true;
      return;
    }
    this.isNotifying = true;
    try {
      this.listeners.forEach(l => {
        try {
          l();
        } catch (err) {
          console.error('Storage listener error:', err instanceof Error ? err.message : String(err));
        }
      });
    } finally {
      this.isNotifying = false;
      if (this.pendingNotify) {
        this.pendingNotify = false;
        queueMicrotask(() => this.notify());
      }
    }
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      const parsed = JSON.parse(data);
      if (parsed === null || parsed === undefined) return fallback;
      return parsed as T;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e: any) {
      console.error('Storage setItem error:', e?.message || String(e));
    }
  }

  private ensureInitialized() {
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      this.setItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
      this.setItem(STORAGE_KEYS.STEPS, INITIAL_STEPS);
      this.setItem(STORAGE_KEYS.TIMERS, INITIAL_TIMERS);
      this.setItem(STORAGE_KEYS.NOTES, INITIAL_NOTES);
      this.setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
      this.setItem(STORAGE_KEYS.MASTER_MIX, []);
      this.setItem(STORAGE_KEYS.BUFFERS, []);
      this.setItem(STORAGE_KEYS.CALCS, []);
    }
  }

  // --- PROJECTS ---
  public getProjects(): Project[] {
    const list = this.getItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
    return list.sort((a, b) => b.lastOpenedTimestamp - a.lastOpenedTimestamp);
  }

  public getProjectById(id: number): Project | null {
    return this.getProjects().find(p => p.id === id) || null;
  }

  public saveProject(project: Omit<Project, 'id' | 'createdAt' | 'lastOpenedTimestamp'> & { id?: number }): Project {
    const projects = this.getProjects();
    const now = Date.now();

    if (project.id) {
      // Edit
      const index = projects.findIndex(p => p.id === project.id);
      if (index !== -1) {
        const updated: Project = {
          ...projects[index],
          ...project,
          lastOpenedTimestamp: now,
        };
        projects[index] = updated;
        this.setItem(STORAGE_KEYS.PROJECTS, projects);
        return updated;
      }
    }

    // Create
    const newProject: Project = {
      id: Date.now(),
      name: project.name,
      description: project.description || '',
      date: project.date || now,
      tags: project.tags || [],
      status: project.status || 'NOT_STARTED',
      lastOpenedTimestamp: now,
      createdAt: now,
    };
    projects.push(newProject);
    this.setItem(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  }

  public touchProjectLastOpened(id: number) {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index].lastOpenedTimestamp = Date.now();
      this.setItem(STORAGE_KEYS.PROJECTS, projects);
    }
  }

  public deleteProject(id: number) {
    const projects = this.getProjects().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PROJECTS, projects);

    // Cascade delete steps, notes, and timers associated
    const steps = this.getProtocolSteps().filter(s => s.projectId !== id);
    this.setItem(STORAGE_KEYS.STEPS, steps);

    const notes = this.getItem<ProjectNote[]>(STORAGE_KEYS.NOTES, []).filter(n => n.projectId !== id);
    this.setItem(STORAGE_KEYS.NOTES, notes);

    const timers = this.getTimers().filter(t => t.projectId !== id);
    this.setItem(STORAGE_KEYS.TIMERS, timers);
  }

  // --- PROTOCOL STEPS ---
  public getProtocolSteps(): ProtocolStep[] {
    return this.getItem<ProtocolStep[]>(STORAGE_KEYS.STEPS, []);
  }

  public getStepsByProject(projectId: number): ProtocolStep[] {
    return this.getProtocolSteps()
      .filter(s => s.projectId === projectId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public saveStep(step: Omit<ProtocolStep, 'id' | 'createdAt'> & { id?: number }): ProtocolStep {
    const steps = this.getProtocolSteps();
    const now = Date.now();

    if (step.id) {
      const index = steps.findIndex(s => s.id === step.id);
      if (index !== -1) {
        const updated: ProtocolStep = {
          ...steps[index],
          ...step,
        };
        steps[index] = updated;
        this.setItem(STORAGE_KEYS.STEPS, steps);
        return updated;
      }
    }

    const projectSteps = steps.filter(s => s.projectId === step.projectId);
    const maxSort = projectSteps.reduce((max, s) => Math.max(max, s.sortOrder), 0);

    const newStep: ProtocolStep = {
      id: Date.now(),
      projectId: step.projectId,
      groupName: step.groupName || 'Default Group',
      title: step.title,
      description: step.description || '',
      notes: step.notes || '',
      durationMinutes: step.durationMinutes || null,
      isCompleted: step.isCompleted || false,
      sortOrder: step.sortOrder ?? maxSort + 1,
      createdAt: now,
    };
    steps.push(newStep);
    this.setItem(STORAGE_KEYS.STEPS, steps);
    return newStep;
  }

  public toggleStepCompletion(stepId: number): boolean {
    const steps = this.getProtocolSteps();
    const index = steps.findIndex(s => s.id === stepId);
    if (index !== -1) {
      steps[index].isCompleted = !steps[index].isCompleted;
      this.setItem(STORAGE_KEYS.STEPS, steps);
      return steps[index].isCompleted;
    }
    return false;
  }

  public reorderSteps(projectId: number, newOrderedStepIds: number[]) {
    const steps = this.getProtocolSteps();
    newOrderedStepIds.forEach((id, index) => {
      const step = steps.find(s => s.id === id && s.projectId === projectId);
      if (step) {
        step.sortOrder = index + 1;
      }
    });
    this.setItem(STORAGE_KEYS.STEPS, steps);
  }

  public deleteStep(stepId: number) {
    const steps = this.getProtocolSteps().filter(s => s.id !== stepId);
    this.setItem(STORAGE_KEYS.STEPS, steps);
  }

  // --- TIMERS ---
  public getTimers(): LabTimer[] {
    const timers = this.getItem<LabTimer[]>(STORAGE_KEYS.TIMERS, []);
    const now = Date.now();

    // Perform Time Compensation for active RUNNING timers dynamically without mutating storage
    return timers.map(t => {
      if (t.status === 'RUNNING' && t.startedAtMs > 0) {
        const elapsedSinceLast = now - t.startedAtMs;
        if (t.type === 'COUNTDOWN') {
          const newRemaining = t.remainingMs - elapsedSinceLast;
          if (newRemaining <= 0) {
            return {
              ...t,
              remainingMs: 0,
              status: 'COMPLETED' as const,
              startedAtMs: 0,
              completedAt: now,
            };
          } else {
            return {
              ...t,
              remainingMs: newRemaining,
            };
          }
        } else if (t.type === 'STOPWATCH') {
          return {
            ...t,
            elapsedMs: t.elapsedMs + elapsedSinceLast,
          };
        }
      }
      return t;
    });
  }

  public saveTimer(timer: Omit<LabTimer, 'id' | 'createdAt'> & { id?: number }): LabTimer {
    const timers = this.getTimers();
    const now = Date.now();

    if (timer.id) {
      const index = timers.findIndex(t => t.id === timer.id);
      if (index !== -1) {
        const updated = { ...timers[index], ...timer };
        timers[index] = updated;
        this.setItem(STORAGE_KEYS.TIMERS, timers);
        return updated;
      }
    }

    const newTimer: LabTimer = {
      id: Date.now(),
      name: timer.name,
      type: timer.type,
      projectId: timer.projectId || null,
      stepId: timer.stepId || null,
      totalDurationMs: timer.totalDurationMs || 0,
      remainingMs: timer.remainingMs ?? timer.totalDurationMs ?? 0,
      elapsedMs: timer.elapsedMs || 0,
      status: timer.status || 'IDLE',
      startedAtMs: timer.status === 'RUNNING' ? now : 0,
      createdAt: now,
    };

    timers.push(newTimer);
    this.setItem(STORAGE_KEYS.TIMERS, timers);
    return newTimer;
  }

  public updateTimerStatus(timerId: number, newStatus: LabTimer['status']) {
    const timers = this.getTimers();
    const index = timers.findIndex(t => t.id === timerId);
    if (index === -1) return;

    const timer = timers[index];
    const now = Date.now();

    if (newStatus === 'RUNNING') {
      timer.status = 'RUNNING';
      timer.startedAtMs = now;
    } else if (newStatus === 'PAUSED') {
      if (timer.status === 'RUNNING' && timer.startedAtMs > 0) {
        const elapsed = now - timer.startedAtMs;
        if (timer.type === 'COUNTDOWN') {
          timer.remainingMs = Math.max(0, timer.remainingMs - elapsed);
        } else {
          timer.elapsedMs += elapsed;
        }
      }
      timer.status = 'PAUSED';
      timer.startedAtMs = 0;
    } else if (newStatus === 'IDLE') {
      // Reset
      timer.status = 'IDLE';
      timer.startedAtMs = 0;
      timer.remainingMs = timer.totalDurationMs;
      timer.elapsedMs = 0;
    } else if (newStatus === 'COMPLETED') {
      timer.status = 'COMPLETED';
      timer.startedAtMs = 0;
      timer.remainingMs = 0;
      timer.completedAt = now;
    }

    timers[index] = timer;
    this.setItem(STORAGE_KEYS.TIMERS, timers);
  }

  public deleteTimer(timerId: number) {
    const timers = this.getTimers().filter(t => t.id !== timerId);
    this.setItem(STORAGE_KEYS.TIMERS, timers);
  }

  // --- PROJECT NOTES & MATERIALS ---
  public getNotesForProject(projectId: number): { materials: string; notes: string } {
    const list = this.getItem<ProjectNote[]>(STORAGE_KEYS.NOTES, []);
    const mat = list.find(n => n.projectId === projectId && n.contentType === 'MATERIALS')?.content || '';
    const not = list.find(n => n.projectId === projectId && n.contentType === 'NOTES')?.content || '';
    return { materials: mat, notes: not };
  }

  public saveProjectNote(projectId: number, type: 'MATERIALS' | 'NOTES', content: string) {
    const list = this.getItem<ProjectNote[]>(STORAGE_KEYS.NOTES, []);
    const index = list.findIndex(n => n.projectId === projectId && n.contentType === type);

    if (index !== -1) {
      list[index].content = content;
      list[index].updatedAt = Date.now();
    } else {
      list.push({
        id: Date.now(),
        projectId,
        contentType: type,
        content,
        updatedAt: Date.now(),
      });
    }
    this.setItem(STORAGE_KEYS.NOTES, list);
  }

  // --- RECIPES (Master Mix & Buffer) ---
  public getMasterMixRecipes(): MasterMixRecipe[] {
    return this.getItem<MasterMixRecipe[]>(STORAGE_KEYS.MASTER_MIX, []);
  }

  public saveMasterMixRecipe(recipe: Omit<MasterMixRecipe, 'id' | 'createdAt'>): MasterMixRecipe {
    const recipes = this.getMasterMixRecipes();
    const newRecipe: MasterMixRecipe = {
      ...recipe,
      id: Date.now(),
      createdAt: Date.now(),
    };
    recipes.push(newRecipe);
    this.setItem(STORAGE_KEYS.MASTER_MIX, recipes);
    return newRecipe;
  }

  public getBufferRecipes(): BufferRecipe[] {
    return this.getItem<BufferRecipe[]>(STORAGE_KEYS.BUFFERS, []);
  }

  public saveBufferRecipe(recipe: Omit<BufferRecipe, 'id' | 'createdAt'>): BufferRecipe {
    const recipes = this.getBufferRecipes();
    const newRecipe: BufferRecipe = {
      ...recipe,
      id: Date.now(),
      createdAt: Date.now(),
    };
    recipes.push(newRecipe);
    this.setItem(STORAGE_KEYS.BUFFERS, recipes);
    return newRecipe;
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    return this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.setItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // --- SEARCH ---
  public searchAllEntities(query: string): SearchResultItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    // Search Projects
    this.getProjects().forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))) {
        results.push({
          type: 'project',
          id: p.id,
          title: p.name,
          subtitle: p.description ? p.description.slice(0, 80) : `Status: ${p.status}`,
          projectId: p.id,
        });
      }
    });

    // Search Protocol Steps
    this.getProtocolSteps().forEach(s => {
      if (s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.notes.toLowerCase().includes(q)) {
        results.push({
          type: 'step',
          id: s.id,
          title: s.title,
          subtitle: `Group: ${s.groupName} — ${s.description.slice(0, 60)}`,
          projectId: s.projectId,
        });
      }
    });

    // Search Recipes
    this.getMasterMixRecipes().forEach(m => {
      if (m.name.toLowerCase().includes(q)) {
        results.push({
          type: 'recipe',
          id: m.id,
          title: m.name,
          subtitle: `Master Mix Recipe (${m.numReactions} rxns)`,
          toolId: 'master_mix',
        });
      }
    });

    this.getBufferRecipes().forEach(b => {
      if (b.name.toLowerCase().includes(q)) {
        results.push({
          type: 'recipe',
          id: b.id,
          title: b.name,
          subtitle: `Buffer Recipe (${b.finalVolume} ${b.finalVolumeUnit})`,
          toolId: 'buffer',
        });
      }
    });

    // Search Timers
    this.getTimers().forEach(t => {
      if (t.name.toLowerCase().includes(q)) {
        results.push({
          type: 'timer',
          id: t.id,
          title: t.name,
          subtitle: `Timer (${t.type}) — Status: ${t.status}`,
          projectId: t.projectId || undefined,
        });
      }
    });

    // Search Food Samples
    this.getFoodSamples().forEach(fs => {
      if (
        fs.sampleName.toLowerCase().includes(q) ||
        fs.id.toLowerCase().includes(q) ||
        fs.foodCategory.toLowerCase().includes(q) ||
        fs.lotBatchNumber.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'tool_analysis',
          id: fs.id,
          title: `🧫 Food Sample: ${fs.sampleName} (${fs.id})`,
          subtitle: `Category: ${fs.foodCategory} — Status: ${fs.status}`,
          toolId: 'food_safety_analyzer',
        });
      }
    });

    // Search Suspected Organisms
    SUSPECTED_ORGANISMS_DB.forEach(org => {
      if (
        org.organism.toLowerCase().includes(q) ||
        org.commonFoodAssociations.some(a => a.toLowerCase().includes(q)) ||
        org.foodCategories.some(fc => fc.toLowerCase().includes(q)) ||
        org.whyRelevant.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'tool_analysis',
          id: org.id,
          title: `🦠 Organism: ${org.organism}`,
          subtitle: `Foods: ${org.foodCategories.join(', ')} — ${org.referenceMethod}`,
          toolId: 'food_safety_analyzer',
        });
      }
    });

    // Search Media KB
    MEDIA_DATABASE.forEach(m => {
      if (
        m.mediumName.toLowerCase().includes(q) ||
        m.abbreviation.toLowerCase().includes(q) ||
        m.purpose.toLowerCase().includes(q) ||
        m.targetGroup.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'recipe',
          id: m.id,
          title: `🧫 Media: ${m.mediumName} (${m.abbreviation})`,
          subtitle: `Target: ${m.targetGroup} — Ref: ${m.reference}`,
          toolId: 'food_safety_analyzer',
        });
      }
    });

    // Search Reference Standards
    REFERENCE_STANDARDS_KB.forEach(ref => {
      if (
        ref.referenceName.toLowerCase().includes(q) ||
        ref.methodIdentifier.toLowerCase().includes(q) ||
        ref.source.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'protocol',
          id: ref.id,
          title: `📜 Reference: ${ref.methodIdentifier}`,
          subtitle: `${ref.referenceName} [${ref.verificationStatus}]`,
          toolId: 'food_safety_analyzer',
        });
      }
    });

    return results;
  }

  // --- PHASE 2: COLONY COUNT SESSIONS ---
  public getColonyCounts(): ColonyCountSession[] {
    return this.getItem<ColonyCountSession[]>(STORAGE_KEYS.COLONY_COUNTS, []).sort((a, b) => b.createdAt - a.createdAt);
  }

  public saveColonyCount(session: Omit<ColonyCountSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): ColonyCountSession {
    const list = this.getColonyCounts();
    const now = Date.now();
    if (session.id) {
      const idx = list.findIndex(s => s.id === session.id);
      if (idx !== -1) {
        const updated = { ...list[idx], ...session, updatedAt: now };
        list[idx] = updated;
        this.setItem(STORAGE_KEYS.COLONY_COUNTS, list);
        return updated;
      }
    }
    const created: ColonyCountSession = {
      ...session,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    list.push(created);
    this.setItem(STORAGE_KEYS.COLONY_COUNTS, list);
    return created;
  }

  public deleteColonyCount(id: number) {
    const list = this.getColonyCounts().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.COLONY_COUNTS, list);
  }

  // --- PHASE 2: PLATES ---
  public getPlates(): Plate[] {
    return this.getItem<Plate[]>(STORAGE_KEYS.PLATES, []).sort((a, b) => b.createdAt - a.createdAt);
  }

  public savePlate(plate: Omit<Plate, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): Plate {
    const list = this.getPlates();
    const now = Date.now();
    if (plate.id) {
      const idx = list.findIndex(p => p.id === plate.id);
      if (idx !== -1) {
        const updated = { ...list[idx], ...plate, updatedAt: now };
        list[idx] = updated;
        this.setItem(STORAGE_KEYS.PLATES, list);
        return updated;
      }
    }
    const created: Plate = {
      ...plate,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    list.push(created);
    this.setItem(STORAGE_KEYS.PLATES, list);
    return created;
  }

  public deletePlate(id: number) {
    const list = this.getPlates().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PLATES, list);
  }

  // --- PHASE 2: GEL ANNOTATIONS ---
  public getGelAnnotations(): GelAnnotationSession[] {
    return this.getItem<GelAnnotationSession[]>(STORAGE_KEYS.GEL_ANNOTATIONS, []).sort((a, b) => b.createdAt - a.createdAt);
  }

  public saveGelAnnotation(session: Omit<GelAnnotationSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): GelAnnotationSession {
    const list = this.getGelAnnotations();
    const now = Date.now();
    if (session.id) {
      const idx = list.findIndex(s => s.id === session.id);
      if (idx !== -1) {
        const updated = { ...list[idx], ...session, updatedAt: now };
        list[idx] = updated;
        this.setItem(STORAGE_KEYS.GEL_ANNOTATIONS, list);
        return updated;
      }
    }
    const created: GelAnnotationSession = {
      ...session,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    list.push(created);
    this.setItem(STORAGE_KEYS.GEL_ANNOTATIONS, list);
    return created;
  }

  public deleteGelAnnotation(id: number) {
    const list = this.getGelAnnotations().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.GEL_ANNOTATIONS, list);
  }

  // --- PHASE 2: IMAGE MEASUREMENTS ---
  public getImageMeasurements(): ImageMeasurementSession[] {
    return this.getItem<ImageMeasurementSession[]>(STORAGE_KEYS.IMAGE_MEASUREMENTS, []).sort((a, b) => b.createdAt - a.createdAt);
  }

  public saveImageMeasurement(session: Omit<ImageMeasurementSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): ImageMeasurementSession {
    const list = this.getImageMeasurements();
    const now = Date.now();
    if (session.id) {
      const idx = list.findIndex(s => s.id === session.id);
      if (idx !== -1) {
        const updated = { ...list[idx], ...session, updatedAt: now };
        list[idx] = updated;
        this.setItem(STORAGE_KEYS.IMAGE_MEASUREMENTS, list);
        return updated;
      }
    }
    const created: ImageMeasurementSession = {
      ...session,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    list.push(created);
    this.setItem(STORAGE_KEYS.IMAGE_MEASUREMENTS, list);
    return created;
  }

  public deleteImageMeasurement(id: number) {
    const list = this.getImageMeasurements().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.IMAGE_MEASUREMENTS, list);
  }

  // --- PHASE 2: CALIBRATION CURVES ---
  public getCalibrations(): CalibrationCurveSession[] {
    return this.getItem<CalibrationCurveSession[]>(STORAGE_KEYS.CALIBRATIONS, []).sort((a, b) => b.createdAt - a.createdAt);
  }

  public saveCalibration(session: Omit<CalibrationCurveSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): CalibrationCurveSession {
    const list = this.getCalibrations();
    const now = Date.now();
    if (session.id) {
      const idx = list.findIndex(s => s.id === session.id);
      if (idx !== -1) {
        const updated = { ...list[idx], ...session, updatedAt: now };
        list[idx] = updated;
        this.setItem(STORAGE_KEYS.CALIBRATIONS, list);
        return updated;
      }
    }
    const created: CalibrationCurveSession = {
      ...session,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    list.push(created);
    this.setItem(STORAGE_KEYS.CALIBRATIONS, list);
    return created;
  }

  public deleteCalibration(id: number) {
    const list = this.getCalibrations().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.CALIBRATIONS, list);
  }

  // --- PHASE 2: CELL COUNTS ---
  public getCellCounts(): CellCountSession[] {
    return this.getItem<CellCountSession[]>(STORAGE_KEYS.CELL_COUNTS, []).sort((a, b) => b.createdAt - a.createdAt);
  }

  public saveCellCount(session: Omit<CellCountSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): CellCountSession {
    const list = this.getCellCounts();
    const now = Date.now();
    if (session.id) {
      const idx = list.findIndex(s => s.id === session.id);
      if (idx !== -1) {
        const updated = { ...list[idx], ...session, updatedAt: now };
        list[idx] = updated;
        this.setItem(STORAGE_KEYS.CELL_COUNTS, list);
        return updated;
      }
    }
    const created: CellCountSession = {
      ...session,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    list.push(created);
    this.setItem(STORAGE_KEYS.CELL_COUNTS, list);
    return created;
  }

  public deleteCellCount(id: number) {
    const list = this.getCellCounts().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.CELL_COUNTS, list);
  }

  // --- PHASE 2: BLOOD CELL COUNTS ---
  public getBloodCellCounts(): BloodCellCountSession[] {
    return this.getItem<BloodCellCountSession[]>(STORAGE_KEYS.BLOOD_CELL_COUNTS, []).sort((a, b) => b.createdAt - a.createdAt);
  }

  public saveBloodCellCount(session: Omit<BloodCellCountSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): BloodCellCountSession {
    const list = this.getBloodCellCounts();
    const now = Date.now();
    if (session.id) {
      const idx = list.findIndex(s => s.id === session.id);
      if (idx !== -1) {
        const updated = { ...list[idx], ...session, updatedAt: now };
        list[idx] = updated;
        this.setItem(STORAGE_KEYS.BLOOD_CELL_COUNTS, list);
        return updated;
      }
    }
    const created: BloodCellCountSession = {
      ...session,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    list.push(created);
    this.setItem(STORAGE_KEYS.BLOOD_CELL_COUNTS, list);
    return created;
  }

  public deleteBloodCellCount(id: number) {
    const list = this.getBloodCellCounts().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.BLOOD_CELL_COUNTS, list);
  }

  // --- PHASE 2: CELL CULTURE RECORDS ---
  public getCellCultures(): CellCultureRecord[] {
    return this.getItem<CellCultureRecord[]>(STORAGE_KEYS.CELL_CULTURES, []).sort((a, b) => b.date - a.date);
  }

  public saveCellCulture(record: Omit<CellCultureRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): CellCultureRecord {
    const list = this.getCellCultures();
    const now = Date.now();
    if (record.id) {
      const idx = list.findIndex(r => r.id === record.id);
      if (idx !== -1) {
        const updated = { ...list[idx], ...record, updatedAt: now };
        list[idx] = updated;
        this.setItem(STORAGE_KEYS.CELL_CULTURES, list);
        return updated;
      }
    }
    const created: CellCultureRecord = {
      ...record,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    list.push(created);
    this.setItem(STORAGE_KEYS.CELL_CULTURES, list);
    return created;
  }

  public deleteCellCulture(id: number) {
    const list = this.getCellCultures().filter(r => r.id !== id);
    this.setItem(STORAGE_KEYS.CELL_CULTURES, list);
  }

  // --- PHASE 2: CUSTOM COUNTERS ---
  public getCustomCounters(): CustomCounterSession[] {
    return this.getItem<CustomCounterSession[]>(STORAGE_KEYS.CUSTOM_COUNTERS, []).sort((a, b) => b.createdAt - a.createdAt);
  }

  public saveCustomCounter(session: Omit<CustomCounterSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): CustomCounterSession {
    const list = this.getCustomCounters();
    const now = Date.now();
    if (session.id) {
      const idx = list.findIndex(s => s.id === session.id);
      if (idx !== -1) {
        const updated = { ...list[idx], ...session, updatedAt: now };
        list[idx] = updated;
        this.setItem(STORAGE_KEYS.CUSTOM_COUNTERS, list);
        return updated;
      }
    }
    const created: CustomCounterSession = {
      ...session,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    list.push(created);
    this.setItem(STORAGE_KEYS.CUSTOM_COUNTERS, list);
    return created;
  }

  public deleteCustomCounter(id: number) {
    const list = this.getCustomCounters().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.CUSTOM_COUNTERS, list);
  }

  // --- GET ALL PROJECT LINKED ANALYSES ---
  public getProjectSummary(projectId: number) {
    const project = this.getProjectById(projectId);
    const steps = this.getStepsByProject(projectId) || [];
    const notesObj = this.getNotesForProject(projectId) || { materials: '', notes: '' };
    const notesList = (this.getItem<ProjectNote[]>(STORAGE_KEYS.NOTES, []) || []).filter(n => n.projectId === projectId);

    const formattedNotes = notesList.map(n => ({
      id: String(n.id),
      content: n.content,
      createdAt: n.updatedAt || Date.now(),
    }));

    if (formattedNotes.length === 0 && notesObj.notes) {
      formattedNotes.push({
        id: 'note_summary_1',
        content: notesObj.notes,
        createdAt: Date.now(),
      });
    }

    return {
      project,
      steps,
      notes: formattedNotes,
      materials: notesObj.materials || '',
    };
  }

  public addProjectNote(projectId: number, content: string) {
    const existing = this.getNotesForProject(projectId);
    const updatedNotes = existing.notes ? `${existing.notes}\n\n${content}` : content;
    this.saveProjectNote(projectId, 'NOTES', updatedNotes);
  }

  public getCellCultureRecords(): CellCultureRecord[] {
    return this.getCellCultures() || [];
  }

  public saveCellCultureRecord(record: Omit<CellCultureRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): CellCultureRecord {
    return this.saveCellCulture(record);
  }

  public saveCalibrationCurve(session: Omit<CalibrationCurveSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): CalibrationCurveSession {
    return this.saveCalibration(session);
  }

  public getProjectAnalyses(projectId: number) {
    const calibrations = (this.getCalibrations() || []).filter(c => c.projectId === projectId);
    return {
      colonyCounts: (this.getColonyCounts() || []).filter(c => c.projectId === projectId),
      plates: (this.getPlates() || []).filter(p => p.projectId === projectId),
      gelAnnotations: (this.getGelAnnotations() || []).filter(g => g.projectId === projectId),
      imageMeasurements: (this.getImageMeasurements() || []).filter(m => m.projectId === projectId),
      calibrations,
      calibrationCurves: calibrations,
      cellCounts: (this.getCellCounts() || []).filter(c => c.projectId === projectId),
      bloodCellCounts: (this.getBloodCellCounts() || []).filter(b => b.projectId === projectId),
      cellCultures: (this.getCellCultures() || []).filter(c => c.projectId === projectId),
      customCounters: (this.getCustomCounters() || []).filter(c => c.projectId === projectId),
    };
  }

  // --- DATA EXPORT, IMPORT & CLEAR ---
  public exportDatabaseAsJson(): string {
    const exportObj = {
      app: 'MTKmicro Lab',
      package: 'com.mtkmicrolab.app',
      version: '3.0.0',
      exportDate: new Date().toISOString(),
      userProfile: this.getUserProfile(),
      projects: this.getProjects(),
      steps: this.getProtocolSteps(),
      timers: this.getTimers(),
      masterMixRecipes: this.getMasterMixRecipes(),
      bufferRecipes: this.getBufferRecipes(),
      notes: this.getItem<ProjectNote[]>(STORAGE_KEYS.NOTES, []),
      settings: this.getSettings(),
      savedProtocols: this.getSavedProtocols(),
      activityLogs: this.getActivityLogs(),
      calendarEvents: this.getCalendarEvents(),
      colonyCounts: this.getColonyCounts(),
      plates: this.getPlates(),
      gelAnnotations: this.getGelAnnotations(),
      imageMeasurements: this.getImageMeasurements(),
      calibrations: this.getCalibrations(),
      cellCounts: this.getCellCounts(),
      bloodCellCounts: this.getBloodCellCounts(),
      cellCultures: this.getCellCultures(),
      customCounters: this.getCustomCounters(),
      favorites: this.getFavorites(),
    };
    return JSON.stringify(exportObj, null, 2);
  }

  public restoreDatabaseFromJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') return false;

      if (data.userProfile) this.saveUserProfile(data.userProfile);
      if (Array.isArray(data.projects)) this.setItem(STORAGE_KEYS.PROJECTS, data.projects);
      if (Array.isArray(data.steps)) this.setItem(STORAGE_KEYS.STEPS, data.steps);
      if (Array.isArray(data.timers)) this.setItem(STORAGE_KEYS.TIMERS, data.timers);
      if (Array.isArray(data.masterMixRecipes)) this.setItem(STORAGE_KEYS.MASTER_MIX, data.masterMixRecipes);
      if (Array.isArray(data.bufferRecipes)) this.setItem(STORAGE_KEYS.BUFFERS, data.bufferRecipes);
      if (Array.isArray(data.notes)) this.setItem(STORAGE_KEYS.NOTES, data.notes);
      if (data.settings) this.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      if (Array.isArray(data.savedProtocols)) this.setItem(STORAGE_KEYS.SAVED_PROTOCOLS, data.savedProtocols);
      if (Array.isArray(data.activityLogs)) this.setItem(STORAGE_KEYS.ACTIVITY_LOG, data.activityLogs);
      if (Array.isArray(data.calendarEvents)) this.setItem(STORAGE_KEYS.CALENDAR_EVENTS, data.calendarEvents);
      if (Array.isArray(data.colonyCounts)) this.setItem(STORAGE_KEYS.COLONY_COUNTS, data.colonyCounts);
      if (Array.isArray(data.plates)) this.setItem(STORAGE_KEYS.PLATES, data.plates);
      if (Array.isArray(data.gelAnnotations)) this.setItem(STORAGE_KEYS.GEL_ANNOTATIONS, data.gelAnnotations);
      if (Array.isArray(data.imageMeasurements)) this.setItem(STORAGE_KEYS.IMAGE_MEASUREMENTS, data.imageMeasurements);
      if (Array.isArray(data.calibrations)) this.setItem(STORAGE_KEYS.CALIBRATIONS, data.calibrations);
      if (Array.isArray(data.cellCounts)) this.setItem(STORAGE_KEYS.CELL_COUNTS, data.cellCounts);
      if (Array.isArray(data.bloodCellCounts)) this.setItem(STORAGE_KEYS.BLOOD_CELL_COUNTS, data.bloodCellCounts);
      if (Array.isArray(data.cellCultures)) this.setItem(STORAGE_KEYS.CELL_CULTURES, data.cellCultures);
      if (Array.isArray(data.customCounters)) this.setItem(STORAGE_KEYS.CUSTOM_COUNTERS, data.customCounters);
      if (Array.isArray(data.favorites)) this.setItem(STORAGE_KEYS.FAVORITES, data.favorites);

      this.logActivity('Database Restored', 'User restored laboratory database from backup package.');
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  }

  // --- USER PROFILE & AUTH ---
  public getUserProfile(): UserProfile {
    const defaultProfile: UserProfile = {
      id: 'usr_default',
      name: 'Tayyab Khan',
      email: 'm.tayyabkhan.eb23221006055@gmail.com',
      institution: 'BioTech Research Institute',
      role: 'Researcher',
      preferredField: 'Microbiology & Molecular Biology',
      timezone: 'UTC-7',
      defaultUnits: {
        volume: 'µL',
        concentration: 'mM',
      },
      isCloudSyncEnabled: true,
      allowAiCloudProcessing: true,
      isAuthenticated: true,
    };
    return this.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE, defaultProfile);
  }

  public saveUserProfile(profile: UserProfile): UserProfile {
    this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
    this.logActivity('Profile Updated', `Updated user profile settings for ${profile.name}`);
    return profile;
  }

  // --- CLOUD SYNC & CONFLICTS ---
  public getSyncStatus(): SyncStatus {
    return this.getItem<SyncStatus>(STORAGE_KEYS.SYNC_STATUS, 'SYNCED');
  }

  public setSyncStatus(status: SyncStatus) {
    this.setItem(STORAGE_KEYS.SYNC_STATUS, status);
  }

  public getSyncConflicts(): SyncConflict[] {
    return this.getItem<SyncConflict[]>(STORAGE_KEYS.SYNC_CONFLICTS, []);
  }

  public addSyncConflict(conflict: SyncConflict) {
    const list = this.getSyncConflicts().filter(c => c.id !== conflict.id);
    list.push(conflict);
    this.setItem(STORAGE_KEYS.SYNC_CONFLICTS, list);
  }

  public resolveSyncConflict(conflictId: string, keepLocal: boolean) {
    const list = this.getSyncConflicts();
    const conflict = list.find(c => c.id === conflictId);
    if (conflict && !keepLocal) {
      // Overwrite local with cloud version if user explicitly chose cloud
      if (conflict.entityType === 'project') {
        const projects = this.getProjects().map(p => p.id === conflict.entityId ? conflict.cloudVersion : p);
        this.setItem(STORAGE_KEYS.PROJECTS, projects);
      }
    }
    const updatedList = list.filter(c => c.id !== conflictId);
    this.setItem(STORAGE_KEYS.SYNC_CONFLICTS, updatedList);
    this.logActivity('Sync Conflict Resolved', `Resolved conflict for ${conflict?.entityName || 'entity'}`);
  }

  // --- PROTOCOL LIBRARY ---
  public getSavedProtocols(): SavedProtocol[] {
    const defaultProtocols: SavedProtocol[] = [
      {
        id: 1,
        title: 'Bacterial Transformation Protocol (Heat Shock)',
        objective: 'High-efficiency uptake of plasmid DNA into competent E. coli cells.',
        category: 'Molecular Biology',
        tags: ['E. coli', 'Plasmid', 'Heat Shock', 'Transformation'],
        materials: [
          { id: 'm1', name: 'Chemically Competent DH5α Cells', amount: '50 µL', unit: 'µL' },
          { id: 'm2', name: 'Plasmid DNA (10 ng/µL)', amount: '1 µL', unit: 'µL' },
          { id: 'm3', name: 'SOC Medium', amount: '950 µL', unit: 'µL' },
        ],
        equipment: ['Water Bath (42°C)', 'Ice Bucket', 'Shaking Incubator (37°C)'],
        reagents: ['Ampicillin Agar Plates'],
        steps: [
          {
            id: 1,
            projectId: 0,
            groupName: 'Transformation',
            title: 'Incubate Cells on Ice',
            description: 'Thaw competent cells on ice and add 1 µL plasmid DNA. Mix gently and incubate on ice.',
            notes: 'Do not vortex competent cells.',
            durationMinutes: 30,
            isCompleted: false,
            sortOrder: 1,
            createdAt: Date.now(),
          },
          {
            id: 2,
            projectId: 0,
            groupName: 'Transformation',
            title: 'Heat Shock',
            description: 'Place tube in 42°C water bath for exactly 45 seconds.',
            notes: 'Time precision is critical for efficiency.',
            durationMinutes: 1,
            isCompleted: false,
            sortOrder: 2,
            createdAt: Date.now(),
          },
          {
            id: 3,
            projectId: 0,
            groupName: 'Outgrowth',
            title: 'Outgrowth in SOC Medium',
            description: 'Add 950 µL SOC medium and shake at 37°C for 60 minutes.',
            notes: 'Allows antibiotic resistance expression.',
            durationMinutes: 60,
            isCompleted: false,
            sortOrder: 3,
            createdAt: Date.now(),
          },
        ],
        isFavorite: true,
        isAiGenerated: false,
        author: 'Tayyab Khan',
        createdAt: Date.now() - 86400000 * 10,
        updatedAt: Date.now() - 86400000 * 10,
      },
      {
        id: 2,
        title: 'Standard PCR Amplification Protocol',
        objective: 'Target DNA sequence amplification using Taq Polymerase.',
        category: 'Molecular Biology',
        tags: ['PCR', 'Genomics', 'Amplification'],
        materials: [
          { id: 'm1', name: '2X Taq Master Mix', amount: '12.5 µL', unit: 'µL' },
          { id: 'm2', name: 'Forward Primer (10 µM)', amount: '1 µL', unit: 'µL' },
          { id: 'm3', name: 'Reverse Primer (10 µM)', amount: '1 µL', unit: 'µL' },
        ],
        equipment: ['Thermal Cycler'],
        reagents: ['Nuclease-Free Water', 'Template DNA'],
        steps: [
          {
            id: 1,
            projectId: 0,
            groupName: 'Master Mix',
            title: 'Assemble Reaction Mix',
            description: 'Mix Taq Master Mix, primers, template, and water in PCR tube.',
            notes: 'Keep on ice during assembly.',
            durationMinutes: 10,
            isCompleted: false,
            sortOrder: 1,
            createdAt: Date.now(),
          },
          {
            id: 2,
            projectId: 0,
            groupName: 'Thermocycling',
            title: 'Run Thermal Cycler Program',
            description: '95°C 5m, 35x (95°C 30s, 58°C 30s, 72°C 1m), 72°C 5m.',
            notes: 'Store at 4°C after run completion.',
            durationMinutes: 105,
            isCompleted: false,
            sortOrder: 2,
            createdAt: Date.now(),
          },
        ],
        isFavorite: false,
        isAiGenerated: true,
        author: 'MTKmicro AI',
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 3,
      },
    ];
    return this.getItem<SavedProtocol[]>(STORAGE_KEYS.SAVED_PROTOCOLS, defaultProtocols);
  }

  public saveProtocol(protocol: Omit<SavedProtocol, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): SavedProtocol {
    const list = this.getSavedProtocols();
    const now = Date.now();
    let saved: SavedProtocol;

    if (protocol.id) {
      saved = { ...protocol, id: protocol.id, updatedAt: now, createdAt: now };
      const idx = list.findIndex(p => p.id === protocol.id);
      if (idx >= 0) list[idx] = saved;
      else list.push(saved);
    } else {
      saved = {
        ...protocol,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
      };
      list.push(saved);
    }

    this.setItem(STORAGE_KEYS.SAVED_PROTOCOLS, list);
    this.logActivity('Protocol Saved', `Saved protocol "${saved.title}"`);
    return saved;
  }

  public deleteProtocol(id: number) {
    const list = this.getSavedProtocols().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.SAVED_PROTOCOLS, list);
  }

  public toggleProtocolFavorite(id: number) {
    const list = this.getSavedProtocols();
    const p = list.find(item => item.id === id);
    if (p) {
      p.isFavorite = !p.isFavorite;
      this.setItem(STORAGE_KEYS.SAVED_PROTOCOLS, list);
    }
  }

  // --- ACTIVITY AUDIT LOG ---
  public getActivityLogs(): ActivityLogEntry[] {
    const defaultLogs: ActivityLogEntry[] = [
      {
        id: 'act_1',
        projectId: 1,
        userName: 'Tayyab Khan',
        action: 'Completed Protocol Step',
        details: 'Marked "Prepare Master Mix" as completed.',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        id: 'act_2',
        projectId: 1,
        userName: 'Tayyab Khan',
        action: 'Saved Analysis',
        details: 'Saved colony counting analysis with 42 CFUs.',
        timestamp: Date.now() - 3600000 * 5,
      },
      {
        id: 'act_3',
        userName: 'System',
        action: 'Cloud Synchronization',
        details: 'Successfully synchronized 3 active projects with cloud backup.',
        timestamp: Date.now() - 3600000 * 12,
      },
    ];
    return this.getItem<ActivityLogEntry[]>(STORAGE_KEYS.ACTIVITY_LOG, defaultLogs);
  }

  public logActivity(action: string, details: string, projectId?: number | null) {
    const logs = this.getActivityLogs();
    const profile = this.getUserProfile();
    const newEntry: ActivityLogEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: projectId || null,
      userName: profile.name || 'User',
      action,
      details,
      timestamp: Date.now(),
    };
    logs.unshift(newEntry);
    this.setItem(STORAGE_KEYS.ACTIVITY_LOG, logs.slice(0, 100)); // Limit to last 100 logs
  }

  // --- AI CONVERSATIONS ---
  public getAiConversations(): AiConversation[] {
    return this.getItem<AiConversation[]>(STORAGE_KEYS.AI_CONVERSATIONS, []);
  }

  public saveAiConversation(convo: Omit<AiConversation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): AiConversation {
    const list = this.getAiConversations();
    const now = Date.now();
    let saved: AiConversation;

    if (convo.id) {
      saved = { ...convo, id: convo.id, updatedAt: now, createdAt: now };
      const idx = list.findIndex(c => c.id === convo.id);
      if (idx >= 0) list[idx] = saved;
      else list.push(saved);
    } else {
      saved = {
        ...convo,
        id: `convo_${now}`,
        createdAt: now,
        updatedAt: now,
      };
      list.push(saved);
    }

    this.setItem(STORAGE_KEYS.AI_CONVERSATIONS, list);
    return saved;
  }

  public deleteAiConversation(id: string) {
    const list = this.getAiConversations().filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.AI_CONVERSATIONS, list);
  }

  // --- CALENDAR & EVENTS ---
  public getCalendarEvents(): LabCalendarEvent[] {
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultEvents: LabCalendarEvent[] = [
      {
        id: 'ev_1',
        title: 'Plasmid Isolation & Gel Run',
        date: todayStr,
        time: '10:00 AM',
        projectId: 2,
        protocolTitle: 'Alkaline Lysis Extraction',
        notes: 'Prepare 1% agarose gel before run.',
        type: 'EXPERIMENT',
      },
      {
        id: 'ev_2',
        title: 'Check E. coli Culture OD600',
        date: todayStr,
        time: '02:30 PM',
        projectId: 1,
        notes: 'Target OD600 is 0.6 for induction.',
        type: 'REMINDER',
      },
    ];
    return this.getItem<LabCalendarEvent[]>(STORAGE_KEYS.CALENDAR_EVENTS, defaultEvents);
  }

  public saveCalendarEvent(event: Omit<LabCalendarEvent, 'id'> & { id?: string }): LabCalendarEvent {
    const list = this.getCalendarEvents();
    let saved: LabCalendarEvent;

    if (event.id) {
      saved = { ...event, id: event.id };
      const idx = list.findIndex(e => e.id === event.id);
      if (idx >= 0) list[idx] = saved;
      else list.push(saved);
    } else {
      saved = {
        ...event,
        id: `ev_${Date.now()}`,
      };
      list.push(saved);
    }

    this.setItem(STORAGE_KEYS.CALENDAR_EVENTS, list);
    this.logActivity('Calendar Event Created', `Scheduled event "${saved.title}" on ${saved.date}`);
    return saved;
  }

  public deleteCalendarEvent(id: string) {
    const list = this.getCalendarEvents().filter(e => e.id !== id);
    this.setItem(STORAGE_KEYS.CALENDAR_EVENTS, list);
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): LabNotification[] {
    const defaultNotifs: LabNotification[] = [
      {
        id: 'n_1',
        title: 'Timer Finished',
        message: 'PCR Thermocycling (90 min) has finished.',
        type: 'TIMER',
        timestamp: Date.now() - 1800000,
        isRead: false,
      },
      {
        id: 'n_2',
        title: 'Cloud Sync Completed',
        message: '3 projects successfully backed up to cloud.',
        type: 'SYNC',
        timestamp: Date.now() - 7200000,
        isRead: true,
      },
    ];
    return this.getItem<LabNotification[]>(STORAGE_KEYS.NOTIFICATIONS, defaultNotifs);
  }

  public addNotification(title: string, message: string, type: LabNotification['type']) {
    const list = this.getNotifications();
    list.unshift({
      id: `n_${Date.now()}`,
      title,
      message,
      type,
      timestamp: Date.now(),
      isRead: false,
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list.slice(0, 50));
  }

  public markNotificationRead(id: string) {
    const list = this.getNotifications();
    const item = list.find(n => n.id === id);
    if (item) {
      item.isRead = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  // --- FAVORITES ---
  public getFavorites(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.FAVORITES, ['colony_counter', 'molarity', 'master_mix', 'proj_1']);
  }

  public toggleFavorite(itemId: string) {
    const list = this.getFavorites();
    const idx = list.indexOf(itemId);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(itemId);
    this.setItem(STORAGE_KEYS.FAVORITES, list);
  }

  // --- PROJECT SHARING ---
  public getSharedProjects(): SharedProjectConfig[] {
    return this.getItem<SharedProjectConfig[]>(STORAGE_KEYS.SHARED_PROJECTS, [
      {
        projectId: 1,
        accessType: 'SPECIFIC_USERS',
        members: [
          { userId: 'usr_owner', name: 'Tayyab Khan', email: 'm.tayyabkhan.eb23221006055@gmail.com', role: 'EDITOR' },
          { userId: 'usr_2', name: 'Dr. Sarah Jenkins', email: 's.jenkins@biotech.org', role: 'VIEWER' },
        ],
        shareLink: 'https://mtkmicro.app/share/prj_1_x9f8',
      },
    ]);
  }

  public saveSharedProjectConfig(config: SharedProjectConfig) {
    const list = this.getSharedProjects().filter(s => s.projectId !== config.projectId);
    list.push(config);
    this.setItem(STORAGE_KEYS.SHARED_PROJECTS, list);
    this.logActivity('Sharing Configured', `Updated sharing permissions for project #${config.projectId}`, config.projectId);
  }

  // --- FOOD SAFETY INTELLIGENCE ---
  public getFoodSamples(): FoodSample[] {
    const initialSamples: FoodSample[] = [
      {
        id: 'MTK-FOOD-2026-0001',
        sampleName: 'Frozen Raw Tiger Shrimp Batch A',
        foodCategory: 'Seafood',
        productType: 'Raw Frozen Shellfish',
        processingStatus: 'Raw',
        packagingType: 'Plastic vacuum pack',
        storageCondition: 'Frozen (-18°C)',
        isReadyToEat: false,
        isRawOrProcessed: 'RAW',
        sampleSource: 'Port Processing Facility #4',
        collectionDate: '2026-08-05',
        lotBatchNumber: 'SHR-2026-X88',
        notes: 'Routine microbiological export screening.',
        status: 'Testing in Progress',
        receivedBy: 'Tech M. Tayyab',
        receivedDate: '2026-08-05',
        riskFactors: {
          containsSeafood: true,
          isFrozen: true,
          isRaw: true,
          isVacuumPackaged: true,
        },
        projectId: 1,
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 3,
      },
      {
        id: 'MTK-FOOD-2026-0002',
        sampleName: 'Pasteurized Whole Milk Lot 12',
        foodCategory: 'Dairy',
        productType: 'Liquid Dairy',
        processingStatus: 'Pasteurized',
        packagingType: 'HDPE Bottle',
        storageCondition: 'Refrigerated (4°C)',
        isReadyToEat: true,
        isRawOrProcessed: 'PROCESSED',
        sampleSource: 'Central Dairy Co.',
        collectionDate: '2026-08-06',
        lotBatchNumber: 'MLK-882-01',
        notes: 'Pathogen and coliform compliance check.',
        status: 'Registered',
        receivedBy: 'Tech M. Tayyab',
        receivedDate: '2026-08-06',
        riskFactors: {
          containsDairy: true,
          isRefrigerated: true,
          isReadyToEat: true,
          wasHeatProcessed: true,
        },
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 86400000 * 2,
      },
    ];

    return this.getItem<FoodSample[]>(STORAGE_KEYS.FOOD_SAMPLES, initialSamples);
  }

  public saveFoodSample(sample: Omit<FoodSample, 'createdAt' | 'updatedAt'> & { createdAt?: number }): FoodSample {
    const list = this.getFoodSamples();
    const existingIndex = list.findIndex(s => s.id === sample.id);
    const now = Date.now();

    const fullSample: FoodSample = {
      ...sample,
      createdAt: sample.createdAt || now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = fullSample;
    } else {
      list.unshift(fullSample);
    }

    this.setItem(STORAGE_KEYS.FOOD_SAMPLES, list);
    this.logActivity('Food Sample Saved', `Saved food sample ID ${sample.id} (${sample.sampleName})`);
    return fullSample;
  }

  public deleteFoodSample(sampleId: string) {
    const list = this.getFoodSamples().filter(s => s.id !== sampleId);
    this.setItem(STORAGE_KEYS.FOOD_SAMPLES, list);
    this.logActivity('Food Sample Deleted', `Deleted food sample ID ${sampleId}`);
  }

  public getFoodTestPlans(sampleId?: string): FoodTestPlanItem[] {
    const initialPlans: FoodTestPlanItem[] = [
      {
        id: 'tp_1',
        sampleId: 'MTK-FOOD-2026-0001',
        targetOrganism: 'Vibrio spp.',
        testCategory: 'Vibrio testing',
        testType: 'Detection',
        purpose: 'Primary seafood pathogen risk evaluation (ISO 21872 / FDA BAM Ch 9).',
        priority: 'High',
        status: 'In Progress',
        referenceMethod: 'ISO 21872-1:2017',
        confirmationRequired: true,
        resourceAvailable: true,
        result: 'Presumptive Positive',
        resultValue: 'Yellow colonies on TCBS',
        resultUnits: 'Qualitative',
        analyst: 'M. Tayyab',
        testDate: '2026-08-06',
        notes: 'Green and yellow colonies isolated on TCBS. Requires halotolerance and PCR confirmation.',
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'tp_2',
        sampleId: 'MTK-FOOD-2026-0001',
        targetOrganism: 'Salmonella spp.',
        testCategory: 'Salmonella detection',
        testType: 'Detection',
        purpose: 'Zero-tolerance pathogen detection in seafood export.',
        priority: 'High',
        status: 'Completed',
        referenceMethod: 'ISO 6579-1:2017',
        confirmationRequired: true,
        resourceAvailable: true,
        result: 'Not Detected',
        resultValue: 'Absence in 25g',
        resultUnits: 'Qualitative',
        analyst: 'M. Tayyab',
        testDate: '2026-08-07',
        notes: 'No black colonies observed on XLD agar.',
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 86400000 * 1,
      },
    ];

    const all = this.getItem<FoodTestPlanItem[]>(STORAGE_KEYS.FOOD_TEST_PLANS, initialPlans);
    if (sampleId) {
      return all.filter(p => p.sampleId === sampleId);
    }
    return all;
  }

  public saveFoodTestPlanItem(item: Omit<FoodTestPlanItem, 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: number }): FoodTestPlanItem {
    const list = this.getFoodTestPlans();
    const now = Date.now();
    const id = item.id || `tp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const fullItem: FoodTestPlanItem = {
      ...item,
      id,
      createdAt: item.createdAt || now,
      updatedAt: now,
    };

    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
      list[idx] = fullItem;
    } else {
      list.push(fullItem);
    }

    this.setItem(STORAGE_KEYS.FOOD_TEST_PLANS, list);
    this.logActivity('Test Plan Updated', `Saved test plan for ${item.targetOrganism} on sample ${item.sampleId}`);
    return fullItem;
  }

  public deleteFoodTestPlanItem(id: string) {
    const list = this.getFoodTestPlans().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.FOOD_TEST_PLANS, list);
  }

  public getMyLabResources(): MyLabResource[] {
    const defaultResources: MyLabResource[] = [
      { id: 'res_1', category: 'MEDIA', name: 'TCBS Agar', isAvailable: true, notes: 'Stocked for Vibrio testing' },
      { id: 'res_2', category: 'MEDIA', name: 'XLD Agar', isAvailable: true, notes: 'Stocked for Salmonella testing' },
      { id: 'res_3', category: 'MEDIA', name: 'MacConkey Agar', isAvailable: true, notes: 'Coliform / E. coli screening' },
      { id: 'res_4', category: 'MEDIA', name: 'Baird-Parker Agar', isAvailable: true, notes: 'Staph aureus isolation' },
      { id: 'res_5', category: 'MEDIA', name: 'PALCAM / Chromogenic Listeria Agar', isAvailable: false, notes: 'Reorder pending' },
      { id: 'res_6', category: 'EQUIPMENT', name: 'Incubator (35°C - 37°C)', isAvailable: true, notes: 'Operational' },
      { id: 'res_7', category: 'EQUIPMENT', name: 'Refrigerated Incubator (25°C)', isAvailable: true, notes: 'Yeast/mold testing' },
      { id: 'res_8', category: 'EQUIPMENT', name: 'Anaerobic Jar System', isAvailable: true, notes: 'Clostridial testing' },
      { id: 'res_9', category: 'MOLECULAR', name: 'Real-Time qPCR Thermocycler', isAvailable: true, notes: 'Pathogen gene assays' },
      { id: 'res_10', category: 'KITS', name: 'Gram Stain Kit & Light Microscope', isAvailable: true, notes: 'Morphology confirmation' },
    ];
    return this.getItem<MyLabResource[]>(STORAGE_KEYS.FOOD_LAB_RESOURCES, defaultResources);
  }

  public saveMyLabResource(resource: MyLabResource) {
    const list = this.getMyLabResources();
    const idx = list.findIndex(r => r.id === resource.id);
    if (idx >= 0) {
      list[idx] = resource;
    } else {
      list.push(resource);
    }
    this.setItem(STORAGE_KEYS.FOOD_LAB_RESOURCES, list);
  }

  public toggleLabResourceAvailability(resourceId: string) {
    const list = this.getMyLabResources();
    const item = list.find(r => r.id === resourceId);
    if (item) {
      item.isAvailable = !item.isAvailable;
      this.setItem(STORAGE_KEYS.FOOD_LAB_RESOURCES, list);
    }
  }

  public getChainOfCustody(sampleId?: string): ChainOfCustodyRecord[] {
    const initialRecords: ChainOfCustodyRecord[] = [
      {
        id: 'coc_1',
        sampleId: 'MTK-FOOD-2026-0001',
        receivedBy: 'Tech M. Tayyab',
        dateTime: '2026-08-05 09:30 AM',
        condition: 'Intact, Frozen (-18°C), Cold Chain Maintained',
        storageStatus: 'Freezer Unit B-02',
        transferredBy: 'Courier SpeedLogistics #82',
        transferredTo: 'Sample Receiving Desk',
        notes: 'Temperature logger verified at -18.2°C upon intake.',
        timestamp: Date.now() - 86400000 * 3,
      },
    ];
    const list = this.getItem<ChainOfCustodyRecord[]>(STORAGE_KEYS.FOOD_CHAIN_OF_CUSTODY, initialRecords);
    if (sampleId) {
      return list.filter(r => r.sampleId === sampleId);
    }
    return list;
  }

  public addChainOfCustodyRecord(record: Omit<ChainOfCustodyRecord, 'id' | 'timestamp'>): ChainOfCustodyRecord {
    const list = this.getChainOfCustody();
    const newRecord: ChainOfCustodyRecord = {
      ...record,
      id: `coc_${Date.now()}`,
      timestamp: Date.now(),
    };
    list.unshift(newRecord);
    this.setItem(STORAGE_KEYS.FOOD_CHAIN_OF_CUSTODY, list);
    this.logActivity('Chain of Custody Updated', `Added custody record for sample ${record.sampleId}`);
    return newRecord;
  }

  public getTestingChecklist(sampleId?: string): TestingChecklistItem[] {
    const defaultChecklist: TestingChecklistItem[] = [
      { id: 'chk_1', sampleId: 'MTK-FOOD-2026-0001', title: 'Sample intake & chain-of-custody verification', isCompleted: true, category: 'Receiving' },
      { id: 'chk_2', sampleId: 'MTK-FOOD-2026-0001', title: 'Aseptic sample preparation & 25g homogenization', isCompleted: true, category: 'Preparation' },
      { id: 'chk_3', sampleId: 'MTK-FOOD-2026-0001', title: 'Inoculation into APW & BPW pre-enrichment broths', isCompleted: true, category: 'Testing' },
      { id: 'chk_4', sampleId: 'MTK-FOOD-2026-0001', title: 'Selective plating onto TCBS and XLD Agars', isCompleted: true, category: 'Testing' },
      { id: 'chk_5', sampleId: 'MTK-FOOD-2026-0001', title: 'Presumptive colony morphology review', isCompleted: true, category: 'Analysis' },
      { id: 'chk_6', sampleId: 'MTK-FOOD-2026-0001', title: 'Halotolerance and biochemical confirmation testing', isCompleted: false, category: 'Confirmation' },
      { id: 'chk_7', sampleId: 'MTK-FOOD-2026-0001', title: 'Result verification & analyst sign-off report', isCompleted: false, category: 'Reporting' },
    ];
    const list = this.getItem<TestingChecklistItem[]>(STORAGE_KEYS.FOOD_CHECKLISTS, defaultChecklist);
    if (sampleId) {
      return list.filter(c => c.sampleId === sampleId);
    }
    return list;
  }

  public toggleChecklistItem(id: string) {
    const list = this.getTestingChecklist();
    const item = list.find(c => c.id === id);
    if (item) {
      item.isCompleted = !item.isCompleted;
      this.setItem(STORAGE_KEYS.FOOD_CHECKLISTS, list);
    }
  }

  public addChecklistItem(sampleId: string, title: string, category: string = 'Custom'): TestingChecklistItem {
    const list = this.getTestingChecklist();
    const newItem: TestingChecklistItem = {
      id: `chk_${Date.now()}`,
      sampleId,
      title,
      isCompleted: false,
      category,
    };
    list.push(newItem);
    this.setItem(STORAGE_KEYS.FOOD_CHECKLISTS, list);
    return newItem;
  }

  public clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.STEPS);
    localStorage.removeItem(STORAGE_KEYS.TIMERS);
    localStorage.removeItem(STORAGE_KEYS.MASTER_MIX);
    localStorage.removeItem(STORAGE_KEYS.BUFFERS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.CALCS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.COLONY_COUNTS);
    localStorage.removeItem(STORAGE_KEYS.PLATES);
    localStorage.removeItem(STORAGE_KEYS.GEL_ANNOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.IMAGE_MEASUREMENTS);
    localStorage.removeItem(STORAGE_KEYS.CALIBRATIONS);
    localStorage.removeItem(STORAGE_KEYS.CELL_COUNTS);
    localStorage.removeItem(STORAGE_KEYS.BLOOD_CELL_COUNTS);
    localStorage.removeItem(STORAGE_KEYS.CELL_CULTURES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_COUNTERS);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SAVED_PROTOCOLS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOG);
    localStorage.removeItem(STORAGE_KEYS.AI_CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.CALENDAR_EVENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.SYNC_STATUS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_CONFLICTS);
    localStorage.removeItem(STORAGE_KEYS.SHARED_PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.FOOD_SAMPLES);
    localStorage.removeItem(STORAGE_KEYS.FOOD_TEST_PLANS);
    localStorage.removeItem(STORAGE_KEYS.FOOD_LAB_RESOURCES);
    localStorage.removeItem(STORAGE_KEYS.FOOD_CHAIN_OF_CUSTODY);
    localStorage.removeItem(STORAGE_KEYS.FOOD_CHECKLISTS);
    this.notify();
  }
}
