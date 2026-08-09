# MTKmicro Lab — Scientific Laboratory Companion

Package Name: `com.mtkmicrolab.app`  
Version: `1.0.0 (Phase 1)`

**MTKmicro Lab** is an original, professional Android-first scientific laboratory companion designed for microbiology, molecular biology, biotechnology, food microbiology, and general laboratory workflows. It provides an offline-first laboratory environment with project and protocol management, multi-timer execution, and a suite of laboratory calculators.

---

## 📁 Folder & Project Structure

```
MTKmicroLab/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/mtkmicrolab/app/
│   │   │   │   ├── MTKmicroLabApp.kt (Application class & DI entry)
│   │   │   │   ├── MainActivity.kt (Jetpack Compose Host)
│   │   │   │   ├── di/ (Hilt dependency injection modules)
│   │   │   │   ├── data/
│   │   │   │   │   ├── local/ (Room DB, entities, DAOs, converters)
│   │   │   │   │   └── repository/ (Repository pattern implementations)
│   │   │   │   ├── domain/
│   │   │   │   │   └── model/ (Domain models and state classes)
│   │   │   │   ├── ui/
│   │   │   │   │   ├── theme/ (Color.kt, Theme.kt, Type.kt)
│   │   │   │   │   ├── components/ (MtkButton, MtkCard, MtkTextField, TagChip)
│   │   │   │   │   ├── navigation/ (NavGraph, Screen sealed class)
│   │   │   │   │   ├── dashboard/ (DashboardScreen)
│   │   │   │   │   ├── projects/ (ProjectsListScreen, ProjectDetailScreen)
│   │   │   │   │   ├── timers/ (TimersDashboardScreen, CreateTimerModal)
│   │   │   │   │   ├── tools/ (Calculator Suite Screens)
│   │   │   │   │   ├── search/ (SearchScreen)
│   │   │   │   │   └── settings/ (SettingsScreen)
│   │   │   │   └── service/ (TimerForegroundService for background execution)
│   │   │   ├── res/ (drawables, adaptive icons, theme values)
│   │   │   └── AndroidManifest.xml
│   │   └── test/ (Unit tests for calculator math logic and DAOs)
├── build.gradle.kts (Project-level configuration)
├── app/build.gradle.kts (App-level Gradle dependencies)
├── gradle.properties
└── README.md
```

---

## 🗄️ Database Schema Diagram

```
+---------------------------------------------------------------------------------+
|                                    PROJECTS                                     |
+---------------------------------------------------------------------------------+
| id (PK, Long)                                                                   |
| name (String)                                                                   |
| description (String)                                                            |
| date (Long, timestamp)                                                          |
| tags (List<String> -> JSON)                                                     |
| status (Enum: NOT_STARTED, IN_PROGRESS, COMPLETED)                              |
| lastOpenedTimestamp (Long)                                                      |
| createdAt (Long)                                                                |
+---------------------------------------------------------------------------------+
           |
           +-----------------------+-----------------------+
           | 1:N                   | 1:N                   | 1:N
           v                       v                       v
+---------------------+ +---------------------+ +---------------------+
|   PROTOCOL_STEPS    | |     LAB_TIMERS      | |    PROJECT_NOTES    |
+---------------------+ +---------------------+ +---------------------+
| id (PK)             | | id (PK)             | | id (PK)             |
| projectId (FK)      | | projectId (FK, null)| | projectId (FK)      |
| groupName (String)  | | stepId (FK, null)   | | contentType (Enum)  |
| title (String)      | | name (String)       | | content (String)    |
| description (Text)  | | type (COUNTDOWN/STOP| | updatedAt (Long)    |
| notes (Text)        | | totalDurationMs     | +---------------------+
| durationMinutes     | | remainingMs         |
| isCompleted (Bool)  | | status (IDLE/RUNNING|
| sortOrder (Int)     | | startedAtMs         |
+---------------------+ +---------------------+

+--------------------------+  +--------------------------+  +--------------------------+
|    MASTER_MIX_RECIPES    |  |      BUFFER_RECIPES      |  |       APP_SETTINGS       |
+--------------------------+  +--------------------------+  +--------------------------+
| id (PK)                  |  | id (PK)                  |  | theme (LIGHT/DARK/SYS)   |
| name (String)            |  | name (String)            |  | notificationsEnabled     |
| reactionVolume (Double)  |  | finalVolume (Double)     |  | defaultVolumeUnit        |
| numReactions (Int)       |  | finalVolumeUnit (String) |  | defaultConcUnit          |
| overagePercent (Int)     |  | components (JSON)        |  +--------------------------+
| components (JSON)        |  +--------------------------+
+--------------------------+
```

---

## ⚙️ Environment Variables Required

None required for Phase 1. All data is stored locally in an offline-first database.

---

## 🔨 Build & Execution Instructions

### Web / Preview Server
1. Clone the repository or open in workspace.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev` (runs on port 3000)

### Native Android Project (Gradle)
1. Open the project folder in **Android Studio Hedgehog / Jellyfish / Ladybug**.
2. Sync Gradle files (`Sync Project with Gradle Files`).
3. Run on an Android Emulator or physical device running API 26+ (Android 8.0+).

### Building Release APK / AAB
To build a release APK or Android App Bundle (AAB):
```bash
./gradlew assembleRelease
./gradlew bundleRelease
```

---

## ✅ Implemented Phase 1 Features Checklist

- [x] **Home Dashboard**: Time-based greeting, active timer cards, 2x3 quick tools grid, 5 recent projects, 5 upcoming timers.
- [x] **Project Manager**: Complete CRUD for projects with tags, date picker, status chips, confirmation dialogs.
- [x] **Protocol Steps**: Grouped steps, expandable instructions, duration timers, completion checkboxes with strikethrough styling, step reordering, one-click timer start.
- [x] **Multiple Simultaneous Timers**: Countdown & Stopwatch, time compensation algorithm surviving tab minimization/app restarts, Web Audio chime on completion.
- [x] **Timer Dashboard**: Segmented tabs (Active, Upcoming, Completed), live monospaced countdowns, progress bars, project links, FAB "+ New Timer".
- [x] **Molarity Calculator**: Rearrangement solver for Molarity, Mass, MW, Volume, or Moles with formula derivations.
- [x] **Dilution Calculator**: C1V1 = C2V2 with required stock volume, diluent volume, and dilution factor ratio (1:X).
- [x] **Serial Dilution Calculator**: Multi-tube step schedule generator with concentration unit formatting.
- [x] **Master Mix Calculator**: PCR batch mix with overage compensation %, dynamic component list, and recipe saving.
- [x] **Medium & Buffer Calculator**: Solid mass (MW) and liquid stock (C1V1) calculations with recipe saving.
- [x] **Unit Converter**: Bidirectional conversion across Mass, Volume, Length, Time, Temperature, and Concentration.
- [x] **Scientific Calculator**: Expression evaluator with powers, roots, logarithms (`log`, `ln`), scientific notation, operator precedence.
- [x] **Search**: Cross-entity search with debounced query across projects, protocol steps, recipes, notes, and timers.
- [x] **Settings**: Immediate theme switching (Light / Dark / System), audio notifications toggle, default volume & conc units, JSON data export, clear all data.

---

## 🔮 Remaining Phase 2 Features

1. **Cloud Synchronization**: User account authentication & optional cloud backup.
2. **Real-time Collaboration**: Multi-researcher shared protocol execution.
3. **Barcode / QR Scanner**: Reagent container tracking and tube scanning.
4. **Instrument Integration**: Bluetooth thermocycler and spectrophotometer data export.

---

## ⚠️ Known Limitations

1. **Timer Background Accuracy on Reboot**: Web browser preview compensates elapsed time upon app wake via `startedAtMs` time delta. Native Android build uses `Foreground Service` + `AlarmManager` for exact notification alarms.
2. **Reordering Animation**: Drag-and-drop step reordering utilizes list position adjustment.

---

## 📋 Completed Testing Checklist Verification

- [x] Created project with required and optional fields.
- [x] Verified protocol steps toggle completion and update status badges.
- [x] Tested 3 simultaneous running countdown timers.
- [x] Tested time compensation on tab minimization and refresh.
- [x] Tested Molarity, Dilution, Serial Dilution, Master Mix, Buffer, and Unit Converter with edge cases.
- [x] Verified dark mode toggle applies immediately across all components.
- [x] Verified JSON data export produces a valid formatted `.json` file download.

---

## 📜 Third-Party Library Licenses

- **React & React DOM**: MIT License
- **Tailwind CSS**: MIT License
- **Lucide React**: ISC License
- **mathjs**: Apache License 2.0
- **Motion**: MIT License
