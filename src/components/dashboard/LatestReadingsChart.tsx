import React, { useState, useEffect, useRef } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSimulation } from '../../context/SimulationContext';
import { SimulatedData } from '../../simulation/dataGenerator';
import 'chart.js/auto';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Maximum number of data points to show
const MAX_DATA_POINTS = 20;

const LatestReadingsChart: React.FC = () => {
  const { waterQualityData, isSimulationRunning } = useSimulation();
  const [historicalData, setHistoricalData] = useState<SimulatedData[]>([]);
  const chartRef = useRef<ChartJS>(null);
  
  // Parameter selection
  const [selectedParams, setSelectedParams] = useState({
    temperature: true,
    ph: true,
    dissolvedOxygen: false,
    turbidity: false,
    conductivity: false,
  });
  
  // Add data to historical record when new data arrives
  useEffect(() => {
    setHistoricalData((prev) => {
      // Only add data if the timestamp is different
      if (prev.length === 0 || prev[prev.length - 1].timestamp !== waterQualityData.timestamp) {
        const newData = [...prev, waterQualityData];
        // Keep only the last MAX_DATA_POINTS
        return newData.slice(-MAX_DATA_POINTS);
      }
      return prev;
    });
  }, [waterQualityData]);

  // Format dates for the chart
  const labels = historicalData.map((data) => {
    const date = new Date(data.timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  // Define datasets based on selected parameters
  const datasets = [
    selectedParams.temperature && {
      label: 'Temperature (°C)',
      data: historicalData.map((data) => data.temperature),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      yAxisID: 'y',
    },
    selectedParams.ph && {
      label: 'pH',
      data: historicalData.map((data) => data.ph),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      yAxisID: 'y',
    },
    selectedParams.dissolvedOxygen && {
      label: 'Dissolved Oxygen (mg/L)',
      data: historicalData.map((data) => data.dissolvedOxygen),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      yAxisID: 'y',
    },
    selectedParams.turbidity && {
      label: 'Turbidity (NTU)',
      data: historicalData.map((data) => data.turbidity),
      borderColor: 'rgb(255, 159, 64)',
      backgroundColor: 'rgba(255, 159, 64, 0.5)',
      yAxisID: 'y',
    },
    selectedParams.conductivity && {
      label: 'Conductivity (μS/cm)',
      data: historicalData.map((data) => data.conductivity),
      borderColor: 'rgb(153, 102, 255)',
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      yAxisID: 'y1',
    },
  ].filter(Boolean);

  const data = {
    labels,
    datasets: datasets as any[],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Value',
        },
      },
      y1: {
        type: 'linear' as const,
        display: selectedParams.conductivity,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Conductivity (μS/cm)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
    animation: {
      duration: isSimulationRunning ? 0 : 1000, // Disable animation when simulation is running to avoid flickering
    },
  };

  // Toggle parameter selection
  const toggleParameter = (param: keyof typeof selectedParams) => {
    setSelectedParams({
      ...selectedParams,
      [param]: !selectedParams[param],
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1 text-xs rounded-full ${
            selectedParams.temperature ? 'bg-[rgb(255,99,132)] text-white' : 'bg-neutral-100 text-neutral-700'
          }`}
          onClick={() => toggleParameter('temperature')}
        >
          Temperature
        </button>
        <button
          className={`px-3 py-1 text-xs rounded-full ${
            selectedParams.ph ? 'bg-[rgb(53,162,235)] text-white' : 'bg-neutral-100 text-neutral-700'
          }`}
          onClick={() => toggleParameter('ph')}
        >
          pH
        </button>
        <button
          className={`px-3 py-1 text-xs rounded-full ${
            selectedParams.dissolvedOxygen ? 'bg-[rgb(75,192,192)] text-white' : 'bg-neutral-100 text-neutral-700'
          }`}
          onClick={() => toggleParameter('dissolvedOxygen')}
        >
          Dissolved Oxygen
        </button>
        <button
          className={`px-3 py-1 text-xs rounded-full ${
            selectedParams.turbidity ? 'bg-[rgb(255,159,64)] text-white' : 'bg-neutral-100 text-neutral-700'
          }`}
          onClick={() => toggleParameter('turbidity')}
        >
          Turbidity
        </button>
        <button
          className={`px-3 py-1 text-xs rounded-full ${
            selectedParams.conductivity ? 'bg-[rgb(153,102,255)] text-white' : 'bg-neutral-100 text-neutral-700'
          }`}
          onClick={() => toggleParameter('conductivity')}
        >
          Conductivity
        </button>
      </div>

      <div className="h-64 w-full">
        <Line ref={chartRef} options={options} data={data} />
      </div>
    </div>
  );
};

export default LatestReadingsChart;