import React from 'react';
import { AlertCircle, Battery, Droplets, ThermometerSun, BarChart3 } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import WaterQualityCard from '../components/dashboard/WaterQualityCard';
import SensorStatusCard from '../components/dashboard/SensorStatusCard';
import { cn } from '../utils/cn';
import LatestReadingsChart from '../components/dashboard/LatestReadingsChart';

const Dashboard: React.FC = () => {
  const { 
    nodes,
    waterQualityData,
    waterQualityLevel,
    isSimulationRunning
  } = useSimulation();

  // Count active and inactive nodes
  const activeNodes = nodes.filter(node => node.status === 'active').length;
  const warningNodes = nodes.filter(node => node.status === 'warning').length;
  const inactiveNodes = nodes.filter(node => node.status === 'inactive').length;

  // Get average battery level for active nodes
  const averageBatteryLevel = nodes.length > 0 
    ? nodes
        .filter(node => node.status !== 'inactive')
        .reduce((acc, node) => acc + node.batteryLevel, 0) / 
      (activeNodes + warningNodes || 1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">YangtzeSense Dashboard</h1>
        
        <div className={cn(
          "px-4 py-1 rounded-full text-sm font-medium",
          isSimulationRunning 
            ? "bg-success-100 text-success-700" 
            : "bg-neutral-100 text-neutral-600"
        )}>
          {isSimulationRunning ? 'Simulation Active' : 'Simulation Paused'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Water Quality Status */}
        <div className={cn(
          "card flex items-center",
          waterQualityLevel === 'Good' ? 'bg-success-50 border-success-200' :
          waterQualityLevel === 'Fair' ? 'bg-warning-50 border-warning-200' :
          'bg-error-50 border-error-200'
        )}>
          <div className={cn(
            "p-2 rounded-full mr-3",
            waterQualityLevel === 'Good' ? 'bg-success-100 text-success-600' :
            waterQualityLevel === 'Fair' ? 'bg-warning-100 text-warning-600' :
            'bg-error-100 text-error-600'
          )}>
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">Water Quality</p>
            <p className={cn(
              "text-xl font-bold",
              waterQualityLevel === 'Good' ? 'text-success-700' :
              waterQualityLevel === 'Fair' ? 'text-warning-700' :
              'text-error-700'
            )}>
              {waterQualityLevel}
            </p>
          </div>
        </div>

        {/* Temperature */}
        <div className="card flex items-center">
          <div className="p-2 bg-primary-100 text-primary-600 rounded-full mr-3">
            <ThermometerSun className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">Water Temperature</p>
            <p className="text-xl font-bold text-neutral-900">
              {waterQualityData.temperature.toFixed(1)}°C
            </p>
          </div>
        </div>

        {/* Node Status */}
        <div className="card flex items-center">
          <div className="p-2 bg-primary-100 text-primary-600 rounded-full mr-3">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">Active Nodes</p>
            <div className="flex items-center space-x-3">
              <p className="text-xl font-bold text-neutral-900">{activeNodes}/{nodes.length}</p>
              {warningNodes > 0 && (
                <span className="text-sm px-2 py-0.5 bg-warning-100 text-warning-700 rounded-full">
                  {warningNodes} warning
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Average Battery */}
        <div className="card flex items-center">
          <div className={cn(
            "p-2 rounded-full mr-3",
            averageBatteryLevel > 50 ? 'bg-success-100 text-success-600' :
            averageBatteryLevel > 20 ? 'bg-warning-100 text-warning-600' :
            'bg-error-100 text-error-600'
          )}>
            <Battery className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">Avg. Battery Level</p>
            <p className={cn(
              "text-xl font-bold",
              averageBatteryLevel > 50 ? 'text-success-700' :
              averageBatteryLevel > 20 ? 'text-warning-700' :
              'text-error-700'
            )}>
              {Math.round(averageBatteryLevel)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Quality Details */}
        <WaterQualityCard className="lg:col-span-2" />

        {/* Node Status */}
        <SensorStatusCard className="h-full" />
      </div>

      {/* Latest Readings Chart */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Latest Readings</h2>
        </div>
        <LatestReadingsChart />
      </div>
    </div>
  );
};

export default Dashboard;