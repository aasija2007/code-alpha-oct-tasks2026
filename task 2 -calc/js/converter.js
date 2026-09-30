/**
 * CalcPro - Converter Module
 * Unit & Currency Conversion Logic
 */

const ConverterEngine = (function () {
  'use strict';

  // Base Conversion Rates relative to standard base unit for each category
  const CONVERSIONS = {
    length: {
      base: 'm',
      units: {
        m: { name: 'Meters (m)', rate: 1 },
        km: { name: 'Kilometers (km)', rate: 1000 },
        cm: { name: 'Centimeters (cm)', rate: 0.01 },
        mm: { name: 'Millimeters (mm)', rate: 0.001 },
        mi: { name: 'Miles (mi)', rate: 1609.344 },
        ft: { name: 'Feet (ft)', rate: 0.3048 },
        in: { name: 'Inches (in)', rate: 0.0254 }
      }
    },
    weight: {
      base: 'kg',
      units: {
        kg: { name: 'Kilograms (kg)', rate: 1 },
        g: { name: 'Grams (g)', rate: 0.001 },
        mg: { name: 'Milligrams (mg)', rate: 0.000001 },
        lbs: { name: 'Pounds (lbs)', rate: 0.45359237 },
        oz: { name: 'Ounces (oz)', rate: 0.028349523125 }
      }
    },
    temperature: {
      units: {
        c: { name: 'Celsius (°C)' },
        f: { name: 'Fahrenheit (°F)' },
        k: { name: 'Kelvin (K)' }
      }
    },
    currency: {
      base: 'USD',
      units: {
        USD: { name: 'US Dollar ($)', rate: 1.0 },
        EUR: { name: 'Euro (€)', rate: 1.08 },
        GBP: { name: 'British Pound (£)', rate: 1.27 },
        JPY: { name: 'Japanese Yen (¥)', rate: 0.0065 },
        INR: { name: 'Indian Rupee (₹)', rate: 0.012 },
        CAD: { name: 'Canadian Dollar (C$)', rate: 0.74 },
        AUD: { name: 'Australian Dollar (A$)', rate: 0.65 },
        CHF: { name: 'Swiss Franc (CHF)', rate: 1.13 }
      }
    }
  };

  /**
   * Convert Temperature
   */
  function convertTemperature(value, from, to) {
    if (from === to) return value;
    let celsius;

    // Convert to Celsius first
    if (from === 'c') celsius = value;
    else if (from === 'f') celsius = (value - 32) * (5 / 9);
    else if (from === 'k') celsius = value - 273.15;

    // Convert Celsius to Target
    if (to === 'c') return celsius;
    if (to === 'f') return celsius * (9 / 5) + 32;
    if (to === 'k') return celsius + 273.15;
    return value;
  }

  /**
   * Convert linear rate-based units (Length, Weight, Currency)
   */
  function convert(category, value, fromUnit, toUnit) {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    if (fromUnit === toUnit) return num;

    const catData = CONVERSIONS[category];
    if (!catData) return 0;

    if (category === 'temperature') {
      return convertTemperature(num, fromUnit, toUnit);
    }

    const fromRate = catData.units[fromUnit]?.rate;
    const toRate = catData.units[toUnit]?.rate;

    if (!fromRate || !toRate) return 0;

    // Convert from source to base, then from base to target
    const valueInBase = num * fromRate;
    const result = valueInBase / toRate;

    return Math.round((result + Number.EPSILON) * 1e8) / 1e8;
  }

  /**
   * Get list of categories and units for populating UI dropdowns
   */
  function getCategories() {
    return Object.keys(CONVERSIONS);
  }

  function getUnits(category) {
    const catData = CONVERSIONS[category];
    if (!catData) return [];
    return Object.keys(catData.units).map(key => ({
      key,
      name: catData.units[key].name
    }));
  }

  return {
    convert,
    getCategories,
    getUnits
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConverterEngine;
}
