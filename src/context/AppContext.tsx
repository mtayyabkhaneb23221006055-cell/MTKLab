/**
 * MTKmicro Lab - App Context & State Provider
 * Handles navigation state, real-time timer updates, audio notifications, and theme management
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Project,
  ProtocolStep,
  LabTimer,
  MasterMixRecipe,
  BufferRecipe,
  AppSettings,
  ScreenRoute,
  CalculatorType,
  SearchResultItem,
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
import { StorageRepository } from '../db/storage';
import { playTimerCompletionSound } from '../utils/audio';

interface AppContextType {
  // Navigation
  route: ScreenRoute;
  navHistory: ScreenRoute[];
  navigateTo: (newRoute: ScreenRoute) => void;
  navigateBack: () => void;

  // Data State
  projects: Project[];
  activeProject: Project | null;
  timers: LabTimer[];
  activeTimers: LabTimer[];
  upcomingTimers: LabTimer[];
  completedTimers: LabTimer[];
  settings: AppSettings;
  masterMixRecipes: MasterMixRecipe[];
  bufferRecipes: BufferRecipe[];

  // Phase 3 Reactive State
  userProfile: UserProfile;
  syncStatus: SyncStatus;
  syncConflicts: SyncConflict[];
  savedProtocols: SavedProtocol[];
  activityLogs: ActivityLogEntry[];
  aiConversations: AiConversation[];
  calendarEvents: LabCalendarEvent[];
  notifications: LabNotification[];
  favorites: string[];
  sharedProjects: SharedProjectConfig[];
  foodSamples: FoodSample[];
  foodTestPlans: FoodTestPlanItem[];
  myLabResources: MyLabResource[];
  chainOfCustody: ChainOfCustodyRecord[];
  testingChecklists: TestingChecklistItem[];

  // Database Actions
  storage: StorageRepository;
  refreshData: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResultItem[];

  // Project Actions
  saveProject: (p: Omit<Project, 'id' | 'createdAt' | 'lastOpenedTimestamp'> & { id?: number }) => Project;
  deleteProject: (id: number) => void;
  openProjectDetail: (projectId: number) => void;

  // Step Actions
  saveStep: (s: Omit<ProtocolStep, 'id' | 'createdAt'> & { id?: number }) => ProtocolStep;
  toggleStep: (stepId: number) => void;
  deleteStep: (stepId: number) => void;
  reorderSteps: (projectId: number, stepIds: number[]) => void;

  // Timer Actions
  saveTimer: (t: Omit<LabTimer, 'id' | 'createdAt'> & { id?: number }) => LabTimer;
  startTimer: (timerId: number) => void;
  pauseTimer: (timerId: number) => void;
  resetTimer: (timerId: number) => void;
  stopTimer: (timerId: number) => void;
  deleteTimer: (timerId: number) => void;
  createAndStartStepTimer: (projectId: number, stepId: number, title: string, durationMin: number) => void;

  // Recipe Actions
  saveMasterMixRecipe: (r: Omit<MasterMixRecipe, 'id' | 'createdAt'>) => void;
  saveBufferRecipe: (r: Omit<BufferRecipe, 'id' | 'createdAt'>) => void;

  // Settings & Phase 3 Actions
  updateSettings: (s: Partial<AppSettings>) => void;
  updateUserProfile: (p: Partial<UserProfile>) => void;
  triggerCloudSync: () => void;
  resolveConflict: (conflictId: string, keepLocal: boolean) => void;
  saveProtocol: (p: Omit<SavedProtocol, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }) => SavedProtocol;
  deleteProtocol: (id: number) => void;
  toggleProtocolFavorite: (id: number) => void;
  saveCalendarEvent: (e: Omit<LabCalendarEvent, 'id'> & { id?: string }) => LabCalendarEvent;
  deleteCalendarEvent: (id: string) => void;
  addNotification: (title: string, message: string, type: LabNotification['type']) => void;
  markNotificationRead: (id: string) => void;
  toggleFavorite: (itemId: string) => void;
  saveSharedProjectConfig: (config: SharedProjectConfig) => void;
  restoreBackup: (jsonStr: string) => boolean;
  exportData: () => void;
  clearAllData: () => void;

  // Food Safety Intelligence Actions
  saveFoodSample: (sample: Omit<FoodSample, 'createdAt' | 'updatedAt'> & { createdAt?: number }) => FoodSample;
  deleteFoodSample: (sampleId: string) => void;
  saveFoodTestPlanItem: (item: Omit<FoodTestPlanItem, 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: number }) => FoodTestPlanItem;
  deleteFoodTestPlanItem: (id: string) => void;
  saveMyLabResource: (resource: MyLabResource) => void;
  toggleLabResourceAvailability: (resourceId: string) => void;
  addChainOfCustodyRecord: (record: Omit<ChainOfCustodyRecord, 'id' | 'timestamp'>) => ChainOfCustodyRecord;
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (sampleId: string, title: string, category?: string) => TestingChecklistItem;
  createProjectFromFoodSample: (sampleId: string) => Project;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const repo = useMemo(() => StorageRepository.getInstance(), []);

  // Navigation State
  const [route, setRoute] = useState<ScreenRoute>({ type: 'HOME' });
  const [navHistory, setNavHistory] = useState<ScreenRoute[]>([{ type: 'HOME' }]);

  // Reactive Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [timers, setTimers] = useState<LabTimer[]>([]);
  const [masterMixRecipes, setMasterMixRecipes] = useState<MasterMixRecipe[]>([]);
  const [bufferRecipes, setBufferRecipes] = useState<BufferRecipe[]>([]);
  const [settings, setSettings] = useState<AppSettings>(repo.getSettings());

  // Phase 3 State
  const [userProfile, setUserProfile] = useState<UserProfile>(repo.getUserProfile());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(repo.getSyncStatus());
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>(repo.getSyncConflicts());
  const [savedProtocols, setSavedProtocols] = useState<SavedProtocol[]>(repo.getSavedProtocols());
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(repo.getActivityLogs());
  const [aiConversations, setAiConversations] = useState<AiConversation[]>(repo.getAiConversations());
  const [calendarEvents, setCalendarEvents] = useState<LabCalendarEvent[]>(repo.getCalendarEvents());
  const [notifications, setNotifications] = useState<LabNotification[]>(repo.getNotifications());
  const [favorites, setFavorites] = useState<string[]>(repo.getFavorites());
  const [sharedProjects, setSharedProjects] = useState<SharedProjectConfig[]>(repo.getSharedProjects());

  // Phase 4 Food Safety State
  const [foodSamples, setFoodSamples] = useState<FoodSample[]>(repo.getFoodSamples());
  const [foodTestPlans, setFoodTestPlans] = useState<FoodTestPlanItem[]>(repo.getFoodTestPlans());
  const [myLabResources, setMyLabResources] = useState<MyLabResource[]>(repo.getMyLabResources());
  const [chainOfCustody, setChainOfCustody] = useState<ChainOfCustodyRecord[]>(repo.getChainOfCustody());
  const [testingChecklists, setTestingChecklists] = useState<TestingChecklistItem[]>(repo.getTestingChecklist());

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  // Load / Refresh Database State
  const refreshData = useCallback(() => {
    setProjects(repo.getProjects());
    setTimers(repo.getTimers());
    setMasterMixRecipes(repo.getMasterMixRecipes());
    setBufferRecipes(repo.getBufferRecipes());
    setSettings(repo.getSettings());
    setUserProfile(repo.getUserProfile());
    setSyncStatus(repo.getSyncStatus());
    setSyncConflicts(repo.getSyncConflicts());
    setSavedProtocols(repo.getSavedProtocols());
    setActivityLogs(repo.getActivityLogs());
    setAiConversations(repo.getAiConversations());
    setCalendarEvents(repo.getCalendarEvents());
    setNotifications(repo.getNotifications());
    setFavorites(repo.getFavorites());
    setSharedProjects(repo.getSharedProjects());
    setFoodSamples(repo.getFoodSamples());
    setFoodTestPlans(repo.getFoodTestPlans());
    setMyLabResources(repo.getMyLabResources());
    setChainOfCustody(repo.getChainOfCustody());
    setTestingChecklists(repo.getTestingChecklist());
  }, [repo]);

  // Initial load & subscribe to storage changes
  useEffect(() => {
    refreshData();
    const unsubscribe = repo.subscribe(() => {
      refreshData();
    });
    return unsubscribe;
  }, [repo, refreshData]);

  // Debounced search evaluation
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchResults(repo.searchAllEntities(searchQuery));
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, repo]);

  // Background 1-second Tick Loop for active timer updates & completion sound
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTimers = repo.getTimers();
      const now = Date.now();
      let hasChange = false;

      currentTimers.forEach(t => {
        if (t.status === 'RUNNING' && t.startedAtMs > 0) {
          const elapsed = now - t.startedAtMs;
          if (t.type === 'COUNTDOWN') {
            const rem = t.remainingMs - elapsed;
            if (rem <= 0) {
              // Timer finished!
              if (settings.notificationsEnabled) {
                playTimerCompletionSound();
              }
              repo.updateTimerStatus(t.id, 'COMPLETED');
              hasChange = true;
            }
          }
        }
      });

      if (hasChange || currentTimers.some(t => t.status === 'RUNNING')) {
        setTimers(repo.getTimers());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [repo, settings.notificationsEnabled]);

  // Apply Light/Dark/System Theme
  useEffect(() => {
    const themeMode = settings.theme;
    const root = document.documentElement;

    const applyTheme = () => {
      if (themeMode === 'DARK') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else if (themeMode === 'LIGHT') {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      } else {
        // System default
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
        }
      }
    };

    applyTheme();

    if (themeMode === 'SYSTEM') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = () => applyTheme();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMediaChange);
        return () => mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.addListener(handleMediaChange);
        return () => mediaQuery.removeListener(handleMediaChange);
      }
    }
  }, [settings.theme]);

  // Navigation Handlers
  const navigateTo = useCallback((newRoute: ScreenRoute) => {
    setNavHistory(prev => [...prev, newRoute]);
    setRoute(newRoute);

    // If opening project detail, touch lastOpened
    if (newRoute.type === 'PROJECT_DETAIL') {
      repo.touchProjectLastOpened(newRoute.projectId);
    }
  }, [repo]);

  const navigateBack = useCallback(() => {
    setNavHistory(prev => {
      if (prev.length <= 1) return prev;
      const nextStack = prev.slice(0, prev.length - 1);
      setRoute(nextStack[nextStack.length - 1]);
      return nextStack;
    });
  }, []);

  // Project Actions
  const activeProject = useMemo(() => {
    if (route.type === 'PROJECT_DETAIL' || route.type === 'EDIT_PROJECT') {
      return repo.getProjectById(route.projectId);
    }
    return null;
  }, [route, repo]);

  const saveProject = useCallback((p: Omit<Project, 'id' | 'createdAt' | 'lastOpenedTimestamp'> & { id?: number }) => {
    const saved = repo.saveProject(p);
    refreshData();
    return saved;
  }, [repo, refreshData]);

  const deleteProject = useCallback((id: number) => {
    repo.deleteProject(id);
    refreshData();
    navigateTo({ type: 'PROJECTS' });
  }, [repo, refreshData, navigateTo]);

  const openProjectDetail = useCallback((projectId: number) => {
    navigateTo({ type: 'PROJECT_DETAIL', projectId });
  }, [navigateTo]);

  // Step Actions
  const saveStep = useCallback((s: Omit<ProtocolStep, 'id' | 'createdAt'> & { id?: number }) => {
    const saved = repo.saveStep(s);
    refreshData();
    return saved;
  }, [repo, refreshData]);

  const toggleStep = useCallback((stepId: number) => {
    repo.toggleStepCompletion(stepId);
    refreshData();
  }, [repo, refreshData]);

  const deleteStep = useCallback((stepId: number) => {
    repo.deleteStep(stepId);
    refreshData();
  }, [repo, refreshData]);

  const reorderSteps = useCallback((projectId: number, stepIds: number[]) => {
    repo.reorderSteps(projectId, stepIds);
    refreshData();
  }, [repo, refreshData]);

  // Timer Actions
  const activeTimers = useMemo(() => timers.filter(t => t.status === 'RUNNING' || t.status === 'PAUSED'), [timers]);
  const upcomingTimers = useMemo(() => timers.filter(t => t.status === 'IDLE'), [timers]);
  const completedTimers = useMemo(() => timers.filter(t => t.status === 'COMPLETED'), [timers]);

  const saveTimer = useCallback((t: Omit<LabTimer, 'id' | 'createdAt'> & { id?: number }) => {
    const saved = repo.saveTimer(t);
    refreshData();
    return saved;
  }, [repo, refreshData]);

  const startTimer = useCallback((timerId: number) => {
    repo.updateTimerStatus(timerId, 'RUNNING');
    refreshData();
  }, [repo, refreshData]);

  const pauseTimer = useCallback((timerId: number) => {
    repo.updateTimerStatus(timerId, 'PAUSED');
    refreshData();
  }, [repo, refreshData]);

  const resetTimer = useCallback((timerId: number) => {
    repo.updateTimerStatus(timerId, 'IDLE');
    refreshData();
  }, [repo, refreshData]);

  const stopTimer = useCallback((timerId: number) => {
    repo.updateTimerStatus(timerId, 'COMPLETED');
    refreshData();
  }, [repo, refreshData]);

  const deleteTimer = useCallback((timerId: number) => {
    repo.deleteTimer(timerId);
    refreshData();
  }, [repo, refreshData]);

  const createAndStartStepTimer = useCallback((projectId: number, stepId: number, title: string, durationMin: number) => {
    const durationMs = durationMin * 60 * 1000;
    const newTimer = repo.saveTimer({
      name: `${title}`,
      type: 'COUNTDOWN',
      projectId,
      stepId,
      totalDurationMs: durationMs,
      remainingMs: durationMs,
      elapsedMs: 0,
      status: 'RUNNING',
      startedAtMs: Date.now(),
    });
    refreshData();
    navigateTo({ type: 'TIMERS', tab: 'ACTIVE' });
    return newTimer;
  }, [repo, refreshData, navigateTo]);

  // Recipe Actions
  const saveMasterMixRecipe = useCallback((r: Omit<MasterMixRecipe, 'id' | 'createdAt'>) => {
    repo.saveMasterMixRecipe(r);
    refreshData();
  }, [repo, refreshData]);

  const saveBufferRecipe = useCallback((r: Omit<BufferRecipe, 'id' | 'createdAt'>) => {
    repo.saveBufferRecipe(r);
    refreshData();
  }, [repo, refreshData]);

  // Settings & Phase 3 Actions
  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    repo.saveSettings(s);
    refreshData();
  }, [repo, refreshData]);

  const updateUserProfile = useCallback((p: Partial<UserProfile>) => {
    const current = repo.getUserProfile();
    repo.saveUserProfile({ ...current, ...p });
    refreshData();
  }, [repo, refreshData]);

  const triggerCloudSync = useCallback(() => {
    repo.setSyncStatus('SYNCING');
    refreshData();
    setTimeout(() => {
      repo.setSyncStatus('SYNCED');
      repo.logActivity('Cloud Synchronization', 'Synchronized local laboratory records with cloud backup.');
      repo.addNotification('Cloud Sync Complete', 'All projects, protocols, and analyses are backed up.', 'SYNC');
      refreshData();
    }, 1200);
  }, [repo, refreshData]);

  const resolveConflict = useCallback((conflictId: string, keepLocal: boolean) => {
    repo.resolveSyncConflict(conflictId, keepLocal);
    refreshData();
  }, [repo, refreshData]);

  const saveProtocol = useCallback((p: Omit<SavedProtocol, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }) => {
    const res = repo.saveProtocol(p);
    refreshData();
    return res;
  }, [repo, refreshData]);

  const deleteProtocol = useCallback((id: number) => {
    repo.deleteProtocol(id);
    refreshData();
  }, [repo, refreshData]);

  const toggleProtocolFavorite = useCallback((id: number) => {
    repo.toggleProtocolFavorite(id);
    refreshData();
  }, [repo, refreshData]);

  const saveCalendarEvent = useCallback((e: Omit<LabCalendarEvent, 'id'> & { id?: string }) => {
    const res = repo.saveCalendarEvent(e);
    refreshData();
    return res;
  }, [repo, refreshData]);

  const deleteCalendarEvent = useCallback((id: string) => {
    repo.deleteCalendarEvent(id);
    refreshData();
  }, [repo, refreshData]);

  const addNotification = useCallback((title: string, message: string, type: LabNotification['type']) => {
    repo.addNotification(title, message, type);
    refreshData();
  }, [repo, refreshData]);

  const markNotificationRead = useCallback((id: string) => {
    repo.markNotificationRead(id);
    refreshData();
  }, [repo, refreshData]);

  const toggleFavorite = useCallback((itemId: string) => {
    repo.toggleFavorite(itemId);
    refreshData();
  }, [repo, refreshData]);

  const saveSharedProjectConfig = useCallback((config: SharedProjectConfig) => {
    repo.saveSharedProjectConfig(config);
    refreshData();
  }, [repo, refreshData]);

  const restoreBackup = useCallback((jsonStr: string) => {
    const success = repo.restoreDatabaseFromJson(jsonStr);
    if (success) refreshData();
    return success;
  }, [repo, refreshData]);

  const exportData = useCallback(() => {
    const jsonStr = repo.exportDatabaseAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `MTKmicroLab_export_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [repo]);

  const clearAllData = useCallback(() => {
    repo.clearAllData();
    refreshData();
    navigateTo({ type: 'HOME' });
  }, [repo, refreshData, navigateTo]);

  // Food Safety Intelligence Actions
  const saveFoodSample = useCallback((sample: Omit<FoodSample, 'createdAt' | 'updatedAt'> & { createdAt?: number }) => {
    const res = repo.saveFoodSample(sample);
    refreshData();
    return res;
  }, [repo, refreshData]);

  const deleteFoodSample = useCallback((sampleId: string) => {
    repo.deleteFoodSample(sampleId);
    refreshData();
  }, [repo, refreshData]);

  const saveFoodTestPlanItem = useCallback((item: Omit<FoodTestPlanItem, 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: number }) => {
    const res = repo.saveFoodTestPlanItem(item);
    refreshData();
    return res;
  }, [repo, refreshData]);

  const deleteFoodTestPlanItem = useCallback((id: string) => {
    repo.deleteFoodTestPlanItem(id);
    refreshData();
  }, [repo, refreshData]);

  const saveMyLabResource = useCallback((resource: MyLabResource) => {
    repo.saveMyLabResource(resource);
    refreshData();
  }, [repo, refreshData]);

  const toggleLabResourceAvailability = useCallback((resourceId: string) => {
    repo.toggleLabResourceAvailability(resourceId);
    refreshData();
  }, [repo, refreshData]);

  const addChainOfCustodyRecord = useCallback((record: Omit<ChainOfCustodyRecord, 'id' | 'timestamp'>) => {
    const res = repo.addChainOfCustodyRecord(record);
    refreshData();
    return res;
  }, [repo, refreshData]);

  const toggleChecklistItem = useCallback((id: string) => {
    repo.toggleChecklistItem(id);
    refreshData();
  }, [repo, refreshData]);

  const addChecklistItem = useCallback((sampleId: string, title: string, category: string = 'Custom') => {
    const res = repo.addChecklistItem(sampleId, title, category);
    refreshData();
    return res;
  }, [repo, refreshData]);

  const createProjectFromFoodSample = useCallback((sampleId: string) => {
    const samples = repo.getFoodSamples();
    const sample = samples.find(s => s.id === sampleId);
    if (!sample) throw new Error('Sample not found');

    const testPlan = repo.getFoodTestPlans(sampleId);

    // Create a new laboratory project
    const newProject = repo.saveProject({
      name: `Food Safety Test: ${sample.sampleName} (${sample.id})`,
      description: `Microbiological testing project generated for ${sample.foodCategory} sample ${sample.id}. Batch/Lot: ${sample.lotBatchNumber || 'N/A'}.`,
      date: Date.now(),
      status: 'IN_PROGRESS',
      tags: ['Food Safety', sample.foodCategory, 'Phase 4 Intelligence'],
    });

    // Create protocol steps from test plan items
    testPlan.forEach((tp, idx) => {
      repo.saveStep({
        projectId: newProject.id,
        orderIndex: idx + 1,
        groupName: tp.testCategory,
        title: `Test Target: ${tp.targetOrganism} [${tp.testType}]`,
        description: `Method: ${tp.referenceMethod}. Purpose: ${tp.purpose}`,
        isCompleted: tp.status === 'Completed',
        notes: tp.result ? `Result: ${tp.result} (${tp.resultValue || ''})` : 'Awaiting testing',
      });
    });

    // Link project ID to sample
    repo.saveFoodSample({
      ...sample,
      projectId: newProject.id,
      status: 'Testing in Progress',
    });

    refreshData();
    return newProject;
  }, [repo, refreshData]);

  return (
    <AppContext.Provider
      value={{
        route,
        navHistory,
        navigateTo,
        navigateBack,
        projects,
        activeProject,
        timers,
        activeTimers,
        upcomingTimers,
        completedTimers,
        settings,
        masterMixRecipes,
        bufferRecipes,
        userProfile,
        syncStatus,
        syncConflicts,
        savedProtocols,
        activityLogs,
        aiConversations,
        calendarEvents,
        notifications,
        favorites,
        sharedProjects,
        foodSamples,
        foodTestPlans,
        myLabResources,
        chainOfCustody,
        testingChecklists,
        storage: repo,
        refreshData,
        searchQuery,
        setSearchQuery,
        searchResults,
        saveProject,
        deleteProject,
        openProjectDetail,
        saveStep,
        toggleStep,
        deleteStep,
        reorderSteps,
        saveTimer,
        startTimer,
        pauseTimer,
        resetTimer,
        stopTimer,
        deleteTimer,
        createAndStartStepTimer,
        saveMasterMixRecipe,
        saveBufferRecipe,
        updateSettings,
        updateUserProfile,
        triggerCloudSync,
        resolveConflict,
        saveProtocol,
        deleteProtocol,
        toggleProtocolFavorite,
        saveCalendarEvent,
        deleteCalendarEvent,
        addNotification,
        markNotificationRead,
        toggleFavorite,
        saveSharedProjectConfig,
        restoreBackup,
        exportData,
        clearAllData,
        saveFoodSample,
        deleteFoodSample,
        saveFoodTestPlanItem,
        deleteFoodTestPlanItem,
        saveMyLabResource,
        toggleLabResourceAvailability,
        addChainOfCustodyRecord,
        toggleChecklistItem,
        addChecklistItem,
        createProjectFromFoodSample,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
