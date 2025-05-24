import { DEFAULT_SIMULATION_CONFIG } from './config';

export interface SimulatedData {
  temperature: number;    // °C
  ph: number;             // pH units
  dissolvedOxygen: number; // mg/L
  turbidity: number;      // NTU (Nephelometric Turbidity Units)
  conductivity: number;   // μS/cm (microSiemens per centimeter)
  timestamp: string;      // ISO timestamp
}

/**
 * Generates realistic simulated water quality data
 */
export function generateSimulatedData(): SimulatedData {
  const config = DEFAULT_SIMULATION_CONFIG;
  
  // Add some random seasonal/time-based variation
  const now = new Date();
  const seasonalFactor = Math.sin((now.getMonth() + now.getDate() / 30) * (Math.PI / 6)); // Seasonal variation
  const dailyFactor = Math.sin((now.getHours() / 24) * 2 * Math.PI); // Daily variation
  
  // Generate random values within the specified ranges, influenced by the factors
  const temperature = generateValue(
    config.temperatureRange.min, 
    config.temperatureRange.max,
    seasonalFactor * 3  // Stronger seasonal influence on temperature
  );
  
  const ph = generateValue(
    config.phRange.min,
    config.phRange.max,
    dailyFactor * 0.3  // pH can vary slightly during the day
  );
  
  const dissolvedOxygen = generateValue(
    config.dissolvedOxygenRange.min,
    config.dissolvedOxygenRange.max,
    -dailyFactor * 1  // Dissolved oxygen often decreases during warmer parts of the day
  );
  
  const turbidity = generateValue(
    config.turbidityRange.min,
    config.turbidityRange.max,
    seasonalFactor * 5  // Turbidity can increase during rainy seasons
  );
  
  const conductivity = generateValue(
    config.conductivityRange.min,
    config.conductivityRange.max,
    seasonalFactor * 50  // Conductivity can vary with seasonal water composition
  );
  
  // Generate anomalies with a small probability
  const hasAnomaly = Math.random() < config.anomalyProbability;
  
  // If an anomaly is generated, modify one or more parameters significantly
  const finalData: SimulatedData = {
    temperature,
    ph,
    dissolvedOxygen,
    turbidity,
    conductivity,
    timestamp: now.toISOString(),
  };
  
  if (hasAnomaly) {
    // Select a random parameter to create anomaly
    const anomalyParameter = ['temperature', 'ph', 'dissolvedOxygen', 'turbidity', 'conductivity'][
      Math.floor(Math.random() * 5)
    ];
    
    // Create a significant deviation
    switch (anomalyParameter) {
      case 'temperature':
        finalData.temperature += (Math.random() > 0.5 ? 5 : -5);
        break;
      case 'ph':
        finalData.ph += (Math.random() > 0.5 ? 1.5 : -1.5);
        break;
      case 'dissolvedOxygen':
        finalData.dissolvedOxygen -= 3;  // Usually drops in pollution events
        break;
      case 'turbidity':
        finalData.turbidity += 15;  // Usually increases in pollution events
        break;
      case 'conductivity':
        finalData.conductivity += 200;  // Usually increases with dissolved solids
        break;
    }
  }
  
  return finalData;
}

/**
 * Helper to generate a value within a range with some influence factor
 */
function generateValue(min: number, max: number, influenceFactor: number = 0): number {
  // Calculate the influenced minimum and maximum
  const influencedMin = Math.max(min, min + influenceFactor);
  const influencedMax = Math.min(max, max + influenceFactor);
  
  // Generate random value
  const value = influencedMin + Math.random() * (influencedMax - influencedMin);
  
  // Return with appropriate precision
  return parseFloat(value.toFixed(2));
}