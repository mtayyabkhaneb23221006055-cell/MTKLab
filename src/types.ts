/**
 * MTKmicro Lab - Scientific Laboratory Companion
 * Data Models & Types
 */

export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type TimerType = 'COUNTDOWN' | 'STOPWATCH';

export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export interface Project {
  id: number;
  name: string;
  description: string;
  date: number; // timestamp
  tags: string[];
  status: ProjectStatus;
  lastOpenedTimestamp: number;
  createdAt: number;
}

export interface ProtocolStep {
  id: number;
  projectId: number;
  groupName: string;
  title: string;
  description: string;
  notes: string;
  durationMinutes: number | null;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: number;
}

export interface LabTimer {
  id: number;
  name: string;
  type: TimerType;
  projectId: number | null;
  stepId: number | null;
  totalDurationMs: number; // For COUNTDOWN
  remainingMs: number; // Remaining time in ms
  elapsedMs: number; // For STOPWATCH
  status: TimerStatus;
  startedAtMs: number; // Timestamp when last started/resumed
  createdAt: number;
  completedAt?: number | null;
}

export interface MasterMixComponent {
  id: string;
  name: string;
  stockConc: number;
  stockConcUnit: string;
  finalConc: number;
  finalConcUnit: string;
}

export interface MasterMixRecipe {
  id: number;
  name: string;
  reactionVolume: number;
  reactionVolumeUnit: string;
  numReactions: number;
  overagePercent: number;
  components: MasterMixComponent[];
  createdAt: number;
}

export interface BufferComponent {
  id: string;
  name: string;
  finalConc: number;
  finalConcUnit: string;
  mw?: number | null; // Molecular weight in g/mol
  stockConc?: number | null; // Optional stock conc
  stockConcUnit?: string | null;
}

export interface BufferRecipe {
  id: number;
  name: string;
  finalVolume: number;
  finalVolumeUnit: string;
  components: BufferComponent[];
  createdAt: number;
}

export interface ProjectNote {
  id: number;
  projectId: number;
  contentType: 'MATERIALS' | 'NOTES';
  content: string;
  updatedAt: number;
}

export interface SavedCalculation {
  id: number;
  calculatorType: string;
  inputJson: string;
  resultJson: string;
  createdAt: number;
}

export interface AppSettings {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  notificationsEnabled: boolean;
  defaultVolumeUnit: 'µL' | 'mL' | 'L';
  defaultConcUnit: 'M' | 'mM' | 'µM';
}

export type ScreenRoute =
  | { type: 'HOME' }
  | { type: 'PROJECTS' }
  | { type: 'PROJECT_DETAIL'; projectId: number }
  | { type: 'CREATE_PROJECT' }
  | { type: 'EDIT_PROJECT'; projectId: number }
  | { type: 'TOOLS' }
  | { type: 'CALCULATOR'; toolId: CalculatorType }
  | { type: 'TIMERS'; tab?: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' }
  | { type: 'SEARCH' }
  | { type: 'SETTINGS' }
  | { type: 'ABOUT' }
  | { type: 'AUTH'; subView?: 'SIGN_IN' | 'REGISTER' | 'FORGOT' | 'PROFILE' }
  | { type: 'AI_SCANNER' }
  | { type: 'AI_ASSISTANT'; projectId?: number }
  | { type: 'PROTOCOLS'; tab?: 'ALL' | 'MY' | 'FAVORITES' | 'SHARED' | 'AI' }
  | { type: 'REPORT_GENERATOR'; projectId?: number }
  | { type: 'CALENDAR' }
  | { type: 'PRIVACY' }
  | { type: 'BACKUP_RESTORE' }
  | { type: 'FOOD_SAFETY'; sampleId?: string; subTab?: string };

export type CalculatorType =
  | 'molarity'
  | 'dilution'
  | 'serial_dilution'
  | 'master_mix'
  | 'buffer'
  | 'unit_converter'
  | 'scientific'
  | 'colony_counter'
  | 'plate_labelling'
  | 'gel_annotator'
  | 'image_measurer'
  | 'calibration_curve'
  | 'cell_counter'
  | 'blood_cell_counter'
  | 'cell_culture_tracker'
  | 'custom_counter'
  | 'food_safety_analyzer'
  | 'equipment_sop';

export interface ColonyPoint {
  id: string;
  x: number;
  y: number;
  isAuto: boolean;
}

export interface DetectedColony {
  id: string;
  x: number;
  y: number;
  radius: number;
  isManual?: boolean;
}

export interface ColonyCountSession {
  id: number;
  sampleId: string;
  plateId: string;
  imageUri: string;
  rawCount: number;
  finalCount: number;
  dilutionFactor: number;
  platedVolume: number; // in mL
  calculatedCFU: number | null;
  notes: string;
  points: ColonyPoint[];
  projectId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export type PlateFormat = '6' | '12' | '24' | '48' | '96' | 'CUSTOM';

export interface PlateWell {
  id: string; // e.g. "A1"
  row: number;
  col: number;
  label: string;
  sampleId: string;
  description: string;
  colorTag: string; // hex color or preset
  notes: string;
}

export interface Plate {
  id: number;
  name: string;
  plateType: PlateFormat;
  customRows?: number;
  customCols?: number;
  wells: Record<string, PlateWell>;
  projectId?: number | null;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface GelAnnotation {
  id: string;
  type: 'text' | 'arrow' | 'line' | 'rectangle' | 'circle' | 'freehand' | 'lane' | 'band';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  color: string;
  strokeWidth: number;
}

export interface GelAnnotationSession {
  id: number;
  title: string;
  sampleName: string;
  experiment: string;
  imageUri: string;
  annotations: GelAnnotation[];
  notes: string;
  projectId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface MeasurementLine {
  id: string;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  pixelDistance: number;
  realDistance: number;
  unit: string;
  color: string;
}

export interface ImageMeasurementSession {
  id: number;
  title: string;
  imageUri: string;
  scalePixels: number;
  scaleRealValue: number;
  scaleUnit: string;
  measurements: MeasurementLine[];
  notes: string;
  projectId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CalibrationStandard {
  id: string;
  name: string;
  concentration: number;
  response: number;
}

export interface CalibrationPoint {
  concentration: number;
  absorbance: number;
}

export interface UnknownSample {
  id: string;
  sampleId: string;
  response: number;
  calculatedConcentration: number | null;
}

export interface CalibrationCurveSession {
  id: number;
  title: string;
  concUnit: string;
  responseUnit: string;
  standards: CalibrationStandard[];
  unknowns: UnknownSample[];
  slope: number | null;
  intercept: number | null;
  rSquared: number | null;
  notes: string;
  projectId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CellPoint {
  id: string;
  x: number;
  y: number;
  isAuto: boolean;
}

export interface CellCountSession {
  id: number;
  sampleName: string;
  imageUri: string;
  totalCells: number;
  autoDetectedCount: number;
  manuallyAddedCount: number;
  manuallyRemovedCount: number;
  sampleVolumeUl?: number | null;
  dilutionFactor?: number | null;
  calculatedConcentrationCellsPerMl?: number | null;
  points: CellPoint[];
  notes: string;
  projectId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface BloodCellPoint {
  id: string;
  x: number;
  y: number;
  type: 'RBC' | 'WBC' | 'PLATELET';
}

export interface BloodCellCountSession {
  id: number;
  sampleId: string;
  imageUri: string;
  rbcCount: number;
  wbcCount: number;
  plateletCount: number;
  points: BloodCellPoint[];
  notes: string;
  projectId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CellCultureRecord {
  id: number;
  cellLine: string;
  experiment: string;
  passageNumber: number;
  date: number; // timestamp
  vessel: string; // e.g., T75 Flask, 6-well plate
  medium: string;
  seedingDensity: string;
  confluencyPercent: number;
  incubationConditions: string; // e.g. 37°C, 5% CO2
  observations: string;
  notes: string;
  projectId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CustomCounterCategory {
  id: string;
  name: string;
  count: number;
  color: string;
}

export interface CustomCounterSession {
  id: number;
  name: string;
  categories: CustomCounterCategory[];
  notes: string;
  projectId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface SearchResultItem {
  type: 'project' | 'step' | 'recipe' | 'note' | 'timer' | 'tool_analysis' | 'protocol' | 'activity';
  id: number | string;
  title: string;
  subtitle: string;
  projectId?: number;
  toolId?: CalculatorType;
}

// ==========================================
// PHASE 3 DATA MODELS & TYPES
// ==========================================

export type UserRole = 'Student' | 'Researcher' | 'Lab Technician' | 'Teacher' | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  institution: string;
  role: UserRole;
  preferredField: string;
  timezone: string;
  defaultUnits: {
    volume: 'µL' | 'mL' | 'L';
    concentration: 'M' | 'mM' | 'µM';
  };
  isCloudSyncEnabled: boolean;
  allowAiCloudProcessing: boolean;
  isAuthenticated: boolean;
}

export type SyncStatus = 'SYNCED' | 'SYNCING' | 'OFFLINE' | 'SYNC_FAILED';

export interface SyncConflict {
  id: string;
  entityType: 'project' | 'protocol' | 'step' | 'recipe' | 'note';
  entityId: number;
  entityName: string;
  localVersion: any;
  cloudVersion: any;
  localTimestamp: number;
  cloudTimestamp: number;
}

export interface ProtocolMaterial {
  id: string;
  name: string;
  amount?: string;
  concentration?: string;
  unit?: string;
  sourceLocation?: string;
}

export interface ExtractedProtocol {
  title: string;
  objective: string;
  category: string;
  tags?: string[];
  materials: ProtocolMaterial[];
  equipment: string[];
  reagents: string[];
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    durationMinutes?: number | null;
    timeMinutes?: number | null;
    groupName?: string;
    temperature?: string;
    centrifugationSpeed?: string;
    centrifugation?: string;
    pH?: string;
    safetyNotes?: string;
    notes?: string;
  }[];
  missingParameters: string[];
  timerSuggestions?: {
    stepIndex: number;
    name: string;
    durationMinutes: number;
  }[];
}

export interface SavedProtocol {
  id: number;
  title: string;
  objective: string;
  category: string;
  tags: string[];
  materials: ProtocolMaterial[];
  equipment: string[];
  reagents: string[];
  steps: ProtocolStep[];
  isFavorite: boolean;
  isAiGenerated: boolean;
  author: string;
  createdAt: number;
  updatedAt: number;
}

export type SharePermission = 'VIEWER' | 'EDITOR';

export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: SharePermission;
}

export interface SharedProjectConfig {
  projectId: number;
  accessType: 'PRIVATE' | 'LINK' | 'SPECIFIC_USERS';
  members: ProjectMember[];
  shareLink?: string;
}

export interface ActivityLogEntry {
  id: string;
  projectId?: number | null;
  userName: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface AiChatMessage {
  id: string;
  sender?: 'user' | 'ai' | 'assistant';
  role?: 'user' | 'assistant' | 'ai';
  text?: string;
  content?: string;
  type?: 'EXPLANATION' | 'CALCULATION' | 'SOURCE_INFO' | 'AI_SUGGESTION';
  timestamp: number;
  sourcesUsed?: string[];
}

export interface AiConversation {
  id: string;
  title: string;
  projectId?: number | null;
  messages: AiChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface LabCalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  projectId?: number | null;
  protocolTitle?: string;
  notes?: string;
  type: 'EXPERIMENT' | 'REMINDER' | 'DEADLINE';
}

export interface LabNotification {
  id: string;
  title: string;
  message: string;
  type: 'TIMER' | 'REMINDER' | 'SYNC' | 'SHARE' | 'REPORT';
  timestamp: number;
  isRead: boolean;
}

export interface LabReportConfig {
  projectId: number;
  template: 'LAB_EXPERIMENT' | 'MICROBIOLOGY' | 'MOLECULAR_BIO' | 'RESEARCH' | 'GENERAL';
  includeSections: {
    cover: boolean;
    objective: boolean;
    materials: boolean;
    protocolSteps: boolean;
    notes: boolean;
    results: boolean;
    tables: boolean;
    images: boolean;
    graphs: boolean;
    calculations: boolean;
  };
  customConclusion: string;
  authorName: string;
}

// ==========================================
// PHASE 4 DATA MODELS: FOOD SAFETY INTELLIGENCE
// ==========================================

export type FoodSampleStatus =
  | 'Received'
  | 'Registered'
  | 'Testing Planned'
  | 'Testing in Progress'
  | 'Awaiting Confirmation'
  | 'Completed'
  | 'Reported'
  | 'Archived';

export interface FoodRiskFactors {
  isReadyToEat?: boolean;
  isRaw?: boolean;
  isCooked?: boolean;
  isRefrigerated?: boolean;
  isFrozen?: boolean;
  isVacuumPackaged?: boolean;
  isCanned?: boolean;
  isLowAcid?: boolean;
  isHighMoisture?: boolean;
  containsDairy?: boolean;
  containsSeafood?: boolean;
  containsMeat?: boolean;
  containsEggs?: boolean;
  wasHeatProcessed?: boolean;
  wasFermented?: boolean;
  requiresRefrigeration?: boolean;
  [key: string]: boolean | undefined;
}

export interface FoodSample {
  id: string; // e.g. "MTK-FOOD-2026-0001"
  sampleName: string;
  foodCategory: string; // Dairy, Meat, Poultry, Seafood, Rice, etc.
  productType: string; // e.g. "Frozen Raw Paste", "Whole Pasteurized Milk"
  processingStatus: string;
  packagingType: string;
  storageCondition: string;
  isReadyToEat: boolean;
  isRawOrProcessed: 'RAW' | 'PROCESSED';
  sampleSource: string;
  collectionDate: string;
  lotBatchNumber: string;
  notes: string;
  status: FoodSampleStatus;
  receivedBy: string;
  receivedDate: string;
  riskFactors: FoodRiskFactors;
  projectId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface SuspectedOrganism {
  id: string;
  organism: string;
  commonFoodAssociations: string[];
  foodCategories: string[];
  hazardCategory: 'Pathogen' | 'Indicator' | 'Spoilage' | 'Toxin Producer';
  whyRelevant: string;
  recommendedDetection: string;
  recommendedConfirmation: string;
  referenceMethod: string;
  notes: string;
  limitations: string;
}

export interface MediaReference {
  id: string;
  mediumName: string;
  abbreviation: string;
  purpose: string;
  targetGroup: string;
  differentialCharacteristics: string;
  selectiveCharacteristics: string;
  relevantTestCategory: string;
  reference: string;
  limitations: string;
}

export interface MyLabResource {
  id: string;
  category: 'MEDIA' | 'EQUIPMENT' | 'KITS' | 'MOLECULAR' | 'OTHER';
  name: string;
  isAvailable: boolean;
  notes?: string;
}

export type FoodResultType =
  | 'Positive'
  | 'Negative'
  | 'Not Detected'
  | 'Detected'
  | 'Presumptive Positive'
  | 'Presumptive Negative'
  | 'Quantitative'
  | 'Qualitative'
  | 'Inconclusive';

export interface FoodTestPlanItem {
  id: string;
  sampleId: string;
  targetOrganism: string;
  testCategory: string; // Aerobic Plate Count, Coliform / indicator, Salmonella, Listeria, etc.
  testType: 'Enumeration' | 'Screening' | 'Detection' | 'Confirmation' | 'Identification';
  purpose: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Requires Confirmation';
  referenceMethod: string;
  confirmationRequired: boolean;
  resourceAvailable: boolean;
  result?: FoodResultType;
  resultValue?: string;
  resultUnits?: string;
  analyst?: string;
  testDate?: string;
  notes?: string;
  associatedColonyCountId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface ChainOfCustodyRecord {
  id: string;
  sampleId: string;
  receivedBy: string;
  dateTime: string;
  condition: string;
  storageStatus: string;
  transferredBy: string;
  transferredTo: string;
  notes: string;
  timestamp: number;
}

export interface TestingChecklistItem {
  id: string;
  sampleId: string;
  title: string;
  isCompleted: boolean;
  category?: string;
}

export interface ReferenceKnowledgeEntry {
  id: string;
  referenceName: string;
  methodIdentifier: string;
  versionDate: string;
  source: 'FDA BAM' | 'ISO' | 'Codex' | 'AOAC' | 'National Standard' | 'Other';
  verificationStatus: 'Verified' | 'Needs Review' | 'Unavailable';
  lastVerifiedDate: string;
  notes: string;
}


