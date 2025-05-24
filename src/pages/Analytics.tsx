import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useSimulation } from '../context/SimulationContext';
import { Calendar, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

const Analytics: React.FC = () => {
  const { waterQualityData, nodes } = useSimulation();
  
  // Mock historical data (in a real app, this would come from a database)
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month'>('week');
  
  // Generate some mock historical data for the selected time period
  const getMockHistoricalData = () => {
    const now = new Date();
    const data: any[] = [];
    
    let dataPoints = 0;
    let timeStep = 0;
    
    switch (dateRange) {
      case 'day':
        dataPoints = 24; // One point per hour
        timeStep = 60 * 60 * 1000; // 1 hour in milliseconds
        break;
      case 'week':
        dataPoints = 7; // One point per day
        timeStep = 24 * 60 * 60 * 1000; // 1 day in milliseconds
        break;
      case 'month':
        dataPoints = 30; // One point per day
        timeStep = 24 * 60 * 60 * 1000; // 1 day in milliseconds
        break;
    }
    
    // Generate data points going backward from now
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * timeStep));
      
      // Generate slightly varied data for temperature
      const temperature = 20 + Math.sin(i / 2) * 5 + (Math.random() * 2 - 1);
      
      // Generate pH data with small variations
      const ph = 7.5 + Math.sin(i / 3) * 0.5 + (Math.random() * 0.4 - 0.2);
      
      // Generate dissolved oxygen data that's inversely related to temperature
      const dissolvedOxygen = 8 - (temperature - 20) * 0.2 + Math.sin(i) + (Math.random() * 0.6 - 0.3);
      
      // Generate turbidity with occasional spikes
      let turbidity = 5 + Math.sin(i / 4) * 2 + (Math.random() * 1 - 0.5);
      if (i % 5 === 0) turbidity += 4; // Occasional spikes
      
      // Generate conductivity with a gentle upward trend
      const conductivity = 400 + i * 2 + Math.sin(i / 2) * 30 + (Math.random() * 20 - 10);
      
      data.push({
        timestamp: date,
        temperature,
        ph,
        dissolvedOxygen,
        turbidity,
        conductivity
      });
    }
    
    return data;
  };
  
  const historicalData = getMockHistoricalData();
  
  // Format date labels based on selected range
  const formatDateLabel = (date: Date) => {
    switch (dateRange) {
      case 'day':
        return format(date, 'HH:mm');
      case 'week':
        return format(date, 'EEE');
      case 'month':
        return format(date, 'MMM d');
    }
  };
  
  // Temperature trend data
  const temperatureData = {
    labels: historicalData.map(d => formatDateLabel(d.timestamp)),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: historicalData.map(d => d.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.2,
      }
    ]
  };
  
  // pH trend data
  const phData = {
    labels: historicalData.map(d => formatDateLabel(d.timestamp)),
    datasets: [
      {
        label: 'pH Level',
        data: historicalData.map(d => d.ph),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.2,
      }
    ]
  };
  
  // Dissolved oxygen trend data
  const dissolvedOxygenData = {
    labels: historicalData.map(d => formatDateLabel(d.timestamp)),
    datasets: [
      {
        label: 'Dissolved Oxygen (mg/L)',
        data: historicalData.map(d => d.dissolvedOxygen),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.2,
      }
    ]
  };
  
  // Turbidity trend data
  const turbidityData = {
    labels: historicalData.map(d => formatDateLabel(d.timestamp)),
    datasets: [
      {
        label: 'Turbidity (NTU)',
        data: historicalData.map(d => d.turbidity),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.2,
      }
    ]
  };
  
  // Correlation analysis - showing how temperature affects dissolved oxygen
  const correlationData = {
    labels: historicalData.map(d => d.temperature.toFixed(1)),
    datasets: [
      {
        label: 'Temperature vs. Dissolved Oxygen',
        data: historicalData.map((d, index) => ({
          x: d.temperature,
          y: d.dissolvedOxygen,
        })),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };
  
  // Node battery analysis
  const batteryData = {
    labels: nodes.map(node => node.name),
    datasets: [
      {
        label: 'Battery Level (%)',
        data: nodes.map(node => node.batteryLevel),
        backgroundColor: nodes.map(node => 
          node.batteryLevel > 50 ? 'rgba(75, 192, 192, 0.5)' :
          node.batteryLevel > 20 ? 'rgba(255, 159, 64, 0.5)' :
          'rgba(255, 99, 132, 0.5)'
        ),
        borderColor: nodes.map(node => 
          node.batteryLevel > 50 ? 'rgb(75, 192, 192)' :
          node.batteryLevel > 20 ? 'rgb(255, 159, 64)' :
          'rgb(255, 99, 132)'
        ),
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Data Analytics</h1>
        
        <div className="flex space-x-2">
          <div className="flex border border-neutral-300 rounded-md overflow-hidden">
            <button 
              className={`px-3 py-1.5 text-sm font-medium ${dateRange === 'day' ? 'bg-primary-100 text-primary-800' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
              onClick={() => setDateRange('day')}
            >
              Day
            </button>
            <button 
              className={`px-3 py-1.5 text-sm font-medium ${dateRange === 'week' ? 'bg-primary-100 text-primary-800' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
              onClick={() => setDateRange('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1.5 text-sm font-medium ${dateRange === 'month' ? 'bg-primary-100 text-primary-800' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
              onClick={() => setDateRange('month')}
            >
              Month
            </button>
          </div>
          
          <button className="btn btn-outline flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </button>
          
          <button className="btn btn-outline flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Temperature Trend</h2>
          <div className="h-64">
            <Line 
              data={temperatureData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: 'Temperature (°C)'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">pH Trend</h2>
          <div className="h-64">
            <Line 
              data={phData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: 'pH'
                    },
                    min: 6,
                    max: 9
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Dissolved Oxygen Trend</h2>
          <div className="h-64">
            <Line 
              data={dissolvedOxygenData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: 'DO (mg/L)'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Turbidity Trend</h2>
          <div className="h-64">
            <Line 
              data={turbidityData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: 'Turbidity (NTU)'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Parameter Correlation Analysis</h2>
            <div className="flex items-center text-sm text-neutral-500">
              <Filter className="h-4 w-4 mr-1" />
              <span>Temperature vs. Dissolved Oxygen</span>
            </div>
          </div>
          <div className="h-64">
            <Line 
              data={correlationData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                      display: true,
                      text: 'Temperature (°C)'
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Dissolved Oxygen (mg/L)'
                    }
                  }
                }
              }} 
            />
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            The scatter plot shows the inverse relationship between temperature and dissolved oxygen levels.
            As water temperature increases, its capacity to hold dissolved oxygen decreases.
          </p>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Node Battery Analysis</h2>
          <div className="h-64">
            <Bar 
              data={batteryData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: 'Battery Level (%)'
                    },
                    min: 0,
                    max: 100
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Statistical Summary</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Mean
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Min
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Max
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Standard Deviation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  Temperature (°C)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {waterQualityData.temperature.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {(historicalData.reduce((sum, d) => sum + d.temperature, 0) / historicalData.length).toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {Math.min(...historicalData.map(d => d.temperature)).toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {Math.max(...historicalData.map(d => d.temperature)).toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {calculateStdDev(historicalData.map(d => d.temperature)).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  pH
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {waterQualityData.ph.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {(historicalData.reduce((sum, d) => sum + d.ph, 0) / historicalData.length).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {Math.min(...historicalData.map(d => d.ph)).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {Math.max(...historicalData.map(d => d.ph)).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {calculateStdDev(historicalData.map(d => d.ph)).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  Dissolved Oxygen (mg/L)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {waterQualityData.dissolvedOxygen.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {(historicalData.reduce((sum, d) => sum + d.dissolvedOxygen, 0) / historicalData.length).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {Math.min(...historicalData.map(d => d.dissolvedOxygen)).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {Math.max(...historicalData.map(d => d.dissolvedOxygen)).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {calculateStdDev(historicalData.map(d => d.dissolvedOxygen)).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  Turbidity (NTU)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {waterQualityData.turbidity.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {(historicalData.reduce((sum, d) => sum + d.turbidity, 0) / historicalData.length).toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {Math.min(...historicalData.map(d => d.turbidity)).toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {Math.max(...historicalData.map(d => d.turbidity)).toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {calculateStdDev(historicalData.map(d => d.turbidity)).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  Conductivity (μS/cm)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {waterQualityData.conductivity.toFixed(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {(historicalData.reduce((sum, d) => sum + d.conductivity, 0) / historicalData.length).toFixed(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {Math.min(...historicalData.map(d => d.conductivity)).toFixed(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {Math.max(...historicalData.map(d => d.conductivity)).toFixed(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {calculateStdDev(historicalData.map(d => d.conductivity)).toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate standard deviation
function calculateStdDev(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

export default Analytics;