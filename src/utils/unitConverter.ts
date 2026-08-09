/**
 * Unit Conversion Utilities for Laboratory Work
 */

export interface UnitCategory {
  id: string;
  name: string;
  units: { id: string; name: string; toBase: (val: number) => number; fromBase: (val: number) => number }[];
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'mass',
    name: 'Mass',
    units: [
      { id: 'kg', name: 'Kilograms (kg)', toBase: v => v * 1e3, fromBase: v => v / 1e3 },
      { id: 'g', name: 'Grams (g)', toBase: v => v, fromBase: v => v },
      { id: 'mg', name: 'Milligrams (mg)', toBase: v => v * 1e-3, fromBase: v => v / 1e-3 },
      { id: 'µg', name: 'Micrograms (µg)', toBase: v => v * 1e-6, fromBase: v => v / 1e-6 },
      { id: 'ng', name: 'Nanograms (ng)', toBase: v => v * 1e-9, fromBase: v => v / 1e-9 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    units: [
      { id: 'L', name: 'Liters (L)', toBase: v => v, fromBase: v => v },
      { id: 'mL', name: 'Milliliters (mL)', toBase: v => v * 1e-3, fromBase: v => v / 1e-3 },
      { id: 'µL', name: 'Microliters (µL)', toBase: v => v * 1e-6, fromBase: v => v / 1e-6 },
      { id: 'nL', name: 'Nanoliters (nL)', toBase: v => v * 1e-9, fromBase: v => v / 1e-9 },
    ],
  },
  {
    id: 'length',
    name: 'Length',
    units: [
      { id: 'm', name: 'Meters (m)', toBase: v => v, fromBase: v => v },
      { id: 'cm', name: 'Centimeters (cm)', toBase: v => v * 1e-2, fromBase: v => v / 1e-2 },
      { id: 'mm', name: 'Millimeters (mm)', toBase: v => v * 1e-3, fromBase: v => v / 1e-3 },
      { id: 'µm', name: 'Micrometers (µm)', toBase: v => v * 1e-6, fromBase: v => v / 1e-6 },
      { id: 'nm', name: 'Nanometers (nm)', toBase: v => v * 1e-9, fromBase: v => v / 1e-9 },
    ],
  },
  {
    id: 'time',
    name: 'Time',
    units: [
      { id: 'h', name: 'Hours (h)', toBase: v => v * 3600, fromBase: v => v / 3600 },
      { id: 'min', name: 'Minutes (min)', toBase: v => v * 60, fromBase: v => v / 60 },
      { id: 's', name: 'Seconds (s)', toBase: v => v, fromBase: v => v },
      { id: 'ms', name: 'Milliseconds (ms)', toBase: v => v * 1e-3, fromBase: v => v / 1e-3 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    units: [
      { id: 'C', name: 'Celsius (°C)', toBase: v => v, fromBase: v => v },
      { id: 'F', name: 'Fahrenheit (°F)', toBase: v => (v - 32) * (5 / 9), fromBase: v => (v * 9 / 5) + 32 },
      { id: 'K', name: 'Kelvin (K)', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
  },
  {
    id: 'concentration',
    name: 'Concentration',
    units: [
      { id: 'M', name: 'Molar (M)', toBase: v => v, fromBase: v => v },
      { id: 'mM', name: 'Millimolar (mM)', toBase: v => v * 1e-3, fromBase: v => v / 1e-3 },
      { id: 'µM', name: 'Micromolar (µM)', toBase: v => v * 1e-6, fromBase: v => v / 1e-6 },
      { id: 'nM', name: 'Nanomolar (nM)', toBase: v => v * 1e-9, fromBase: v => v / 1e-9 },
    ],
  },
];

export function convertValue(categoryId: string, value: number, fromUnitId: string, toUnitId: string): number {
  if (isNaN(value)) return 0;
  const category = UNIT_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return value;

  const fromUnit = category.units.find(u => u.id === fromUnitId);
  const toUnit = category.units.find(u => u.id === toUnitId);

  if (!fromUnit || !toUnit) return value;

  const baseValue = fromUnit.toBase(value);
  const converted = toUnit.fromBase(baseValue);
  return converted;
}

// Helpers for specific lab unit conversions
export function massToBaseGrams(value: number, unit: string): number {
  switch (unit) {
    case 'kg': return value * 1e3;
    case 'g': return value;
    case 'mg': return value * 1e-3;
    case 'µg': return value * 1e-6;
    case 'ng': return value * 1e-9;
    default: return value;
  }
}

export function gramsToUnit(valueGrams: number, unit: string): number {
  switch (unit) {
    case 'kg': return valueGrams / 1e3;
    case 'g': return valueGrams;
    case 'mg': return valueGrams / 1e-3;
    case 'µg': return valueGrams / 1e-6;
    case 'ng': return valueGrams / 1e-9;
    default: return valueGrams;
  }
}

export function volumeToBaseLiters(value: number, unit: string): number {
  switch (unit) {
    case 'L': return value;
    case 'mL': return value * 1e-3;
    case 'µL': return value * 1e-6;
    case 'nL': return value * 1e-9;
    default: return value;
  }
}

export function litersToUnit(valueLiters: number, unit: string): number {
  switch (unit) {
    case 'L': return valueLiters;
    case 'mL': return valueLiters / 1e-3;
    case 'µL': return valueLiters / 1e-6;
    case 'nL': return valueLiters / 1e-9;
    default: return valueLiters;
  }
}

export function concToBaseMolar(value: number, unit: string): number {
  switch (unit) {
    case 'M': return value;
    case 'mM': return value * 1e-3;
    case 'µM': return value * 1e-6;
    case 'nM': return value * 1e-9;
    default: return value;
  }
}

export function molarToUnit(valueMolar: number, unit: string): number {
  switch (unit) {
    case 'M': return valueMolar;
    case 'mM': return valueMolar / 1e-3;
    case 'µM': return valueMolar / 1e-6;
    case 'nM': return valueMolar / 1e-9;
    default: return valueMolar;
  }
}

export function molesToBase(value: number, unit: string): number {
  switch (unit) {
    case 'mol': return value;
    case 'mmol': return value * 1e-3;
    case 'µmol': return value * 1e-6;
    default: return value;
  }
}

export function molesFromBase(valueMoles: number, unit: string): number {
  switch (unit) {
    case 'mol': return valueMoles;
    case 'mmol': return valueMoles / 1e-3;
    case 'µmol': return valueMoles / 1e-6;
    default: return valueMoles;
  }
}
