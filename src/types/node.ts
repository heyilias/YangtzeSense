export interface WSNNode {
  id: string;
  name: string;
  batteryLevel: number; // 0-100
  status: 'active' | 'inactive' | 'warning';
  position: {
    lat: number;
    lng: number;
  };
  lastReading: string; // ISO timestamp
  type: 'sensor' | 'base' | 'relay';
  energyUsage: Array<{
    timestamp: string;
    value: number;
  }>;
}