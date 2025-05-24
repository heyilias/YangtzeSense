export const DEFAULT_SIMULATION_CONFIG = {
  // Simulation parameters
  initialNodeCount: 8,
  updateInterval: 3000, // milliseconds
  batteryDrainRate: 0.3, // percentage per interval
  
  // Water quality parameters
  temperatureRange: { min: 15, max: 28 }, // °C
  phRange: { min: 6.0, max: 9.0 }, // pH units
  dissolvedOxygenRange: { min: 5, max: 14 }, // mg/L
  turbidityRange: { min: 0, max: 30 }, // NTU
  conductivityRange: { min: 300, max: 800 }, // μS/cm
  
  // Routing algorithm parameters
  routingAlgorithm: 'LEACH' as 'LEACH' | 'PEGASIS',
  roundInterval: 10, // seconds
  clusterHeadPercentage: 0.2, // for LEACH
  
  // Anomaly generation
  anomalyProbability: 0.05, // probability of generating anomalous data
  
  // Sensor node settings
  transmissionPower: 0.5, // watts
  receivePower: 0.1, // watts
  idlePower: 0.05, // watts
  sleepPower: 0.001, // watts
};

// Thresholds for water quality classification
export const WATER_QUALITY_THRESHOLDS = {
  // Optimal water quality parameters
  GOOD: {
    temperature: { min: 15, max: 25 },
    ph: { min: 6.5, max: 8.5 },
    dissolvedOxygen: { min: 8, max: 14 },
    turbidity: { min: 0, max: 5 },
    conductivity: { min: 300, max: 500 },
  },
  
  // Acceptable water quality parameters
  FAIR: {
    temperature: { min: 10, max: 28 },
    ph: { min: 6.0, max: 9.0 },
    dissolvedOxygen: { min: 6, max: 14 },
    turbidity: { min: 5, max: 10 },
    conductivity: { min: 200, max: 600 },
  },
  
  // Poor water quality parameters - outside these ranges is considered "Poor"
  POOR: {
    temperature: { min: 5, max: 32 },
    ph: { min: 5.5, max: 9.5 },
    dissolvedOxygen: { min: 5, max: 14 },
    turbidity: { min: 0, max: 15 },
    conductivity: { min: 100, max: 800 },
  },
};