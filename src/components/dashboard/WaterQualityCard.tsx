import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { cn } from '../../utils/cn';
import { analyzePotentialCauses } from '../../simulation/waterQualityAnalysis';
import { AlertCircle } from 'lucide-react';

interface WaterQualityCardProps {
  className?: string;
}

const WaterQualityCard: React.FC<WaterQualityCardProps> = ({ className }) => {
  const { waterQualityData, waterQualityLevel } = useSimulation();
  const [selectedParameter, setSelectedParameter] = useState<string | null>(null);
  
  // Get potential causes for water quality issues
  const potentialCauses = analyzePotentialCauses(waterQualityData);
  
  const parameters = [
    { 
      id: 'temperature', 
      name: 'Temperature', 
      value: waterQualityData.temperature.toFixed(1), 
      unit: '°C',
      description: 'Water temperature affects oxygen levels, metabolism of organisms, and overall ecosystem health.'
    },
    { 
      id: 'ph', 
      name: 'pH Level', 
      value: waterQualityData.ph.toFixed(2), 
      unit: '',
      description: 'pH measures acidity or alkalinity. Most aquatic organisms prefer pH between 6.5-8.5.'
    },
    { 
      id: 'dissolvedOxygen', 
      name: 'Dissolved Oxygen', 
      value: waterQualityData.dissolvedOxygen.toFixed(2), 
      unit: 'mg/L',
      description: 'Dissolved oxygen is crucial for aquatic life. Levels below 5 mg/L stress aquatic organisms.'
    },
    { 
      id: 'turbidity', 
      name: 'Turbidity', 
      value: waterQualityData.turbidity.toFixed(1), 
      unit: 'NTU',
      description: 'Turbidity measures water clarity. High values indicate suspended particles like silt, clay, algae.'
    },
    { 
      id: 'conductivity', 
      name: 'Conductivity', 
      value: waterQualityData.conductivity.toFixed(0), 
      unit: 'μS/cm',
      description: 'Conductivity indicates dissolved ions concentration. High values can indicate pollution.'
    }
  ];

  return (
    <div className={cn('card', className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Water Quality Parameters</h2>
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          waterQualityLevel === 'Good' ? 'bg-success-100 text-success-700' :
          waterQualityLevel === 'Fair' ? 'bg-warning-100 text-warning-700' :
          'bg-error-100 text-error-700'
        )}>
          {waterQualityLevel} Quality
        </div>
      </div>
      
      {potentialCauses.length > 0 && (
        <div className="mb-4 p-3 rounded-md bg-warning-50 border border-warning-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-warning-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-warning-800">Possible issues detected:</p>
              <ul className="mt-1 text-sm text-warning-700 pl-5 list-disc">
                {potentialCauses.map((cause, index) => (
                  <li key={index}>{cause}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {parameters.map((param) => (
          <div 
            key={param.id}
            onClick={() => setSelectedParameter(param.id === selectedParameter ? null : param.id)}
            className={cn(
              "p-3 rounded-md border cursor-pointer transition-all",
              param.id === selectedParameter 
                ? "border-primary-300 bg-primary-50 shadow-sm" 
                : "border-neutral-200 hover:border-primary-200 hover:bg-neutral-50"
            )}
          >
            <p className="text-sm font-medium text-neutral-600">{param.name}</p>
            <p className="text-xl font-bold text-neutral-900">
              {param.value}{param.unit && <span className="text-sm font-normal text-neutral-500 ml-1">{param.unit}</span>}
            </p>
            
            {param.id === selectedParameter && (
              <p className="mt-2 text-xs text-neutral-600">{param.description}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-neutral-500">
        <p>Last updated: {new Date(waterQualityData.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default WaterQualityCard;