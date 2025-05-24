import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Save, AlertTriangle, Info } from 'lucide-react';

const Settings: React.FC = () => {
  const { simulationConfig, updateSimulationConfig } = useSimulation();
  const [localConfig, setLocalConfig] = useState({ ...simulationConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setLocalConfig(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateSimulationConfig(localConfig);
    setSaveSuccess(true);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Simulation Settings</h1>
        
        <button 
          onClick={handleSave}
          className="btn btn-primary flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-success-50 border border-success-200 rounded-md text-success-700 flex items-center">
          <Info className="h-5 w-5 mr-2 text-success-500" />
          Settings saved successfully!
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Simulation Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Update Interval (ms)
              </label>
              <input 
                type="number" 
                name="updateInterval"
                className="input"
                value={localConfig.updateInterval}
                onChange={handleChange}
                min="1000"
                max="10000"
                step="500"
              />
              <p className="mt-1 text-xs text-neutral-500">
                How frequently the simulation updates (in milliseconds)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Initial Node Count
              </label>
              <input 
                type="number" 
                name="initialNodeCount"
                className="input"
                value={localConfig.initialNodeCount}
                onChange={handleChange}
                min="3"
                max="20"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Number of sensor nodes to simulate (between 3 and 20)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Battery Drain Rate (% per update)
              </label>
              <input 
                type="number" 
                name="batteryDrainRate"
                className="input"
                value={localConfig.batteryDrainRate}
                onChange={handleChange}
                min="0.1"
                max="5"
                step="0.1"
              />
              <p className="mt-1 text-xs text-neutral-500">
                How quickly node batteries drain (percentage per update interval)
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Routing Algorithm
              </label>
              <select 
                name="routingAlgorithm"
                className="select"
                value={localConfig.routingAlgorithm}
                onChange={handleSelectChange}
              >
                <option value="LEACH">LEACH</option>
                <option value="PEGASIS">PEGASIS</option>
              </select>
              <p className="mt-1 text-xs text-neutral-500">
                The routing algorithm used by the simulated WSN
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Cluster Head Percentage (LEACH)
              </label>
              <input 
                type="number" 
                name="clusterHeadPercentage"
                className="input"
                value={localConfig.clusterHeadPercentage}
                onChange={handleChange}
                min="0.05"
                max="0.5"
                step="0.05"
                disabled={localConfig.routingAlgorithm !== 'LEACH'}
              />
              <p className="mt-1 text-xs text-neutral-500">
                Percentage of nodes that become cluster heads (LEACH only)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Anomaly Probability
              </label>
              <input 
                type="number" 
                name="anomalyProbability"
                className="input"
                value={localConfig.anomalyProbability}
                onChange={handleChange}
                min="0"
                max="0.5"
                step="0.01"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Probability of generating anomalous sensor readings (0-0.5)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Sensor Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium mb-3">Water Quality Ranges</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Temperature Range (°C)
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    name="temperatureRangeMin"
                    className="input"
                    value={localConfig.temperatureRange.min}
                    onChange={(e) => setLocalConfig(prev => ({
                      ...prev,
                      temperatureRange: {
                        ...prev.temperatureRange,
                        min: parseFloat(e.target.value)
                      }
                    }))}
                    min="0"
                    max="40"
                  />
                  <span className="flex items-center">to</span>
                  <input 
                    type="number" 
                    name="temperatureRangeMax"
                    className="input"
                    value={localConfig.temperatureRange.max}
                    onChange={(e) => setLocalConfig(prev => ({
                      ...prev,
                      temperatureRange: {
                        ...prev.temperatureRange,
                        max: parseFloat(e.target.value)
                      }
                    }))}
                    min="0"
                    max="40"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  pH Range
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    name="phRangeMin"
                    className="input"
                    value={localConfig.phRange.min}
                    onChange={(e) => setLocalConfig(prev => ({
                      ...prev,
                      phRange: {
                        ...prev.phRange,
                        min: parseFloat(e.target.value)
                      }
                    }))}
                    min="0"
                    max="14"
                    step="0.1"
                  />
                  <span className="flex items-center">to</span>
                  <input 
                    type="number" 
                    name="phRangeMax"
                    className="input"
                    value={localConfig.phRange.max}
                    onChange={(e) => setLocalConfig(prev => ({
                      ...prev,
                      phRange: {
                        ...prev.phRange,
                        max: parseFloat(e.target.value)
                      }
                    }))}
                    min="0"
                    max="14"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dissolved Oxygen Range (mg/L)
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    name="dissolvedOxygenRangeMin"
                    className="input"
                    value={localConfig.dissolvedOxygenRange.min}
                    onChange={(e) => setLocalConfig(prev => ({
                      ...prev,
                      dissolvedOxygenRange: {
                        ...prev.dissolvedOxygenRange,
                        min: parseFloat(e.target.value)
                      }
                    }))}
                    min="0"
                    max="20"
                    step="0.1"
                  />
                  <span className="flex items-center">to</span>
                  <input 
                    type="number" 
                    name="dissolvedOxygenRangeMax"
                    className="input"
                    value={localConfig.dissolvedOxygenRange.max}
                    onChange={(e) => setLocalConfig(prev => ({
                      ...prev,
                      dissolvedOxygenRange: {
                        ...prev.dissolvedOxygenRange,
                        max: parseFloat(e.target.value)
                      }
                    }))}
                    min="0"
                    max="20"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-3">Power Consumption</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Transmission Power (watts)
                </label>
                <input 
                  type="number" 
                  name="transmissionPower"
                  className="input"
                  value={localConfig.transmissionPower}
                  onChange={handleChange}
                  min="0.1"
                  max="2"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Receive Power (watts)
                </label>
                <input 
                  type="number" 
                  name="receivePower"
                  className="input"
                  value={localConfig.receivePower}
                  onChange={handleChange}
                  min="0.01"
                  max="1"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Idle Power (watts)
                </label>
                <input 
                  type="number" 
                  name="idlePower"
                  className="input"
                  value={localConfig.idlePower}
                  onChange={handleChange}
                  min="0.001"
                  max="0.5"
                  step="0.001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Sleep Power (watts)
                </label>
                <input 
                  type="number" 
                  name="sleepPower"
                  className="input"
                  value={localConfig.sleepPower}
                  onChange={handleChange}
                  min="0.0001"
                  max="0.1"
                  step="0.0001"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-md flex">
          <AlertTriangle className="h-5 w-5 text-warning-500 mr-3 flex-shrink-0" />
          <div className="text-sm text-warning-700">
            <p className="font-medium">Please note:</p>
            <p>Changing some settings may reset the sensor network. Make sure to save your changes before running a new simulation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;