import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MtkCard } from '../common/MtkCard';
import {
  Wrench,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Sparkles,
  FileText,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Download,
  Plus,
  Trash2,
  Bookmark,
  Check,
  Layers,
  Activity,
  Cpu,
  Info
} from 'lucide-react';

export interface EquipmentProtocol {
  id: string;
  name: string;
  category: string;
  isoStandard: string;
  calibrationFrequency: string;
  validityCheckFrequency: string;
  ppeRequired: string[];
  
  // Section 1: SOP / How to Use
  operatingInstructions: {
    preChecks: string[];
    steps: string[];
    postCheckShutdown: string[];
    safetyNotes: string[];
  };

  // Section 2: Method of Calibration
  calibrationMethod: {
    standardsRequired: string[];
    environmentalConditions: string;
    procedure: string[];
    acceptanceCriteria: string;
    toleranceLimits: string;
  };

  // Section 3: Method to Check Validity
  validityMethod: {
    dailyCheckProcedure: string[];
    referenceControls: string;
    passFailThresholds: string;
    oosActionPlan: string[];
  };
}

// Built-in comprehensive lab equipment database
const PRESET_EQUIPMENT: EquipmentProtocol[] = [
  {
    id: 'autoclave',
    name: 'Autoclave / Steam Sterilizer',
    category: 'Sterilization & Biosafety',
    isoStandard: 'ISO 17665-1 / EN 285',
    calibrationFrequency: 'Bi-annually or Annually',
    validityCheckFrequency: 'Every load / Daily (Chemical & Biological)',
    ppeRequired: ['Heat-resistant gloves', 'Lab coat', 'Face shield', 'Closed-toe shoes'],
    operatingInstructions: {
      preChecks: [
        'Inspect chamber drain for debris or blockage.',
        'Check water reservoir level and verify use of deionized/distilled water only.',
        'Check door gasket integrity and seal cleanliness.'
      ],
      steps: [
        'Load materials ensuring space between items for steam circulation; never overload.',
        'Place autoclave tape / chemical indicator strip inside and on outside of packs.',
        'Close and securely lock chamber door.',
        'Select appropriate cycle (e.g., 121°C at 15 psi / 103 kPa for 15–20 minutes for liquids/media).',
        'Start cycle and monitor temperature and pressure rise.'
      ],
      postCheckShutdown: [
        'Wait until pressure returns to 0 psi and temperature drops below 80°C before opening.',
        'Crack door open slightly using heat-resistant gloves to release remaining steam.',
        'Allow items to cool inside for 10–15 minutes before removing.',
        'Verify change in chemical indicator tape (turns black/striped).'
      ],
      safetyNotes: [
        'DANGER: High pressure and hot steam can cause severe burns.',
        'Never sterilize sealed containers or flammable solvents.'
      ]
    },
    calibrationMethod: {
      standardsRequired: ['NIST-calibrated temperature data loggers', 'Calibrated master pressure gauge'],
      environmentalConditions: 'Ambient temperature 18–25°C, humidity < 75%',
      procedure: [
        'Place 3–5 wireless calibrated temperature probes throughout empty chamber (top, middle, bottom drain).',
        'Run standard 121°C sterilization cycle for 30 minutes.',
        'Record temperature and pressure data points every 10 seconds during exposure phase.',
        'Compare sensor readings with chamber digital display and chart record.',
        'Adjust temperature controller offset if deviation exceeds ±0.5°C.'
      ],
      acceptanceCriteria: 'Temperature maintained between 121.0°C and 123.0°C across all probes for entire hold phase.',
      toleranceLimits: 'Temperature deviation ≤ ±0.5°C; Pressure deviation ≤ ±1.0 psi.'
    },
    validityMethod: {
      dailyCheckProcedure: [
        'Run daily Bowie-Dick air-removal test for vacuum autoclaves.',
        'Include Class 5/6 chemical integrator strip in every run.',
        'Weekly / Monthly: Place Geobacillus stearothermophilus spore strip (10^6 spores) in hardest-to-sterilize load location.',
        'Incubate processed spore strip at 55–60°C for 24–48 hours along with an unautoclaved control strip.'
      ],
      referenceControls: 'Geobacillus stearothermophilus ATCC 7953 spore vials / strips',
      passFailThresholds: 'Chemical tape: Full color change. Spore test: Processed strip remains purple (no growth); Control strip turns yellow (growth).',
      oosActionPlan: [
        'If spore strip shows growth or chemical indicator fails: Quarantine all loads processed since last passed test.',
        'Do NOT use autoclave; affix "OUT OF SERVICE" tag immediately.',
        'Clean drain filter, re-verify steam pressure, and repeat biological test.',
        'If failure persists, contact certified service engineer.'
      ]
    }
  },
  {
    id: 'ph_meter',
    name: 'Digital pH Meter & Electrode',
    category: 'Analytical Measurement',
    isoStandard: 'USP <791> / ISO 10523',
    calibrationFrequency: 'Daily or Before Each Testing Shift',
    validityCheckFrequency: 'Every 10 samples or Before Use',
    ppeRequired: ['Safety goggles', 'Lab coat', 'Nitrile gloves'],
    operatingInstructions: {
      preChecks: [
        'Inspect glass bulb for cracks, air bubbles, or salt deposits.',
        'Ensure electrode storage solution (3M KCl) is present and junction is unclogged.',
        'Check temperature sensor connection and ATC setting.'
      ],
      steps: [
        'Rinse electrode with deionized/distilled water and gently blot dry with lint-free tissue (do not rub glass bulb).',
        'Immerse electrode into sample solution completely covering glass bulb and reference junction.',
        'Swirl gently and allow reading to stabilize (wait for stability icon on display).',
        'Record pH value and sample temperature.'
      ],
      postCheckShutdown: [
        'Rinse electrode thoroughly with deionized water.',
        'Store electrode upright in 3M KCl electrode storage solution (never store in DI water).',
        'Turn off meter and cap electrode storage sleeve.'
      ],
      safetyNotes: [
        'Avoid rubbing electrode bulb as static charge causes erratic readings.',
        'Handle acid/base buffer solutions with care.'
      ]
    },
    calibrationMethod: {
      standardsRequired: ['NIST Traceable Certified pH Buffers (pH 4.01, 7.00, 10.01 @ 25°C)'],
      environmentalConditions: 'Temperature controlled 20–25°C with ATC probe enabled',
      procedure: [
        'Select 2-point or 3-point calibration mode on pH meter.',
        'Rinse probe with DI water, immerse in pH 7.00 buffer first (zero point), wait for stability and confirm.',
        'Rinse probe, immerse in pH 4.01 buffer (acidic slope), wait for stability and confirm.',
        'Rinse probe, immerse in pH 10.01 buffer (alkaline slope), wait for stability and confirm.',
        'Meter will calculate and display slope percentage.'
      ],
      acceptanceCriteria: 'Electrode slope must be between 95.0% and 105.0% (56.2 to 62.1 mV/pH at 25°C).',
      toleranceLimits: 'Calibration offset at pH 7.00 ≤ ±30 mV; Slope 95–105%.'
    },
    validityMethod: {
      dailyCheckProcedure: [
        'After calibration, measure an independent QC check buffer (e.g., pH 7.00 or 6.86) from a different lot.',
        'Verify temperature compensation function by checking buffer reading at ambient vs chilled temp.'
      ],
      referenceControls: 'NIST Traceable Secondary Standard Buffer pH 7.00 / 4.01',
      passFailThresholds: 'QC Check Buffer reading must be within ±0.05 pH units of stated value.',
      oosActionPlan: [
        'If reading is out of range: Soak electrode in 0.1M HCl for 15 mins or pepsin solution if contaminated with proteins.',
        'Refill internal electrolyte reference solution if refillable.',
        'Recalibrate with fresh buffers. Replace electrode if slope remains < 92%.'
      ]
    }
  },
  {
    id: 'spectrophotometer',
    name: 'UV-Vis Spectrophotometer',
    category: 'Optical Measurement',
    isoStandard: 'ISO 17025 / USP <857>',
    calibrationFrequency: 'Annually by certified technician; Monthly wavelength check',
    validityCheckFrequency: 'Daily / Before baseline measurement',
    ppeRequired: ['Safety glasses', 'Lab coat', 'Powder-free gloves'],
    operatingInstructions: {
      preChecks: [
        'Check lamp hours and warm up unit for 15–30 minutes prior to use.',
        'Inspect sample compartment for spills or dust.',
        'Verify clean quartz cuvettes (for UV < 340 nm) or optical glass/plastic cuvettes (for Vis).'
      ],
      steps: [
        'Set desired wavelength (nm) or spectral scan range.',
        'Insert blank cuvette filled with solvent/buffer facing optical path.',
        'Press "ZERO" or "BLANK" to set 0.000 Absorbance (100% Transmittance).',
        'Replace blank with sample cuvette and record Absorbance / Concentration.'
      ],
      postCheckShutdown: [
        'Remove cuvettes immediately; clean cuvettes with suitable solvent, rinse with DI water & ethanol.',
        'Close sample compartment cover.',
        'Turn off lamp/instrument power.'
      ],
      safetyNotes: [
        'Do not touch optical clear faces of cuvettes with bare hands.',
        'Avoid UV light exposure to eyes when compartment is open during service.'
      ]
    },
    calibrationMethod: {
      standardsRequired: ['Holmium Oxide Filter / Solution (Wavelength)', 'Potassium Dichromate NIST SRM 935a (Absorbance)', 'Stray Light Filter (NaI / NaNO2)'],
      environmentalConditions: 'Temperature 20–25°C, stable vibration-free bench, shielded from direct sunlight',
      procedure: [
        'Wavelength Accuracy: Scan Holmium Oxide glass filter across 240–650 nm. Verify peak wavelengths (241.5, 279.3, 360.8, 453.4, 536.4 nm).',
        'Photometric Accuracy: Measure absorbance of Potassium Dichromate standards at 235, 257, 313, and 350 nm.',
        'Photometric Noise/Drift: Record 0.000 Abs over 15 minutes at 500 nm.',
        'Stray Light Check: Measure 10g/L NaI solution at 220 nm (Absorbance should be > 2.0).'
      ],
      acceptanceCriteria: 'Wavelength Accuracy: ±1.0 nm; Photometric Accuracy: ±0.005 Abs at 1.0 Abs.',
      toleranceLimits: 'Wavelength error ≤ ±1 nm; Absorbance error ≤ ±0.5%; Stray light < 0.05% T.'
    },
    validityMethod: {
      dailyCheckProcedure: [
        'Perform auto-zero blank check with DI water / buffer.',
        'Verify baseline stability: Run a blank scan across operational range (should stay 0.000 ± 0.002 Abs).'
      ],
      referenceControls: 'Calibrated Sealed Glass Reference Filter or freshly prepared Potassium Dichromate standard',
      passFailThresholds: 'Baseline flatness ≤ ±0.003 Abs; QC Standard Absorbance within ±1.5% of expected value.',
      oosActionPlan: [
        'If baseline drifts or noise is high: Clean cuvette holder and optical window with lens paper.',
        'Check lamp energy status (Deuterium/Tungsten) and replace lamp if output is below threshold.',
        'Perform lamp alignment calibration.'
      ]
    }
  },
  {
    id: 'micropipette',
    name: 'Air-Displacement Micropipette',
    category: 'Volumetric Dispensing',
    isoStandard: 'ISO 8655-2 / ISO 8655-6',
    calibrationFrequency: 'Bi-annually or Annually (Gravimetric)',
    validityCheckFrequency: 'Monthly gravimetric check / Daily visual check',
    ppeRequired: ['Lab coat', 'Gloves'],
    operatingInstructions: {
      preChecks: [
        'Inspect pipette shaft for cracks, corrosion, or liquid contamination.',
        'Verify smooth plunger movement and secure tip attachment.'
      ],
      steps: [
        'Set desired volume within recommended operating range (10%–100% of nominal max).',
        'Attach fresh filter tip firmly with a light twisting motion.',
        'Depress plunger to first stop.',
        'Immerse tip vertically 2–3 mm into liquid.',
        'Release plunger smoothly and slowly to aspirate liquid; wait 1 second.',
        'Touch tip against tube wall and depress plunger to second stop to blow out liquid.'
      ],
      postCheckShutdown: [
        'Eject used tip into biohazard bio-waste container.',
        'Set pipette to maximum nominal volume when storing to relax internal spring.',
        'Store vertically on dedicated pipette carousel stand.'
      ],
      safetyNotes: [
        'Never lay pipette down horizontally when liquid is in the tip.',
        'Always use aerosol-barrier filter tips for infectious or PCR samples.'
      ]
    },
    calibrationMethod: {
      standardsRequired: ['Analytical Balance (0.01 mg resolution for <10µL; 0.1 mg for >10µL)', 'Deionized Water (Grade 3/1)', 'Calibrated Thermometer & Hygrometer'],
      environmentalConditions: 'Temperature 20°C ± 0.5°C, humidity > 50%, draught-free balance chamber',
      procedure: [
        'Pre-wet pipette tip 3–5 times with DI water.',
        'Dispense set volume of DI water into pre-weighed tared vessel on analytical balance.',
        'Record mass (mg) for 10 consecutive weighings at 10%, 50%, and 100% of max volume.',
        'Convert mass to volume using Z-factor calculation formula: Volume = Mass × Z (accounting for water density & temp).'
      ],
      acceptanceCriteria: 'ISO 8655 Limits: Systemic Error (Inaccuracy) ≤ ±0.8% to ±2.5%; Random Error (Imprecision / CV%) ≤ 0.3% to 1.5% depending on volume.',
      toleranceLimits: 'For 1000 µL: Inaccuracy ≤ ±0.8%, CV ≤ 0.3%; For 10 µL: Inaccuracy ≤ ±1.2%, CV ≤ 0.8%.'
    },
    validityMethod: {
      dailyCheckProcedure: [
        'Leak Test: Aspirate nominal volume of DI water, hold vertically for 20 seconds. Observe if drops fall from tip.',
        'Quick 5-point gravimetric spot check on analytical balance before critical PCR / ELISA assays.'
      ],
      referenceControls: 'Analytical balance with evaporation trap & DI water Z-factor table',
      passFailThresholds: 'Zero dripping during 20 sec leak test; 5-weighing average volume within ±1.5% of target.',
      oosActionPlan: [
        'If pipette drips or fails volume check: Replace internal O-ring and piston seal.',
        'Clean internal piston with isopropyl alcohol and apply manufacturer-approved silicone lubricant.',
        'Recalibrate using calibration tool key.'
      ]
    }
  },
  {
    id: 'microcentrifuge',
    name: 'Benchtop Microcentrifuge',
    category: 'Separation & Centrifugation',
    isoStandard: 'IEC 61010-2-020 / ISO 17025',
    calibrationFrequency: 'Annually (Speed/Tachometer & Timer)',
    validityCheckFrequency: 'Daily visual balance check & monthly tachometer check',
    ppeRequired: ['Lab coat', 'Safety glasses', 'Gloves'],
    operatingInstructions: {
      preChecks: [
        'Check rotor lid seal and verify rotor screw is tightened firmly.',
        'Inspect rotor chambers for cracks, corrosion, or salt residue.'
      ],
      steps: [
        'Load tubes symmetrically in opposing rotor positions with equal mass/volume (balance within ±0.05 g).',
        'Close and lock rotor lid securely.',
        'Close centrifuge main lid until lock engages.',
        'Set speed in RCF (x g) or RPM and set timer duration.',
        'Press START and observe until target speed is reached smoothly without excessive vibration or noise.'
      ],
      postCheckShutdown: [
        'Wait until rotor stops completely before unlocking lid.',
        'Remove samples carefully without disturbing pelleted material.',
        'Clean any accidental tube spills in rotor immediately with 70% ethanol.'
      ],
      safetyNotes: [
        'CRITICAL: NEVER run an unbalanced rotor. Severe rotor failure can cause catastrophic damage.',
        'Use aerosol-tight rotor lids when centrifuging pathogenic micro-organisms.'
      ]
    },
    calibrationMethod: {
      standardsRequired: ['NIST-traceable Optical Photo-Tachometer', 'Calibrated Digital Stopwatch'],
      environmentalConditions: 'Level bench, stable surface away from balance',
      procedure: [
        'Affix reflective tape target onto center of rotor lid.',
        'Set centrifuge to test speeds (e.g., 2,000, 5,000, 10,000, 14,000 RPM).',
        'Measure true RPM through transparent window using optical tachometer.',
        'Set timer to 5.0 minutes; measure duration using calibrated stopwatch from full speed start to stop trigger.'
      ],
      acceptanceCriteria: 'Speed Accuracy: within ±1.0% or ±50 RPM of set value. Timer Accuracy: within ±1.0% or ±2 seconds.',
      toleranceLimits: 'RPM deviation ≤ ±2%; Timer error ≤ ±1%.'
    },
    validityMethod: {
      dailyCheckProcedure: [
        'Inspect rubber motor mount vibration dampers.',
        'Run quick imbalance test at 2,000 RPM with empty rotor to ensure whisper-quiet smooth operation.'
      ],
      referenceControls: 'Balance scale for tube tare weight verification (equal to 0.01 g)',
      passFailThresholds: 'Rotor stops automatically if imbalance is detected; Zero excessive vibration or rattle.',
      oosActionPlan: [
        'If excessive vibration or noise occurs: Stop immediately; re-weigh tubes and balance accurately.',
        'If error code appears: Inspect motor brushes/bearing and contact service technician.'
      ]
    }
  },
  {
    id: 'biosafety_cabinet',
    name: 'Biosafety Cabinet Class II Type A2',
    category: 'Containment & Airflow',
    isoStandard: 'NSF/ANSI 49 / EN 12469',
    calibrationFrequency: 'Annually by certified HEPA/Airflow engineer',
    validityCheckFrequency: 'Daily (Magnehelic pressure gauge) & Monthly (UV intensity)',
    ppeRequired: ['Lab coat', 'Gloves', 'Sleeve covers', 'Eye protection'],
    operatingInstructions: {
      preChecks: [
        'Verify sash window is at designated operational height line (usually 8 or 10 inches).',
        'Check differential pressure gauge reading is within normal range.',
        'Turn on blower fan and purge cabinet for 5–10 minutes before starting work.'
      ],
      steps: [
        'Disinfect all interior surfaces with 70% Ethanol or appropriate disinfectant.',
        'Load required materials and place items at least 4 inches (10 cm) behind front intake grille.',
        'Separate clean materials (left) from dirty/waste items (right).',
        'Work smoothly without rapid arm movements that break air barrier curtain.'
      ],
      postCheckShutdown: [
        'Decontaminate all equipment and interior stainless steel surfaces with 70% EtOH.',
        'Purge cabinet for 5 minutes after work completion.',
        'Lower sash completely, turn off blower, and activate UV lamp for 15–30 mins if needed.'
      ],
      safetyNotes: [
        'NEVER obstruct front or rear air grilles.',
        'Do NOT use Bunsen burner inside BSC as thermal plume disrupts laminar airflow and risks HEPA filter damage.'
      ]
    },
    calibrationMethod: {
      standardsRequired: ['Thermal Anemometer (Inflow & Downflow)', 'PAO Aerosol Generator & Photometer (HEPA filter leak test)', 'Sound meter & Lux meter'],
      environmentalConditions: 'Draught-free room, closed doors, HVAC balanced',
      procedure: [
        'Inflow Airflow Velocity: Measure face velocity across front sash opening using anemometer grid. Average inflow must be ≥ 100 fpm (0.51 m/s).',
        'Downflow Airflow Velocity: Measure uniform downflow grid 4 inches above sash bottom. Average downflow 55–65 fpm (0.28–0.33 m/s).',
        'HEPA Filter Integrity Test: Challenge upstream HEPA with PAO aerosol; scan downstream face with photometer probe (leak threshold < 0.01%).',
        'Airflow Smoke Test: Confirm containment curtain at front sash using visible smoke tube.'
      ],
      acceptanceCriteria: 'Inflow 100 ± 10 fpm; Downflow uniformity within ±20% of mean; HEPA penetration < 0.01%.',
      toleranceLimits: 'HEPA leak threshold ≤ 0.01% of upstream aerosol concentration.'
    },
    validityMethod: {
      dailyCheckProcedure: [
        'Check differential pressure gauge (Magnehelic) prior to work start. Record reading in daily logbook.',
        'Verify sash height alarm functions when sash is raised above operational limit.'
      ],
      referenceControls: 'Calibrated Magnehelic pressure gauge marked with baseline green zone',
      passFailThresholds: 'Pressure gauge within ±10% of baseline certification value; Airflow alarm triggers when sash > height threshold.',
      oosActionPlan: [
        'If pressure drops or alarm sounds: Stop work immediately; seal open containers.',
        'Decontaminate cabinet interior; tag "OUT OF SERVICE".',
        'Contact certified biosafety field engineer to inspect blower or replace HEPA filter.'
      ]
    }
  },
  {
    id: 'analytical_balance',
    name: 'Precision / Analytical Balance',
    category: 'Mass Measurement',
    isoStandard: 'USP <41> / USP <1251> / ISO 9001',
    calibrationFrequency: 'Annually by ISO 17025 accredited laboratory',
    validityCheckFrequency: 'Daily or Before First Use (Internal/External Mass Check)',
    ppeRequired: ['Lab coat', 'Gloves', 'Spatula'],
    operatingInstructions: {
      preChecks: [
        'Verify spirit level bubble is centered inside target circle.',
        'Ensure draft shield glass doors are clean and fully closed.',
        'Check display shows 0.0000 g (or zero) when pan is empty.'
      ],
      steps: [
        'Press "TARE" / "ZERO" with weighing vessel / paper on pan.',
        'Open draft door slightly, transfer substance onto vessel using clean spatula, and close door immediately.',
        'Wait for stability indicator (o) to appear on screen before recording weight.',
        'Clean any powder residue from draft chamber using soft brush.'
      ],
      postCheckShutdown: [
        'Close all glass doors.',
        'Leave balance powered on (standby mode) to maintain internal electronic thermal equilibrium.'
      ],
      safetyNotes: [
        'Never spill corrosive reagents on stainless steel weighing pan.',
        'Avoid static electricity generation (use anti-static ionizer for fine powders).'
      ]
    },
    calibrationMethod: {
      standardsRequired: ['OIML Class E2 or F1 NIST Traceable Stainless Steel Calibration Weights (10g, 50g, 100g, 200g)'],
      environmentalConditions: 'Vibration-isolation table, temperature 20°C ± 1°C, no direct draft',
      procedure: [
        'Perform internal calibration (CalInt) routine if equipped.',
        'Linearity Test: Place Class E2 weights sequentially (e.g. 20g, 50g, 100g, 200g) and record readings.',
        'Repeatability Test: Measure a single 100g standard weight 10 times consecutively; calculate standard deviation (SD).',
        'Corner Load (Eccentricity) Test: Place 50g weight on center, front-left, front-right, back-left, back-right of pan.'
      ],
      acceptanceCriteria: 'USP <41> Repeatability: 2 × SD / minimum weight ≤ 0.10%. Linearity error ≤ ±0.2 mg.',
      toleranceLimits: 'Repeatability SD ≤ 0.0001 g; Linearity error ≤ ±0.0002 g.'
    },
    validityMethod: {
      dailyCheckProcedure: [
        'Perform daily single-point check using a dedicated Class F1/E2 100g or 10g check weight.',
        'Record weight value, date, temperature, and operator initials in balance log.'
      ],
      referenceControls: 'NIST Traceable Class F1 100.0000 g Check Weight kept in velvet-lined box',
      passFailThresholds: 'Recorded weight must fall within ±0.0005 g of certified mass.',
      oosActionPlan: [
        'If reading is outside tolerance: Clean pan and under-pan assembly with camel hair brush.',
        'Re-level balance using leveling feet.',
        'Run internal automatic calibration and re-test with check weight.'
      ]
    }
  },
  {
    id: 'thermal_cycler',
    name: 'Thermal Cycler (PCR Machine)',
    category: 'Molecular Diagnostics',
    isoStandard: 'MIQE Guidelines / ISO 20395',
    calibrationFrequency: 'Annually (Temperature & Ramp Rate Validation)',
    validityCheckFrequency: 'Monthly temperature check / Positive PCR control per run',
    ppeRequired: ['Lab coat', 'Gloves'],
    operatingInstructions: {
      preChecks: [
        'Inspect sample block for dust, oil, or cracked tube residue.',
        'Clean block wells with 70% isopropanol using cotton swabs if needed.',
        'Verify heated lid temperature reaches 105°C.'
      ],
      steps: [
        'Place thin-walled PCR tubes or plate firmly into block wells ensuring uniform contact.',
        'Close and lock heated lid lever securely.',
        'Select or program PCR thermal profile (Initial Denaturation, Cycling 25–40x: Denature, Anneal, Extend, Final Extension).',
        'Start run and monitor initial lid pre-heating phase.'
      ],
      postCheckShutdown: [
        'Remove PCR tubes/plate immediately after protocol completes.',
        'Clean block if condensation or sample leakage occurred.',
        'Turn off power or leave at standby 4°C hold.'
      ],
      safetyNotes: [
        'Heated lid reaches 105°C; do not touch lid surface during or immediately after operation.',
        'Always use matching tube wall thickness (0.2 mL vs 0.5 mL) for optimal thermal contact.'
      ]
    },
    calibrationMethod: {
      standardsRequired: ['96-well Temperature Probe Array / Calibrated Thermistor System', 'Calibrated Timer'],
      environmentalConditions: 'Room temp 20–25°C, rear fan exhaust unblocked (>10 cm clearance)',
      procedure: [
        'Insert 96-well thermistor calibration plate into sample block.',
        'Program validation protocol: 95°C hold for 2 min, 55°C hold for 2 min, 72°C hold for 2 min.',
        'Record temperature across 12 distributed well probes during holds.',
        'Measure heating and cooling ramp rates (°C/sec).'
      ],
      acceptanceCriteria: 'Temperature Accuracy: ±0.5°C of setpoint. Uniformity across wells: ≤ ±0.5°C.',
      toleranceLimits: 'Max well-to-well temperature variance ≤ 0.5°C at 55°C and 95°C.'
    },
    validityMethod: {
      dailyCheckProcedure: [
        'Include a No-Template Control (NTC) and Positive Control sample in every PCR assay run.',
        'Verify amplification curve or gel band intensity of positive control.'
      ],
      referenceControls: 'Standard Housekeeping Gene DNA control template & NTC water',
      passFailThresholds: 'NTC: Zero amplification / no band; Positive Control: Clean specific band at expected basepair length.',
      oosActionPlan: [
        'If positive control fails or NTC shows band: Check reagent master mix contamination.',
        'Run block temperature verification if amplification failure is widespread across outer wells.'
      ]
    }
  }
];

export const EquipmentSopScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentProtocol>(PRESET_EQUIPMENT[0]);
  const [activeTab, setActiveTab] = useState<'SOP' | 'CALIBRATION' | 'VALIDITY' | 'LOGGER'>('SOP');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [customProtocols, setCustomProtocols] = useState<EquipmentProtocol[]>([]);
  
  // Interactive Calibration Logger state
  const [logTechName, setLogTechName] = useState('');
  const [logStandardVal, setLogStandardVal] = useState('');
  const [logObservedVal, setLogObservedVal] = useState('');
  const [logPassFail, setLogPassFail] = useState<'PASS' | 'FAIL'>('PASS');
  const [logNotes, setLogNotes] = useState('');
  const [savedLogs, setSavedLogs] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('mtk_equipment_cal_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load custom saved equipment protocols from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mtk_custom_equipment_protocols');
      if (stored) {
        setCustomProtocols(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const allEquipment = [...PRESET_EQUIPMENT, ...customProtocols];

  const filteredList = allEquipment.filter(eq =>
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.isoStandard.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle AI Search / Deep Generation for Custom Equipment
  const handleAiLookup = async () => {
    if (!searchTerm.trim()) return;
    
    // Check if equipment exists in local list
    const existing = allEquipment.find(
      e => e.name.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    if (existing) {
      setSelectedEquipment(existing);
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await fetch('/api/ai/equipment-sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentName: searchTerm.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.name) {
          const newProtocol: EquipmentProtocol = {
            id: `custom_${Date.now()}`,
            name: data.name,
            category: data.category || 'Laboratory Equipment',
            isoStandard: data.isoStandard || 'ISO 17025 / GLP',
            calibrationFrequency: data.calibrationFrequency || 'Annually',
            validityCheckFrequency: data.validityCheckFrequency || 'Daily / Before Use',
            ppeRequired: data.ppeRequired || ['Lab coat', 'Safety glasses', 'Gloves'],
            operatingInstructions: data.operatingInstructions || {
              preChecks: ['Inspect visual integrity', 'Verify electrical safety'],
              steps: ['Turn on unit', 'Perform standard operating procedure'],
              postCheckShutdown: ['Clean equipment surfaces', 'Turn off power'],
              safetyNotes: ['Follow general laboratory safety protocols']
            },
            calibrationMethod: data.calibrationMethod || {
              standardsRequired: ['NIST Traceable Standard Reference Material'],
              environmentalConditions: 'Standard ambient lab conditions (20–25°C)',
              procedure: ['Connect reference standard', 'Record measurements'],
              acceptanceCriteria: 'Deviation within ±1.0%',
              toleranceLimits: 'Tolerance ≤ 1.0%'
            },
            validityMethod: data.validityMethod || {
              dailyCheckProcedure: ['Run zero/blank check', 'Measure secondary standard'],
              referenceControls: 'Secondary lab control standard',
              passFailThresholds: 'Reading within ±2% of control value',
              oosActionPlan: ['Quarantine unit', 'Clean and recalibrate', 'Tag Out Of Service if failing']
            }
          };

          const updatedCustom = [newProtocol, ...customProtocols];
          setCustomProtocols(updatedCustom);
          localStorage.setItem('mtk_custom_equipment_protocols', JSON.stringify(updatedCustom));
          setSelectedEquipment(newProtocol);
        }
      } else {
        // Fallback generated protocol if server route fails
        generateFallbackProtocol(searchTerm.trim());
      }
    } catch (e) {
      console.error('AI Equipment lookup failed:', e);
      generateFallbackProtocol(searchTerm.trim());
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateFallbackProtocol = (name: string) => {
    const fallback: EquipmentProtocol = {
      id: `custom_${Date.now()}`,
      name: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
      category: 'General Analytical Equipment',
      isoStandard: 'ISO 17025 / GLP / GMP Guidelines',
      calibrationFrequency: 'Bi-annually or Annually',
      validityCheckFrequency: 'Daily or Before Each Assay',
      ppeRequired: ['Lab coat', 'Safety glasses', 'Nitrile gloves'],
      operatingInstructions: {
        preChecks: [
          `Inspect physical condition, power cords, and clean working chamber of ${name}.`,
          'Verify level indicator bubble and ensure unit is grounded on stable surface.',
          'Check system status self-test on digital display.'
        ],
        steps: [
          `Power on ${name} and allow thermal/electronic warm-up for 15 minutes.`,
          'Set operational parameters (temperature, speed, wavelength, or volume).',
          'Load sample containers carefully adhering to capacity limits.',
          'Execute assay/measurement protocol and record observed values.'
        ],
        postCheckShutdown: [
          `Decontaminate ${name} contact surfaces with 70% Isopropanol or appropriate cleaner.`,
          'Remove all samples and dispose of hazardous waste.',
          'Power off device or switch to standby energy-save mode.'
        ],
        safetyNotes: [
          'Adhere strictly to manufacturer maximum operational ratings.',
          'Wear appropriate personal protective equipment (PPE) at all times.'
        ]
      },
      calibrationMethod: {
        standardsRequired: [`NIST Traceable Certified Reference Standard for ${name}`],
        environmentalConditions: 'Temperature controlled 20°C–25°C, relative humidity 45%–65%',
        procedure: [
          `Zero/blank the sensor baseline for ${name}.`,
          'Measure low-range, mid-range, and high-range reference standards in triplicate.',
          'Plot calibration curve and calculate slope, intercept, and linear correlation coefficient (R²).',
          'Adjust instrument calibration factor offset if deviation exceeds allowable limits.'
        ],
        acceptanceCriteria: 'Correlation coefficient R² ≥ 0.998; Measurement accuracy within ±1.0% of standard value.',
        toleranceLimits: 'Maximum allowable deviation ≤ ±1.0% of nominal standard value.'
      },
      validityMethod: {
        dailyCheckProcedure: [
          `Perform zero/blank check on ${name} before running patient or research samples.`,
          'Measure a secondary Quality Control (QC) reference material at beginning and end of batch.'
        ],
        referenceControls: 'Certified In-House Quality Control (QC) Material',
        passFailThresholds: 'Control value must fall within ±2 Standard Deviations ( Westgard 1-2s rule ).',
        oosActionPlan: [
          'Stop sample testing immediately upon Out-Of-Specification (OOS) result.',
          'Inspect reagents, clean probe/sensor, and re-run QC control.',
          'If failure persists, affix "OUT OF SERVICE" label and schedule technician calibration.'
        ]
      }
    };

    const updatedCustom = [fallback, ...customProtocols];
    setCustomProtocols(updatedCustom);
    localStorage.setItem('mtk_custom_equipment_protocols', JSON.stringify(updatedCustom));
    setSelectedEquipment(fallback);
  };

  // Add a new Calibration Log Entry
  const handleSaveCalLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTechName.trim() || !logStandardVal.trim() || !logObservedVal.trim()) return;

    const newLog = {
      id: Date.now(),
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      technician: logTechName.trim(),
      standardValue: logStandardVal.trim(),
      observedValue: logObservedVal.trim(),
      status: logPassFail,
      notes: logNotes.trim()
    };

    const updated = [newLog, ...savedLogs];
    setSavedLogs(updated);
    localStorage.setItem('mtk_equipment_cal_logs', JSON.stringify(updated));

    // Reset inputs
    setLogStandardVal('');
    setLogObservedVal('');
    setLogNotes('');
  };

  const handleDeleteLog = (id: number) => {
    const updated = savedLogs.filter(l => l.id !== id);
    setSavedLogs(updated);
    localStorage.setItem('mtk_equipment_cal_logs', JSON.stringify(updated));
  };

  const filteredLogs = savedLogs.filter(l => l.equipmentId === selectedEquipment.id);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner Header */}
      <div className="bg-slate-900 dark:bg-[#121215] text-white p-5 rounded-2xl border-2 border-slate-900 dark:border-white/20 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateTo({ type: 'TOOLS' })}
            className="flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </button>
          <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
            GLP / ISO 17025 COMPLIANT
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              EQUIPMENT & INSTRUMENT HUB
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Operating Instructions (SOP), Calibration Methods & Validity Checks
            </p>
          </div>
        </div>
      </div>

      {/* Search & Equipment Input Bar */}
      <div className="bg-white dark:bg-[#121215] p-3 rounded-2xl border-2 border-slate-300 dark:border-white/15 space-y-2">
        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-teal-600" /> Search or Type Any Lab Instrument
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiLookup()}
            placeholder="Type e.g., Autoclave, Refractometer, Spectrophotometer, Pipette..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-teal-500 transition-colors"
          />
          <button
            onClick={handleAiLookup}
            disabled={isAiLoading || !searchTerm.trim()}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isAiLoading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Search / AI
              </>
            )}
          </button>
        </div>

        {/* Quick Select Preset Equipment Chips */}
        <div className="pt-1">
          <span className="text-[9px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1.5">
            Quick Select Preset Instruments:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {allEquipment.map((eq) => (
              <button
                key={eq.id}
                onClick={() => {
                  setSelectedEquipment(eq);
                  setSearchTerm('');
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer border ${
                  selectedEquipment.id === eq.id
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/10 hover:border-slate-400'
                }`}
              >
                {eq.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Equipment Card Header */}
      <MtkCard className="p-4 border-2 border-teal-500/40 bg-teal-50/40 dark:bg-teal-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-200 dark:border-teal-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-teal-600 text-white">
                {selectedEquipment.category}
              </span>
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                Std: {selectedEquipment.isoStandard}
              </span>
            </div>
            <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white mt-1">
              {selectedEquipment.name}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] font-mono">
            <div className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/10">
              <span className="text-slate-500 dark:text-slate-400">Calibration: </span>
              <strong className="text-teal-700 dark:text-teal-400">{selectedEquipment.calibrationFrequency}</strong>
            </div>
            <div className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/10">
              <span className="text-slate-500 dark:text-slate-400">Validity Check: </span>
              <strong className="text-teal-700 dark:text-teal-400">{selectedEquipment.validityCheckFrequency}</strong>
            </div>
          </div>
        </div>

        {/* Required PPE Bar */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto text-[10px] font-mono text-slate-700 dark:text-slate-300">
          <strong className="text-slate-900 dark:text-white uppercase font-bold whitespace-nowrap">
            Required PPE:
          </strong>
          {selectedEquipment.ppeRequired.map((ppe, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 whitespace-nowrap"
            >
              🛡️ {ppe}
            </span>
          ))}
        </div>
      </MtkCard>

      {/* Main 3 Navigation Tabs: SOP, Calibration, Validity Check & Logger */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-200 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300 dark:border-white/10">
        <button
          onClick={() => setActiveTab('SOP')}
          className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'SOP'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> 1. Operating SOP
        </button>

        <button
          onClick={() => setActiveTab('CALIBRATION')}
          className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'CALIBRATION'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> 2. Calibration
        </button>

        <button
          onClick={() => setActiveTab('VALIDITY')}
          className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'VALIDITY'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> 3. Validity Check
        </button>

        <button
          onClick={() => setActiveTab('LOGGER')}
          className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'LOGGER'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Logs ({filteredLogs.length})
        </button>
      </div>

      {/* TAB CONTENT 1: OPERATING INSTRUCTIONS (SOP) */}
      {activeTab === 'SOP' && (
        <div className="space-y-3">
          {/* Pre-Checks */}
          <MtkCard className="p-4 border-2 border-slate-300 dark:border-white/15 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-white/10">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> A. Pre-Operational Safety & Visual Checks
            </h3>
            <ul className="space-y-1.5 pt-1">
              {selectedEquipment.operatingInstructions.preChecks.map((step, idx) => (
                <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </MtkCard>

          {/* Step-by-Step Procedure */}
          <MtkCard className="p-4 border-2 border-slate-300 dark:border-white/15 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-white/10">
              <Sliders className="w-4 h-4 text-teal-600" /> B. Step-by-Step Operating Instructions
            </h3>
            <ol className="space-y-2 pt-1">
              {selectedEquipment.operatingInstructions.steps.map((step, idx) => (
                <li key={idx} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                  <span className="w-5 h-5 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </MtkCard>

          {/* Post-Check Shutdown */}
          <MtkCard className="p-4 border-2 border-slate-300 dark:border-white/15 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-white/10">
              <RotateCcw className="w-4 h-4 text-teal-600" /> C. Post-Operation Cleaning & Shutdown
            </h3>
            <ul className="space-y-1.5 pt-1">
              {selectedEquipment.operatingInstructions.postCheckShutdown.map((step, idx) => (
                <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </MtkCard>

          {/* Safety Warning Box */}
          <div className="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-300 dark:border-amber-800/80 space-y-1">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Critical Safety Precautions
            </h4>
            <ul className="space-y-1 pl-5 list-disc text-xs text-amber-800 dark:text-amber-200">
              {selectedEquipment.operatingInstructions.safetyNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: METHOD OF CALIBRATION */}
      {activeTab === 'CALIBRATION' && (
        <div className="space-y-3">
          <MtkCard className="p-4 border-2 border-slate-300 dark:border-white/15 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-teal-600" /> Standard Calibration Protocol
              </h3>
              <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-md font-bold">
                Interval: {selectedEquipment.calibrationFrequency}
              </span>
            </div>

            {/* Standards & Environment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  Required Reference Standards:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-800 dark:text-slate-200 font-medium">
                  {selectedEquipment.calibrationMethod.standardsRequired.map((std, idx) => (
                    <li key={idx}>{std}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  Environmental Conditions:
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {selectedEquipment.calibrationMethod.environmentalConditions}
                </p>
              </div>
            </div>

            {/* Step-by-Step Calibration Procedure */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Step-by-Step Calibration Procedure:
              </span>
              <ol className="space-y-2">
                {selectedEquipment.calibrationMethod.procedure.map((step, idx) => (
                  <li key={idx} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                    <span className="w-5 h-5 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Acceptance Criteria & Tolerances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                  Acceptance Criteria:
                </span>
                <p className="text-emerald-950 dark:text-emerald-100 font-semibold">
                  {selectedEquipment.calibrationMethod.acceptanceCriteria}
                </p>
              </div>

              <div className="bg-teal-50 dark:bg-teal-950/30 p-2.5 rounded-xl border border-teal-200 dark:border-teal-800/80 space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase text-teal-800 dark:text-teal-300 block">
                  Tolerance Limits:
                </span>
                <p className="text-teal-950 dark:text-teal-100 font-semibold">
                  {selectedEquipment.calibrationMethod.toleranceLimits}
                </p>
              </div>
            </div>
          </MtkCard>
        </div>
      )}

      {/* TAB CONTENT 3: METHOD TO CHECK VALIDITY */}
      {activeTab === 'VALIDITY' && (
        <div className="space-y-3">
          <MtkCard className="p-4 border-2 border-slate-300 dark:border-white/15 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" /> Method to Check Validity & Performance
              </h3>
              <span className="text-[10px] font-mono bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-md font-bold">
                Frequency: {selectedEquipment.validityCheckFrequency}
              </span>
            </div>

            {/* Daily / Routine Validity Check Procedure */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Routine Validity Check Protocol:
              </span>
              <ul className="space-y-2">
                {selectedEquipment.validityMethod.dailyCheckProcedure.map((proc, idx) => (
                  <li key={idx} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{proc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Controls & Thresholds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  Reference Controls:
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold">
                  {selectedEquipment.validityMethod.referenceControls}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  Pass/Fail Thresholds:
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold">
                  {selectedEquipment.validityMethod.passFailThresholds}
                </p>
              </div>
            </div>

            {/* Out Of Specification (OOS) Protocol */}
            <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-200 dark:border-rose-800/80 space-y-1.5 pt-2">
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 uppercase">
                <XCircle className="w-4 h-4 text-rose-600" /> Out-Of-Specification (OOS) Action Plan
              </h4>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-rose-800 dark:text-rose-200">
                {selectedEquipment.validityMethod.oosActionPlan.map((action, idx) => (
                  <li key={idx} className="font-medium">{action}</li>
                ))}
              </ol>
            </div>
          </MtkCard>
        </div>
      )}

      {/* TAB CONTENT 4: INTERACTIVE CALIBRATION & VALIDITY LOGGER */}
      {activeTab === 'LOGGER' && (
        <div className="space-y-4">
          <MtkCard className="p-4 border-2 border-slate-300 dark:border-white/15 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-white/10">
              <Plus className="w-4 h-4 text-teal-600" /> Log Calibration / Validity Test for {selectedEquipment.name}
            </h3>

            <form onSubmit={handleSaveCalLog} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                    Technician Name / ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={logTechName}
                    onChange={(e) => setLogTechName(e.target.value)}
                    placeholder="e.g. Dr. Tayyab / Tech #104"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                    Pass / Fail Result *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLogPassFail('PASS')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        logPassFail === 'PASS'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10'
                      }`}
                    >
                      ✓ PASS
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogPassFail('FAIL')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        logPassFail === 'FAIL'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10'
                      }`}
                    >
                      ✗ FAIL
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                    Standard / Target Value *
                  </label>
                  <input
                    type="text"
                    required
                    value={logStandardVal}
                    onChange={(e) => setLogStandardVal(e.target.value)}
                    placeholder="e.g. pH 7.00 / 100 µL / 121.0°C"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                    Observed Instrument Reading *
                  </label>
                  <input
                    type="text"
                    required
                    value={logObservedVal}
                    onChange={(e) => setLogObservedVal(e.target.value)}
                    placeholder="e.g. pH 7.02 / 99.8 µL / 121.2°C"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                  Notes / Observations
                </label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="e.g. Electrode slope 98.4%. Cleaned with DI water."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Save Calibration / Validity Record
              </button>
            </form>
          </MtkCard>

          {/* Saved Log Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-between">
              <span>Saved Calibration Logs for {selectedEquipment.name}</span>
              <span className="text-[10px] font-mono text-slate-500">{filteredLogs.length} Records</span>
            </h4>

            {filteredLogs.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-xs text-slate-500">
                No calibration logs recorded yet for this instrument. Use the form above to add one.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white dark:bg-[#121215] rounded-xl border-2 border-slate-200 dark:border-white/10 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                            log.status === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{log.date}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                          By: {log.technician}
                        </span>
                      </div>

                      <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                        Target: <strong>{log.standardValue}</strong> | Observed: <strong>{log.observedValue}</strong>
                      </div>

                      {log.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
