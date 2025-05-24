import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateSimulatedData, SimulatedData } from '../simulation/dataGenerator';
import { WaterQualityLevel, analyzeWaterQuality } from '../simulation/waterQualityAnalysis';
import { WSNNode } from '../types/node';
import { DEFAULT_SIMULATION_CONFIG } from '../simulation/config';

interface SimulationContextType {
  nodes: WSNNode[];
  waterQualityData: SimulatedData;
  waterQualityLevel: WaterQualityLevel;
  simulationConfig: typeof DEFAULT_SIMULATION_CONFIG;
  isSimulationRunning: boolean;
  toggleSimulation: () => void;
  updateSimulationConfig: (config: Partial<typeof DEFAULT_SIMULATION_CONFIG>) => void;
  addNode: () => void;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, lat: number, lng: number) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<WSNNode[]>([]);
  const [waterQualityData, setWaterQualityData] = useState<SimulatedData>({
    temperature: 0,
    ph: 0,
    dissolvedOxygen: 0,
    turbidity: 0,
    conductivity: 0,
    timestamp: new Date().toISOString(),
  });
  const [waterQualityLevel, setWaterQualityLevel] = useState<WaterQualityLevel>('Good');
  const [simulationConfig, setSimulationConfig] = useState(DEFAULT_SIMULATION_CONFIG);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);

  // Initialize nodes
  useEffect(() => {
    // Create initial nodes for Yangtze River in Nanjing
    const initialNodes: WSNNode[] = Array.from({ length: simulationConfig.initialNodeCount }).map((_, index) => {
      // Generate positions around Nanjing section of Yangtze River
      // Base coordinates for Nanjing Yangtze River section: around 32.05N, 118.78E
      const baseLatitude = 32.05;
      const baseLongitude = 118.78;
      
      // Randomly distribute nodes along the river (with small variations)
      const latitude = baseLatitude + (Math.random() * 0.05 - 0.025);
      const longitude = baseLongitude + (Math.random() * 0.1 - 0.05);
      
      return {
        id: `node-${index + 1}`,
        name: `Node ${index + 1}`,
        batteryLevel: 100,
        status: 'active',
        position: { lat: latitude, lng: longitude },
        lastReading: new Date().toISOString(),
        type: index === 0 ? 'base' : 'sensor',
        energyUsage: [],
      };
    });
    
    setNodes(initialNodes);
  }, [simulationConfig.initialNodeCount]);

  // Simulate data generation
  const runSimulation = useCallback(() => {
    if (!isSimulationRunning) return;

    // Generate new water quality data
    const newData = generateSimulatedData();
    setWaterQualityData(newData);
    
    // Analyze water quality
    const quality = analyzeWaterQuality(newData);
    setWaterQualityLevel(quality);
    
    // Update node status and battery levels
    setNodes(currentNodes => 
      currentNodes.map(node => {
        // Simulate battery drain based on node activity
        const batteryDrain = Math.random() * simulationConfig.batteryDrainRate;
        const newBatteryLevel = Math.max(0, node.batteryLevel - batteryDrain);
        
        // Track energy usage
        const now = new Date();
        const energyUsage = [...node.energyUsage, {
          timestamp: now.toISOString(),
          value: batteryDrain
        }];
        
        // Limit history to prevent memory issues
        if (energyUsage.length > 100) {
          energyUsage.shift();
        }
        
        // Determine node status based on battery and random factors
        let status: 'active' | 'inactive' | 'warning' = 'active';
        if (newBatteryLevel <= 0) {
          status = 'inactive';
        } else if (newBatteryLevel < 20) {
          status = 'warning';
        } else if (Math.random() < 0.05) {
          // 5% chance of temporary connection issues
          status = 'warning';
        }
        
        return {
          ...node,
          batteryLevel: newBatteryLevel,
          status,
          lastReading: new Date().toISOString(),
          energyUsage,
        };
      })
    );
  }, [isSimulationRunning, simulationConfig.batteryDrainRate]);

  // Start/stop simulation
  useEffect(() => {
    if (isSimulationRunning) {
      // Run once immediately
      runSimulation();
      
      // Then set interval
      const interval = setInterval(
        runSimulation, 
        simulationConfig.updateInterval
      );
      setSimulationInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
  }, [isSimulationRunning, runSimulation, simulationConfig.updateInterval]);

  const toggleSimulation = () => {
    setIsSimulationRunning(prev => !prev);
  };

  const updateSimulationConfig = (config: Partial<typeof DEFAULT_SIMULATION_CONFIG>) => {
    setSimulationConfig(prev => ({ ...prev, ...config }));
  };

  const addNode = () => {
    // Find the next available node number
    const nodeNumbers = nodes.map(n => {
      const match = n.id.match(/node-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const nextNodeNumber = Math.max(...nodeNumbers, 0) + 1;
    
    // Base coordinates for Nanjing Yangtze River section
    const baseLatitude = 32.05;
    const baseLongitude = 118.78;
    
    // Randomly distribute new node along the river
    const latitude = baseLatitude + (Math.random() * 0.05 - 0.025);
    const longitude = baseLongitude + (Math.random() * 0.1 - 0.05);
    
    const newNode: WSNNode = {
      id: `node-${nextNodeNumber}`,
      name: `Node ${nextNodeNumber}`,
      batteryLevel: 100,
      status: 'active',
      position: { lat: latitude, lng: longitude },
      lastReading: new Date().toISOString(),
      type: 'sensor',
      energyUsage: [],
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(node => node.id !== id));
  };

  const updateNodePosition = (id: string, lat: number, lng: number) => {
    setNodes(prev => 
      prev.map(node => 
        node.id === id 
          ? { ...node, position: { lat, lng } } 
          : node
      )
    );
  };

  const contextValue: SimulationContextType = {
    nodes,
    waterQualityData,
    waterQualityLevel,
    simulationConfig,
    isSimulationRunning,
    toggleSimulation,
    updateSimulationConfig,
    addNode,
    removeNode,
    updateNodePosition,
  };

  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};