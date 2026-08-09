/**
 * MTKmicro Lab - Calculator Math & Logic Engines
 */

import {
  massToBaseGrams,
  gramsToUnit,
  volumeToBaseLiters,
  litersToUnit,
  concToBaseMolar,
  molarToUnit,
  molesToBase,
  molesFromBase,
} from './unitConverter';

// --- MOLARITY CALCULATOR ---
export interface MolarityInputs {
  molarity: string; // M
  molarityUnit: string;
  mass: string; // g
  massUnit: string;
  mw: string; // g/mol
  volume: string; // L
  volumeUnit: string;
  moles: string; // mol
  molesUnit: string;
}

export interface MolarityResult {
  solvedField: 'molarity' | 'mass' | 'mw' | 'volume' | 'moles';
  fieldLabel: string;
  value: number;
  formattedValue: string;
  unit: string;
  formulaString: string;
  substitutedFormula: string;
}

export function calculateMolarity(inputs: MolarityInputs): MolarityResult {
  // Count empty fields
  const fields = [
    { key: 'molarity', val: inputs.molarity.trim() },
    { key: 'mass', val: inputs.mass.trim() },
    { key: 'mw', val: inputs.mw.trim() },
    { key: 'volume', val: inputs.volume.trim() },
    { key: 'moles', val: inputs.moles.trim() },
  ];

  const emptyFields = fields.filter(f => f.val === '');
  if (emptyFields.length === 0) {
    throw new Error('Please leave exactly one field blank to solve for.');
  }
  if (emptyFields.length > 1) {
    throw new Error(`Please fill all fields except the target variable (${emptyFields.length} blank fields found).`);
  }

  const targetKey = emptyFields[0].key;

  // Validate non-blank inputs are positive numbers
  for (const f of fields) {
    if (f.key !== targetKey) {
      const num = parseFloat(f.val);
      if (isNaN(num)) throw new Error(`Invalid number in ${f.key}`);
      if (num < 0) throw new Error(`${f.key} must be a positive number`);
    }
  }

  // Extract base units
  const mVal = inputs.molarity ? concToBaseMolar(parseFloat(inputs.molarity), inputs.molarityUnit) : 0;
  const massVal = inputs.mass ? massToBaseGrams(parseFloat(inputs.mass), inputs.massUnit) : 0;
  const mwVal = inputs.mw ? parseFloat(inputs.mw) : 0;
  const volVal = inputs.volume ? volumeToBaseLiters(parseFloat(inputs.volume), inputs.volumeUnit) : 0;
  const molesVal = inputs.moles ? molesToBase(parseFloat(inputs.moles), inputs.molesUnit) : 0;

  let resultVal = 0;
  let formattedResult = '';
  let label = '';
  let outputUnit = '';
  let formula = '';
  let subFormula = '';

  switch (targetKey) {
    case 'molarity': {
      // M = moles / volume OR (mass / MW) / volume
      label = 'Molarity';
      outputUnit = inputs.molarityUnit;
      let baseMolar = 0;
      if (inputs.moles.trim() !== '' && volVal > 0) {
        baseMolar = molesVal / volVal;
        formula = 'Molarity (M) = Moles (mol) / Volume (L)';
        subFormula = `M = ${molesVal.toExponential(3)} mol / ${volVal.toExponential(3)} L`;
      } else if (massVal > 0 && mwVal > 0 && volVal > 0) {
        baseMolar = massVal / (mwVal * volVal);
        formula = 'Molarity (M) = Mass (g) / [MW (g/mol) × Volume (L)]';
        subFormula = `M = ${massVal} g / [${mwVal} g/mol × ${volVal} L]`;
      } else {
        if (volVal === 0) throw new Error('Volume cannot be zero when calculating molarity.');
        throw new Error('Provide (Moles & Volume) OR (Mass, MW & Volume) to calculate Molarity.');
      }
      resultVal = molarToUnit(baseMolar, inputs.molarityUnit);
      formattedResult = formatScientific(resultVal);
      break;
    }

    case 'mass': {
      // Mass = Molar * MW * Volume OR Moles * MW
      label = 'Mass';
      outputUnit = inputs.massUnit;
      let baseGrams = 0;
      if (mVal > 0 && mwVal > 0 && volVal > 0) {
        baseGrams = mVal * mwVal * volVal;
        formula = 'Mass (g) = Molarity (M) × MW (g/mol) × Volume (L)';
        subFormula = `Mass = ${mVal} M × ${mwVal} g/mol × ${volVal} L`;
      } else if (molesVal > 0 && mwVal > 0) {
        baseGrams = molesVal * mwVal;
        formula = 'Mass (g) = Moles (mol) × MW (g/mol)';
        subFormula = `Mass = ${molesVal} mol × ${mwVal} g/mol`;
      } else {
        throw new Error('Provide (Molarity, MW & Volume) OR (Moles & MW) to calculate Mass.');
      }
      resultVal = gramsToUnit(baseGrams, inputs.massUnit);
      formattedResult = formatScientific(resultVal);
      break;
    }

    case 'mw': {
      // MW = Mass / (Molar * Volume)
      label = 'Molecular Weight';
      outputUnit = 'g/mol';
      let mwResult = 0;
      if (mVal > 0 && volVal > 0 && massVal > 0) {
        mwResult = massVal / (mVal * volVal);
        formula = 'MW (g/mol) = Mass (g) / [Molarity (M) × Volume (L)]';
        subFormula = `MW = ${massVal} g / [${mVal} M × ${volVal} L]`;
      } else if (molesVal > 0 && massVal > 0) {
        mwResult = massVal / molesVal;
        formula = 'MW (g/mol) = Mass (g) / Moles (mol)';
        subFormula = `MW = ${massVal} g / ${molesVal} mol`;
      } else {
        throw new Error('Provide (Mass, Molarity & Volume) OR (Mass & Moles) to calculate MW.');
      }
      resultVal = mwResult;
      formattedResult = formatScientific(resultVal);
      break;
    }

    case 'volume': {
      // Volume = Moles / Molar OR Mass / (Molar * MW)
      label = 'Volume';
      outputUnit = inputs.volumeUnit;
      let baseLiters = 0;
      if (mVal > 0 && molesVal > 0) {
        baseLiters = molesVal / mVal;
        formula = 'Volume (L) = Moles (mol) / Molarity (M)';
        subFormula = `Volume = ${molesVal} mol / ${mVal} M`;
      } else if (mVal > 0 && massVal > 0 && mwVal > 0) {
        baseLiters = massVal / (mVal * mwVal);
        formula = 'Volume (L) = Mass (g) / [Molarity (M) × MW (g/mol)]';
        subFormula = `Volume = ${massVal} g / [${mVal} M × ${mwVal} g/mol]`;
      } else {
        if (mVal === 0) throw new Error('Molarity cannot be zero when calculating volume.');
        throw new Error('Provide (Moles & Molarity) OR (Mass, Molarity & MW) to calculate Volume.');
      }
      resultVal = litersToUnit(baseLiters, inputs.volumeUnit);
      formattedResult = formatScientific(resultVal);
      break;
    }

    case 'moles': {
      // Moles = Molar * Volume OR Mass / MW
      label = 'Moles';
      outputUnit = inputs.molesUnit;
      let baseMoles = 0;
      if (mVal > 0 && volVal > 0) {
        baseMoles = mVal * volVal;
        formula = 'Moles (mol) = Molarity (M) × Volume (L)';
        subFormula = `Moles = ${mVal} M × ${volVal} L`;
      } else if (massVal > 0 && mwVal > 0) {
        baseMoles = massVal / mwVal;
        formula = 'Moles (mol) = Mass (g) / MW (g/mol)';
        subFormula = `Moles = ${massVal} g / ${mwVal} g/mol`;
      } else {
        throw new Error('Provide (Molarity & Volume) OR (Mass & MW) to calculate Moles.');
      }
      resultVal = molesFromBase(baseMoles, inputs.molesUnit);
      formattedResult = formatScientific(resultVal);
      break;
    }
  }

  return {
    solvedField: targetKey as MolarityResult['solvedField'],
    fieldLabel: label,
    value: resultVal,
    formattedValue: formattedResult,
    unit: outputUnit,
    formulaString: formula,
    substitutedFormula: subFormula,
  };
}

// --- DILUTION CALCULATOR (C1V1 = C2V2) ---
export interface DilutionInputs {
  c1: string; c1Unit: string;
  v1: string; v1Unit: string;
  c2: string; c2Unit: string;
  v2: string; v2Unit: string;
}

export interface DilutionResult {
  solvedField: 'c1' | 'v1' | 'c2' | 'v2';
  stockVolumeReq: number;
  stockVolumeReqFormatted: string;
  stockVolumeReqUnit: string;
  diluentVolume: number;
  diluentVolumeFormatted: string;
  diluentVolumeUnit: string;
  dilutionFactorRatio: string;
  c1Val: number; c1Unit: string;
  v1Val: number; v1Unit: string;
  c2Val: number; c2Unit: string;
  v2Val: number; v2Unit: string;
}

export function calculateDilution(inputs: DilutionInputs): DilutionResult {
  const fields = [
    { key: 'c1', val: inputs.c1.trim() },
    { key: 'v1', val: inputs.v1.trim() },
    { key: 'c2', val: inputs.c2.trim() },
    { key: 'v2', val: inputs.v2.trim() },
  ];

  const empty = fields.filter(f => f.val === '');
  if (empty.length !== 1) {
    throw new Error('Please leave exactly one field blank to solve for (C1, V1, C2, or V2).');
  }

  const targetKey = empty[0].key as 'c1' | 'v1' | 'c2' | 'v2';

  for (const f of fields) {
    if (f.key !== targetKey) {
      const num = parseFloat(f.val);
      if (isNaN(num)) throw new Error(`Invalid number in ${f.key.toUpperCase()}`);
      if (num <= 0) throw new Error(`${f.key.toUpperCase()} must be a positive number`);
    }
  }

  // Convert concentrations and volumes to standardized base units (M, L) or ratio
  // Standardize conc if in M, mM, µM, or %
  const c1Base = parseConcBase(inputs.c1, inputs.c1Unit, targetKey === 'c1');
  const v1Base = parseVolBase(inputs.v1, inputs.v1Unit, targetKey === 'v1');
  const c2Base = parseConcBase(inputs.c2, inputs.c2Unit, targetKey === 'c2');
  const v2Base = parseVolBase(inputs.v2, inputs.v2Unit, targetKey === 'v2');

  let resC1 = c1Base;
  let resV1 = v1Base;
  let resC2 = c2Base;
  let resV2 = v2Base;

  switch (targetKey) {
    case 'v1':
      if (resC1 === 0) throw new Error('C1 cannot be zero');
      resV1 = (resC2 * resV2) / resC1;
      break;
    case 'c1':
      if (resV1 === 0) throw new Error('V1 cannot be zero');
      resC1 = (resC2 * resV2) / resV1;
      break;
    case 'v2':
      if (resC2 === 0) throw new Error('C2 cannot be zero');
      resV2 = (resC1 * resV1) / resC2;
      break;
    case 'c2':
      if (resV2 === 0) throw new Error('V2 cannot be zero');
      resC2 = (resC1 * resV1) / resV2;
      break;
  }

  // Validation: C2 cannot exceed C1
  if (resC2 > resC1 + 1e-9) {
    throw new Error('Desired concentration (C2) cannot exceed stock concentration (C1).');
  }

  if (resV1 > resV2 + 1e-9) {
    throw new Error('Stock volume required (V1) cannot exceed total final volume (V2).');
  }

  // Convert back to original requested units
  const displayV1 = formatVolFromBase(resV1, inputs.v1Unit);
  const displayV2 = formatVolFromBase(resV2, inputs.v2Unit);
  const displayC1 = formatConcFromBase(resC1, inputs.c1Unit);
  const displayC2 = formatConcFromBase(resC2, inputs.c2Unit);

  const diluentVolBase = Math.max(0, resV2 - resV1);
  const diluentVolDisplay = formatVolFromBase(diluentVolBase, inputs.v2Unit);

  const factorNum = resC1 / resC2;
  const factorRatio = `1:${formatScientific(factorNum)}`;

  return {
    solvedField: targetKey,
    stockVolumeReq: displayV1,
    stockVolumeReqFormatted: formatScientific(displayV1),
    stockVolumeReqUnit: inputs.v1Unit,
    diluentVolume: diluentVolDisplay,
    diluentVolumeFormatted: formatScientific(diluentVolDisplay),
    diluentVolumeUnit: inputs.v2Unit,
    dilutionFactorRatio: factorRatio,
    c1Val: displayC1, c1Unit: inputs.c1Unit,
    v1Val: displayV1, v1Unit: inputs.v1Unit,
    c2Val: displayC2, c2Unit: inputs.c2Unit,
    v2Val: displayV2, v2Unit: inputs.v2Unit,
  };
}

function parseConcBase(valStr: string, unit: string, isTarget: boolean): number {
  if (isTarget) return 0;
  const num = parseFloat(valStr);
  if (unit === '%') return num;
  if (unit === 'mg/mL') return num;
  if (unit === 'µg/mL') return num * 1e-3;
  return concToBaseMolar(num, unit);
}

function formatConcFromBase(baseVal: number, unit: string): number {
  if (unit === '%' || unit === 'mg/mL') return baseVal;
  if (unit === 'µg/mL') return baseVal * 1e3;
  return molarToUnit(baseVal, unit);
}

function parseVolBase(valStr: string, unit: string, isTarget: boolean): number {
  if (isTarget) return 0;
  const num = parseFloat(valStr);
  return volumeToBaseLiters(num, unit);
}

function formatVolFromBase(baseLiters: number, unit: string): number {
  return litersToUnit(baseLiters, unit);
}

// --- SERIAL DILUTION CALCULATOR ---
export interface SerialDilutionRow {
  tubeNumber: number;
  dilutionRatio: string;
  concFormatted: string;
  rawConc: number;
  concUnit: string;
  transferVolFormatted: string;
  transferVolUnit: string;
  diluentVolFormatted: string;
  diluentVolUnit: string;
}

export function calculateSerialDilution(
  startConc: number,
  concUnit: string,
  factor: number,
  numSteps: number,
  finalVol: number,
  volUnit: string
): SerialDilutionRow[] {
  if (startConc <= 0) throw new Error('Starting concentration must be positive.');
  if (factor <= 1) throw new Error('Dilution factor must be greater than 1.');
  if (numSteps < 1 || numSteps > 20) throw new Error('Number of steps must be between 1 and 20.');
  if (finalVol <= 0) throw new Error('Final volume must be positive.');

  const rows: SerialDilutionRow[] = [];
  let currentConc = startConc;
  let cumulativeRatio = 1;

  // Stock transfer volume per tube = FinalVol / Factor
  const transferVol = finalVol / factor;
  const diluentVol = finalVol - transferVol;

  for (let i = 1; i <= numSteps; i++) {
    currentConc = currentConc / factor;
    cumulativeRatio = cumulativeRatio * factor;

    // Smart unit formatting for conc
    let formattedConcStr = '';
    if (currentConc < 0.001 && concUnit === 'M') {
      formattedConcStr = `${formatScientific(currentConc * 1e3)} mM`;
    } else if (currentConc < 1e-6 && concUnit === 'mM') {
      formattedConcStr = `${formatScientific(currentConc * 1e3)} µM`;
    } else {
      formattedConcStr = `${formatScientific(currentConc)} ${concUnit}`;
    }

    rows.push({
      tubeNumber: i,
      dilutionRatio: `1:${formatScientific(cumulativeRatio)}`,
      concFormatted: formattedConcStr,
      rawConc: currentConc,
      concUnit: concUnit,
      transferVolFormatted: formatScientific(transferVol),
      transferVolUnit: volUnit,
      diluentVolFormatted: formatScientific(diluentVol),
      diluentVolUnit: volUnit,
    });
  }

  return rows;
}

// --- MASTER MIX CALCULATOR ---
export interface MasterMixComponentCalc {
  name: string;
  volPerRxn: number;
  volPerRxnUnit: string;
  totalVol: number;
  totalVolUnit: string;
}

export function calculateMasterMix(
  rxnVol: number,
  rxnVolUnit: string,
  numRxns: number,
  overagePct: number,
  components: { name: string; stockConc: number; stockConcUnit: string; finalConc: number; finalConcUnit: string }[]
): { totalMixVolume: number; overageRxns: number; componentCalcs: MasterMixComponentCalc[] } {
  if (rxnVol <= 0) throw new Error('Reaction volume must be positive.');
  if (numRxns <= 0) throw new Error('Number of reactions must be at least 1.');
  if (overagePct < 0) throw new Error('Overage percentage cannot be negative.');

  const effectiveRxns = numRxns * (1 + overagePct / 100);
  const totalMixVol = rxnVol * effectiveRxns;

  const componentCalcs: MasterMixComponentCalc[] = components.map(c => {
    // Check matching units or convert
    let stockInFinalUnits = c.stockConc;
    if (c.stockConcUnit !== c.finalConcUnit) {
      const stockBase = concToBaseMolar(c.stockConc, c.stockConcUnit);
      stockInFinalUnits = molarToUnit(stockBase, c.finalConcUnit);
    }

    if (stockInFinalUnits <= 0) {
      throw new Error(`Stock concentration for ${c.name} must be positive.`);
    }

    if (c.finalConc > stockInFinalUnits) {
      throw new Error(`Final concentration for ${c.name} cannot exceed stock concentration.`);
    }

    // Vol per rxn = (C2 / C1) * RxnVol
    const volPerRxn = (c.finalConc / stockInFinalUnits) * rxnVol;
    const totalVol = volPerRxn * effectiveRxns;

    return {
      name: c.name,
      volPerRxn,
      volPerRxnUnit: rxnVolUnit,
      totalVol,
      totalVolUnit: rxnVolUnit,
    };
  });

  return {
    totalMixVolume: totalMixVol,
    overageRxns: effectiveRxns,
    componentCalcs,
  };
}

// --- MEDIUM / BUFFER CALCULATOR ---
export interface BufferComponentCalc {
  name: string;
  quantityNeeded: number;
  unit: string;
  notes: string;
}

export function calculateBuffer(
  finalVol: number,
  finalVolUnit: string,
  components: { name: string; finalConc: number; finalConcUnit: string; mw?: number | null; stockConc?: number | null; stockConcUnit?: string | null }[]
): BufferComponentCalc[] {
  if (finalVol <= 0) throw new Error('Final volume must be positive.');
  const finalLiters = volumeToBaseLiters(finalVol, finalVolUnit);

  return components.map(c => {
    let qty = 0;
    let unit = '';
    let notes = '';

    if (c.stockConc && c.stockConc > 0) {
      // Stock concentration provided -> C1V1 = C2V2
      const stockBase = concToBaseMolar(c.stockConc, c.stockConcUnit || 'M');
      const finalBase = concToBaseMolar(c.finalConc, c.finalConcUnit);

      if (finalBase > stockBase) {
        throw new Error(`Final conc for ${c.name} cannot exceed stock conc.`);
      }

      const v1Liters = (finalBase * finalLiters) / stockBase;
      qty = litersToUnit(v1Liters, finalVolUnit);
      unit = finalVolUnit;
      notes = `Liquid stock addition from ${c.stockConc} ${c.stockConcUnit || 'M'}`;
    } else if (c.mw && c.mw > 0) {
      // Molecular weight provided -> Mass = Conc(M) * MW * Vol(L)
      const finalMolar = concToBaseMolar(c.finalConc, c.finalConcUnit);
      const grams = finalMolar * c.mw * finalLiters;

      if (grams < 1e-3) {
        qty = grams * 1e3; // mg
        unit = 'mg';
      } else {
        qty = grams;
        unit = 'g';
      }
      notes = `Solid powder mass based on MW ${c.mw} g/mol`;
    } else {
      throw new Error(`Provide stock concentration or molecular weight for component: ${c.name}`);
    }

    return {
      name: c.name,
      quantityNeeded: qty,
      unit,
      notes,
    };
  });
}

export function formatScientific(num: number): string {
  if (isNaN(num)) return '0';
  if (num === 0) return '0';
  const abs = Math.abs(num);
  if (abs >= 1e6 || (abs < 1e-3 && abs > 0)) {
    return num.toExponential(4).replace('e+', 'e');
  }
  return Number(num.toFixed(4)).toString();
}
