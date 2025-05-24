import { SimulatedData } from './dataGenerator';
import { WATER_QUALITY_THRESHOLDS } from './config';

export type WaterQualityLevel = 'Good' | 'Fair' | 'Poor';

/**
 * Analyzes water quality based on sensor readings
 */
export function analyzeWaterQuality(data: SimulatedData): WaterQualityLevel {
  // Check if all parameters are within the "Good" range
  if (
    isInRange(data.temperature, WATER_QUALITY_THRESHOLDS.GOOD.temperature) &&
    isInRange(data.ph, WATER_QUALITY_THRESHOLDS.GOOD.ph) &&
    isInRange(data.dissolvedOxygen, WATER_QUALITY_THRESHOLDS.GOOD.dissolvedOxygen) &&
    isInRange(data.turbidity, WATER_QUALITY_THRESHOLDS.GOOD.turbidity) &&
    isInRange(data.conductivity, WATER_QUALITY_THRESHOLDS.GOOD.conductivity)
  ) {
    return 'Good';
  }
  
  // Check if all parameters are at least within the "Fair" range
  if (
    isInRange(data.temperature, WATER_QUALITY_THRESHOLDS.FAIR.temperature) &&
    isInRange(data.ph, WATER_QUALITY_THRESHOLDS.FAIR.ph) &&
    isInRange(data.dissolvedOxygen, WATER_QUALITY_THRESHOLDS.FAIR.dissolvedOxygen) &&
    isInRange(data.turbidity, WATER_QUALITY_THRESHOLDS.FAIR.turbidity) &&
    isInRange(data.conductivity, WATER_QUALITY_THRESHOLDS.FAIR.conductivity)
  ) {
    return 'Fair';
  }
  
  // Check if all parameters are at least within the "Poor" range
  if (
    isInRange(data.temperature, WATER_QUALITY_THRESHOLDS.POOR.temperature) &&
    isInRange(data.ph, WATER_QUALITY_THRESHOLDS.POOR.ph) &&
    isInRange(data.dissolvedOxygen, WATER_QUALITY_THRESHOLDS.POOR.dissolvedOxygen) &&
    isInRange(data.turbidity, WATER_QUALITY_THRESHOLDS.POOR.turbidity) &&
    isInRange(data.conductivity, WATER_QUALITY_THRESHOLDS.POOR.conductivity)
  ) {
    return 'Poor';
  }
  
  // If any parameter is outside even the "Poor" range, water quality is "Poor"
  return 'Poor';
}

/**
 * Checks if a value is within a specified range
 */
function isInRange(value: number, range: { min: number; max: number }): boolean {
  return value >= range.min && value <= range.max;
}

/**
 * Analyzes potential causes of poor water quality
 */
export function analyzePotentialCauses(data: SimulatedData): string[] {
  const causes: string[] = [];
  
  // High temperature can indicate thermal pollution
  if (data.temperature > WATER_QUALITY_THRESHOLDS.FAIR.temperature.max) {
    causes.push('Possible thermal pollution from industrial discharge');
  }
  
  // Low pH indicates acidification
  if (data.ph < WATER_QUALITY_THRESHOLDS.FAIR.ph.min) {
    causes.push('Water acidification - possible acid rain or industrial discharge');
  }
  
  // High pH indicates alkaline pollution
  if (data.ph > WATER_QUALITY_THRESHOLDS.FAIR.ph.max) {
    causes.push('Alkaline pollution - possible agricultural runoff or detergent');
  }
  
  // Low dissolved oxygen indicates organic pollution
  if (data.dissolvedOxygen < WATER_QUALITY_THRESHOLDS.FAIR.dissolvedOxygen.min) {
    causes.push('Low oxygen levels - possible sewage or organic waste pollution');
  }
  
  // High turbidity indicates suspended particles
  if (data.turbidity > WATER_QUALITY_THRESHOLDS.FAIR.turbidity.max) {
    causes.push('High suspended solids - possible erosion, runoff, or dredging');
  }
  
  // High conductivity indicates dissolved solids pollution
  if (data.conductivity > WATER_QUALITY_THRESHOLDS.FAIR.conductivity.max) {
    causes.push('High dissolved solids - possible industrial discharge or urban runoff');
  }
  
  return causes;
}

/**
 * Determines if a water quality alert should be triggered
 */
export function shouldTriggerAlert(
  data: SimulatedData, 
  previousQuality: WaterQualityLevel, 
  currentQuality: WaterQualityLevel
): boolean {
  // Trigger an alert if water quality has degraded
  if (
    (previousQuality === 'Good' && (currentQuality === 'Fair' || currentQuality === 'Poor')) ||
    (previousQuality === 'Fair' && currentQuality === 'Poor')
  ) {
    return true;
  }
  
  // Also trigger an alert for extreme values
  if (
    data.ph < 5.0 || data.ph > 10.0 ||
    data.dissolvedOxygen < 3.0 ||
    data.turbidity > 25 ||
    data.temperature > 35 ||
    data.conductivity > 1000
  ) {
    return true;
  }
  
  return false;
}