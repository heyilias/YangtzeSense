import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { cn } from '../../utils/cn';
import { formatDistanceToNow } from 'date-fns';

interface SensorStatusCardProps {
  className?: string;
}

const SensorStatusCard: React.FC<SensorStatusCardProps> = ({ className }) => {
  const { nodes } = useSimulation();

  // Function to get battery status class
  const getBatteryStatusClass = (level: number) => {
    if (level > 50) return 'bg-success-100 text-success-700';
    if (level > 20) return 'bg-warning-100 text-warning-700';
    return 'bg-error-100 text-error-700';
  };

  // Function to get node status class
  const getNodeStatusClass = (status: string) => {
    if (status === 'active') return 'bg-success-100 text-success-700';
    if (status === 'warning') return 'bg-warning-100 text-warning-700';
    return 'bg-error-100 text-error-700';
  };

  // Sort nodes by status (active first, then warning, then inactive)
  const sortedNodes = [...nodes].sort((a, b) => {
    const statusPriority = { active: 0, warning: 1, inactive: 2 };
    return statusPriority[a.status] - statusPriority[b.status];
  });

  return (
    <div className={cn('card', className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Sensor Status</h2>
        <span className="text-sm text-neutral-500">{nodes.length} nodes total</span>
      </div>

      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '400px' }}>
        {sortedNodes.map((node) => (
          <div 
            key={node.id}
            className={cn(
              "p-3 rounded-md border border-neutral-200 flex justify-between items-center",
              node.status === 'inactive' ? 'bg-neutral-50 opacity-70' : ''
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full",
                node.status === 'active' ? 'bg-success-500' :
                node.status === 'warning' ? 'bg-warning-500' :
                'bg-neutral-300'
              )} />
              <div>
                <p className="font-medium">{node.name}</p>
                <p className="text-xs text-neutral-500">
                  Last update: {formatDistanceToNow(new Date(node.lastReading), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                getNodeStatusClass(node.status)
              )}>
                {node.status === 'active' ? 'Active' : 
                 node.status === 'warning' ? 'Warning' : 'Inactive'}
              </span>
              
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                getBatteryStatusClass(node.batteryLevel)
              )}>
                {Math.round(node.batteryLevel)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorStatusCard;