import { WSNNode } from '../../types/node';

// LEACH Protocol simulation
// Low Energy Adaptive Clustering Hierarchy

export type LEACHSimulationResult = {
  rounds: LEACHRound[];
  metrics: {
    energyConsumption: number;
    networkLifetime: number; // rounds until first node dies
    dataDelivered: number;
    averageEnergy: number;
  };
};

export type LEACHRound = {
  roundNumber: number;
  clusterHeads: string[]; // IDs of cluster heads
  clusterMembers: Record<string, string[]>; // cluster head ID -> member IDs
  energyUsage: Record<string, number>; // node ID -> energy used
  nodesAlive: number;
  dataTransmitted: number;
};

export type LEACHConfig = {
  rounds: number;
  probabilityThreshold: number; // chance of becoming cluster head
  initialEnergy: number; // joules
  transmitEnergy: number; // joules per bit
  receiveEnergy: number; // joules per bit
  dataSize: number; // bits per message
};

export const DEFAULT_LEACH_CONFIG: LEACHConfig = {
  rounds: 20,
  probabilityThreshold: 0.2,
  initialEnergy: 2.0, // joules
  transmitEnergy: 0.000050, // joules per bit
  receiveEnergy: 0.000025, // joules per bit
  dataSize: 4000, // bits per message
};

// Simulate LEACH protocol
export function simulateLEACH(
  nodes: WSNNode[],
  config: LEACHConfig = DEFAULT_LEACH_CONFIG
): LEACHSimulationResult {
  const nodeEnergy: Record<string, number> = {};
  const rounds: LEACHRound[] = [];
  let totalEnergyConsumption = 0;
  let dataDelivered = 0;
  let networkDied = false;
  let networkLifetime = config.rounds;

  // Initialize energy levels
  nodes.forEach(node => {
    nodeEnergy[node.id] = config.initialEnergy;
  });

  // Run simulation for the specified number of rounds
  for (let round = 1; round <= config.rounds; round++) {
    // Skip simulation if network has died
    if (networkDied) {
      continue;
    }

    // Initialize data for this round
    const clusterHeads: string[] = [];
    const clusterMembers: Record<string, string[]> = {};
    const energyUsage: Record<string, number> = {};
    let roundDataTransmitted = 0;

    // Select cluster heads for this round based on probability
    nodes.forEach(node => {
      if (nodeEnergy[node.id] <= 0) return; // Skip dead nodes
      
      // Base station is never a cluster head
      if (node.type === 'base') return;

      // Random probability for cluster head selection
      const randomProb = Math.random();
      if (randomProb < config.probabilityThreshold) {
        clusterHeads.push(node.id);
        clusterMembers[node.id] = [];
      }
    });

    // If no cluster heads were selected, choose one randomly
    if (clusterHeads.length === 0) {
      const availableNodes = nodes
        .filter(node => nodeEnergy[node.id] > 0 && node.type !== 'base')
        .map(node => node.id);
      
      if (availableNodes.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableNodes.length);
        const selectedHead = availableNodes[randomIndex];
        clusterHeads.push(selectedHead);
        clusterMembers[selectedHead] = [];
      }
    }

    // Assign regular nodes to nearest cluster head
    nodes.forEach(node => {
      if (nodeEnergy[node.id] <= 0) return; // Skip dead nodes
      if (node.type === 'base') return; // Skip base station
      if (clusterHeads.includes(node.id)) return; // Skip cluster heads

      let minDistance = Infinity;
      let nearestHead = '';

      // Find nearest cluster head
      for (const headId of clusterHeads) {
        const head = nodes.find(n => n.id === headId)!;
        const distance = calculateDistance(node.position, head.position);
        if (distance < minDistance) {
          minDistance = distance;
          nearestHead = headId;
        }
      }

      // Assign to nearest cluster head
      if (nearestHead) {
        clusterMembers[nearestHead].push(node.id);
      }
    });

    // Calculate energy consumption for data transmission in this round
    // Energy model: Based on distance and data size

    // 1. Regular nodes send data to their cluster heads
    for (const headId of clusterHeads) {
      const memberIds = clusterMembers[headId];
      
      for (const memberId of memberIds) {
        const member = nodes.find(n => n.id === memberId)!;
        const head = nodes.find(n => n.id === headId)!;
        const distance = calculateDistance(member.position, head.position);
        
        // Calculate energy for transmission (increases with distance)
        const transmitCost = config.transmitEnergy * config.dataSize * (1 + 0.1 * distance);
        energyUsage[memberId] = (energyUsage[memberId] || 0) + transmitCost;
        nodeEnergy[memberId] -= transmitCost;
        
        // Cluster head spends energy receiving data
        const receiveCost = config.receiveEnergy * config.dataSize;
        energyUsage[headId] = (energyUsage[headId] || 0) + receiveCost;
        nodeEnergy[headId] -= receiveCost;
        
        roundDataTransmitted += config.dataSize;
      }
    }

    // 2. Cluster heads aggregate and send data to base station
    const baseStation = nodes.find(n => n.type === 'base')!;
    
    for (const headId of clusterHeads) {
      const head = nodes.find(n => n.id === headId)!;
      const distance = calculateDistance(head.position, baseStation.position);
      
      // Data aggregation (each head sends one aggregated message to base station)
      // Energy cost includes aggregation and long-distance transmission to base
      const memberCount = clusterMembers[headId].length;
      const aggregatedDataSize = config.dataSize * (0.5 + 0.5 * memberCount);
      
      // Calculate energy for transmission to base (higher cost due to longer distance)
      const transmitCost = config.transmitEnergy * aggregatedDataSize * (1 + 0.2 * distance);
      energyUsage[headId] = (energyUsage[headId] || 0) + transmitCost;
      nodeEnergy[headId] -= transmitCost;
      
      roundDataTransmitted += aggregatedDataSize;
    }

    // Count alive nodes for this round
    const nodesAlive = nodes.filter(node => nodeEnergy[node.id] > 0).length;
    
    // If this is the first round where a node died, record network lifetime
    if (nodesAlive < nodes.length && !networkDied) {
      networkLifetime = round;
      networkDied = true;
    }

    // Store the round results
    rounds.push({
      roundNumber: round,
      clusterHeads,
      clusterMembers,
      energyUsage,
      nodesAlive,
      dataTransmitted: roundDataTransmitted,
    });

    dataDelivered += roundDataTransmitted;

    // Calculate total energy consumed in this round
    for (const id in energyUsage) {
      totalEnergyConsumption += energyUsage[id];
    }
  }

  // Calculate average remaining energy
  let totalRemainingEnergy = 0;
  for (const id in nodeEnergy) {
    totalRemainingEnergy += nodeEnergy[id];
  }
  const averageEnergy = totalRemainingEnergy / nodes.length;

  return {
    rounds,
    metrics: {
      energyConsumption: totalEnergyConsumption,
      networkLifetime,
      dataDelivered,
      averageEnergy,
    },
  };
}

// Helper function to calculate Euclidean distance between two points
function calculateDistance(
  pos1: { lat: number; lng: number },
  pos2: { lat: number; lng: number }
): number {
  // Convert lat/lng to km (approximate)
  const latDiff = (pos1.lat - pos2.lat) * 111; // 1 degree of latitude is approximately 111 km
  const lngDiff = (pos1.lng - pos2.lng) * 111 * Math.cos(pos1.lat * (Math.PI / 180)); // Adjust for longitude
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}