import { WSNNode } from '../../types/node';

// PEGASIS Protocol simulation
// Power-Efficient GAthering in Sensor Information Systems

export type PEGASISSimulationResult = {
  rounds: PEGASISRound[];
  metrics: {
    energyConsumption: number;
    networkLifetime: number; // rounds until first node dies
    dataDelivered: number;
    averageEnergy: number;
  };
};

export type PEGASISRound = {
  roundNumber: number;
  chain: string[]; // Ordered array of node IDs in the chain
  leader: string; // ID of the leader node for this round
  energyUsage: Record<string, number>; // node ID -> energy used
  nodesAlive: number;
  dataTransmitted: number;
};

export type PEGASISConfig = {
  rounds: number;
  initialEnergy: number; // joules
  transmitEnergy: number; // joules per bit
  receiveEnergy: number; // joules per bit
  dataSize: number; // bits per message
  leaderSelectionMethod: 'roundRobin' | 'energyBased';
};

export const DEFAULT_PEGASIS_CONFIG: PEGASISConfig = {
  rounds: 20,
  initialEnergy: 2.0, // joules
  transmitEnergy: 0.000050, // joules per bit
  receiveEnergy: 0.000025, // joules per bit
  dataSize: 4000, // bits per message
  leaderSelectionMethod: 'roundRobin',
};

// Simulate PEGASIS protocol
export function simulatePEGASIS(
  nodes: WSNNode[],
  config: PEGASISConfig = DEFAULT_PEGASIS_CONFIG
): PEGASISSimulationResult {
  const nodeEnergy: Record<string, number> = {};
  const rounds: PEGASISRound[] = [];
  let totalEnergyConsumption = 0;
  let dataDelivered = 0;
  let networkDied = false;
  let networkLifetime = config.rounds;

  // Initialize energy levels
  nodes.forEach(node => {
    nodeEnergy[node.id] = config.initialEnergy;
  });

  // Find base station
  const baseStation = nodes.find(node => node.type === 'base');
  const sensorNodes = nodes.filter(node => node.type !== 'base');

  // Construct a chain using a greedy algorithm (nearest neighbor)
  const chain = constructGreedyChain(sensorNodes);

  // Run simulation for the specified number of rounds
  for (let round = 1; round <= config.rounds; round++) {
    // Skip simulation if network has died
    if (networkDied) {
      continue;
    }

    // Initialize data for this round
    const energyUsage: Record<string, number> = {};
    let roundDataTransmitted = 0;

    // Select a leader for this round
    let leader: string;
    if (config.leaderSelectionMethod === 'roundRobin') {
      // Simple round-robin leader selection
      const index = (round - 1) % chain.length;
      leader = chain[index];
    } else {
      // Energy-based leader selection (choose the node with highest energy)
      leader = chain.reduce((maxId, nodeId) => {
        if (nodeEnergy[nodeId] > nodeEnergy[maxId]) {
          return nodeId;
        }
        return maxId;
      }, chain[0]);
    }

    // Data gathering phase (chain-based routing)
    // Data flows bi-directionally from the ends of the chain towards the leader
    
    // Find the leader's position in the chain
    const leaderIndex = chain.indexOf(leader);
    
    // Left side of the chain (from start to leader)
    for (let i = 0; i < leaderIndex; i++) {
      const senderId = chain[i];
      const receiverId = chain[i + 1];
      
      // Skip if sender node is dead
      if (nodeEnergy[senderId] <= 0) continue;
      
      const sender = nodes.find(n => n.id === senderId)!;
      const receiver = nodes.find(n => n.id === receiverId)!;
      
      const distance = calculateDistance(sender.position, receiver.position);
      
      // Calculate energy for transmission (increases with distance)
      const transmitCost = config.transmitEnergy * config.dataSize * (1 + 0.1 * distance);
      energyUsage[senderId] = (energyUsage[senderId] || 0) + transmitCost;
      nodeEnergy[senderId] -= transmitCost;
      
      // Skip energy usage for receiver if it's dead
      if (nodeEnergy[receiverId] <= 0) continue;
      
      // Receiver spends energy receiving data
      const receiveCost = config.receiveEnergy * config.dataSize;
      energyUsage[receiverId] = (energyUsage[receiverId] || 0) + receiveCost;
      nodeEnergy[receiverId] -= receiveCost;
      
      roundDataTransmitted += config.dataSize;
    }
    
    // Right side of the chain (from end to leader)
    for (let i = chain.length - 1; i > leaderIndex; i--) {
      const senderId = chain[i];
      const receiverId = chain[i - 1];
      
      // Skip if sender node is dead
      if (nodeEnergy[senderId] <= 0) continue;
      
      const sender = nodes.find(n => n.id === senderId)!;
      const receiver = nodes.find(n => n.id === receiverId)!;
      
      const distance = calculateDistance(sender.position, receiver.position);
      
      // Calculate energy for transmission
      const transmitCost = config.transmitEnergy * config.dataSize * (1 + 0.1 * distance);
      energyUsage[senderId] = (energyUsage[senderId] || 0) + transmitCost;
      nodeEnergy[senderId] -= transmitCost;
      
      // Skip energy usage for receiver if it's dead
      if (nodeEnergy[receiverId] <= 0) continue;
      
      // Receiver spends energy receiving data
      const receiveCost = config.receiveEnergy * config.dataSize;
      energyUsage[receiverId] = (energyUsage[receiverId] || 0) + receiveCost;
      nodeEnergy[receiverId] -= receiveCost;
      
      roundDataTransmitted += config.dataSize;
    }
    
    // Leader aggregates data and sends it to the base station
    if (baseStation && nodeEnergy[leader] > 0) {
      const leaderNode = nodes.find(n => n.id === leader)!;
      const distance = calculateDistance(leaderNode.position, baseStation.position);
      
      // Data aggregation by the leader
      const aggregatedDataSize = config.dataSize * 0.8; // Some compression in aggregation
      
      // Calculate energy for transmission to base (higher cost due to longer distance)
      const transmitCost = config.transmitEnergy * aggregatedDataSize * (1 + 0.2 * distance);
      energyUsage[leader] = (energyUsage[leader] || 0) + transmitCost;
      nodeEnergy[leader] -= transmitCost;
      
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
      chain: [...chain], // Make a copy of the chain
      leader,
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

// Helper function to construct a greedy chain
function constructGreedyChain(nodes: WSNNode[]): string[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) return [nodes[0].id];
  
  const chain: string[] = [];
  const nodesCopy = [...nodes];
  
  // Start with a random node
  let currentNode = nodesCopy.shift()!;
  chain.push(currentNode.id);
  
  // Greedily construct chain by finding nearest neighbor
  while (nodesCopy.length > 0) {
    let nearestIndex = 0;
    let minDistance = calculateDistance(currentNode.position, nodesCopy[0].position);
    
    // Find nearest unvisited node
    for (let i = 1; i < nodesCopy.length; i++) {
      const distance = calculateDistance(currentNode.position, nodesCopy[i].position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    
    // Add nearest node to chain
    currentNode = nodesCopy[nearestIndex];
    chain.push(currentNode.id);
    
    // Remove the visited node
    nodesCopy.splice(nearestIndex, 1);
  }
  
  return chain;
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