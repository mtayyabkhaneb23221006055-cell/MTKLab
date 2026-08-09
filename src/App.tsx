import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AndroidHeader } from './components/common/AndroidHeader';
import { AndroidBottomNav } from './components/common/AndroidBottomNav';

// Screens
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { ProjectsListScreen } from './components/projects/ProjectsListScreen';
import { ProjectDetailScreen } from './components/projects/ProjectDetailScreen';
import { TimersDashboardScreen } from './components/timers/TimersDashboardScreen';
import { ToolsGridScreen } from './components/tools/ToolsGridScreen';
import { MolarityCalculatorScreen } from './components/tools/MolarityCalculatorScreen';
import { DilutionCalculatorScreen } from './components/tools/DilutionCalculatorScreen';
import { SerialDilutionScreen } from './components/tools/SerialDilutionScreen';
import { MasterMixCalculatorScreen } from './components/tools/MasterMixCalculatorScreen';
import { BufferCalculatorScreen } from './components/tools/BufferCalculatorScreen';
import { UnitConverterScreen } from './components/tools/UnitConverterScreen';
import { ScientificCalculatorScreen } from './components/tools/ScientificCalculatorScreen';
import { ColonyCounterScreen } from './components/tools/ColonyCounterScreen';
import { PlateLabellingScreen } from './components/tools/PlateLabellingScreen';
import { ImageMeasurerScreen } from './components/tools/ImageMeasurerScreen';
import { GelAnnotatorScreen } from './components/tools/GelAnnotatorScreen';
import { CalibrationCurveScreen } from './components/tools/CalibrationCurveScreen';
import { CustomCounterScreen } from './components/tools/CustomCounterScreen';
import { CellCounterScreen } from './components/tools/CellCounterScreen';
import { BloodCellCounterScreen } from './components/tools/BloodCellCounterScreen';
import { CellCultureTrackerScreen } from './components/tools/CellCultureTrackerScreen';
import { SearchScreen } from './components/search/SearchScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { ProtocolScannerScreen } from './components/ai/ProtocolScannerScreen';
import { AiAssistantScreen } from './components/ai/AiAssistantScreen';
import { ProtocolLibraryScreen } from './components/protocols/ProtocolLibraryScreen';
import { ReportGeneratorScreen } from './components/reports/ReportGeneratorScreen';
import { CalendarScreen } from './components/calendar/CalendarScreen';
import { PrivacyCenterScreen } from './components/privacy/PrivacyCenterScreen';
import { BackupRestoreScreen } from './components/backup/BackupRestoreScreen';
import { FoodSafetyScreen } from './components/foodSafety/FoodSafetyScreen';
import { EquipmentSopScreen } from './components/tools/EquipmentSopScreen';

const MainLayout: React.FC = () => {
  const { route } = useApp();

  const renderContent = () => {
    switch (route.type) {
      case 'HOME':
        return <DashboardScreen />;
      case 'PROJECTS':
      case 'CREATE_PROJECT':
        return <ProjectsListScreen />;
      case 'PROJECT_DETAIL':
      case 'EDIT_PROJECT':
        return <ProjectDetailScreen />;
      case 'TOOLS':
        return <ToolsGridScreen />;
      case 'AUTH':
        return <AuthScreen />;
      case 'AI_SCANNER':
        return <ProtocolScannerScreen />;
      case 'AI_ASSISTANT':
        return <AiAssistantScreen />;
      case 'PROTOCOL_LIBRARY':
        return <ProtocolLibraryScreen />;
      case 'REPORTS':
        return <ReportGeneratorScreen />;
      case 'CALENDAR':
        return <CalendarScreen />;
      case 'PRIVACY_CENTER':
        return <PrivacyCenterScreen />;
      case 'BACKUP':
        return <BackupRestoreScreen />;
      case 'FOOD_SAFETY':
        return <FoodSafetyScreen />;
      case 'CALCULATOR':
        switch (route.toolId) {
          case 'equipment_sop':
            return <EquipmentSopScreen />;
          case 'food_safety_analyzer':
            return <FoodSafetyScreen />;
          case 'colony_counter':
            return <ColonyCounterScreen />;
          case 'plate_labelling':
            return <PlateLabellingScreen />;
          case 'image_measurer':
            return <ImageMeasurerScreen />;
          case 'gel_annotator':
            return <GelAnnotatorScreen />;
          case 'calibration_curve':
            return <CalibrationCurveScreen />;
          case 'custom_counter':
            return <CustomCounterScreen />;
          case 'cell_counter':
            return <CellCounterScreen />;
          case 'blood_cell_counter':
            return <BloodCellCounterScreen />;
          case 'cell_culture_tracker':
            return <CellCultureTrackerScreen />;
          case 'molarity':
            return <MolarityCalculatorScreen />;
          case 'dilution':
            return <DilutionCalculatorScreen />;
          case 'serial_dilution':
            return <SerialDilutionScreen />;
          case 'master_mix':
            return <MasterMixCalculatorScreen />;
          case 'buffer':
            return <BufferCalculatorScreen />;
          case 'unit_converter':
            return <UnitConverterScreen />;
          case 'scientific':
            return <ScientificCalculatorScreen />;
          default:
            return <ToolsGridScreen />;
        }
      case 'TIMERS':
        return <TimersDashboardScreen initialTab={route.tab || 'ACTIVE'} />;
      case 'SEARCH':
        return <SearchScreen />;
      case 'SETTINGS':
      case 'ABOUT':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col items-center antialiased selection:bg-teal-500 selection:text-white">
      {/* Responsive Frame Container */}
      <div className="w-full max-w-2xl min-h-screen bg-white dark:bg-[#121215] shadow-2xl flex flex-col border-x border-slate-200/80 dark:border-white/10">
        {/* Top Header */}
        <AndroidHeader />

        {/* Scrollable Screen Content */}
        <main className="flex-1 px-4 pt-4 overflow-y-auto">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <AndroidBottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
