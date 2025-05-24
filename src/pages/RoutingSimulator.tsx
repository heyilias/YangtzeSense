import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Line, Bar } from 'react-chartjs-2';
import { simulateLEACH, DEFAULT_LEACH_CONFIG, LEACHSimulationResult } from '../simulation/routingAlgorithms/leach';
import { simulatePEGASIS, DEFAULT_PEGASIS_CONFIG, PEGASISSimulationResult } from '../simulation/routingAlgorithms/pegasis';
import { Play, PauseCircle, RefreshCw, Database, GitMerge, DownloadCloud, HelpCircle, X } from 'lucide-react';

const RoutingSimulator: React.FC = () => {
  const { nodes } = useSimulation();
  const [algorithm, setAlgorithm] = useState<'LEACH' | 'PEGASIS'>('LEACH');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [leachConfig, setLeachConfig] = useState(DEFAULT_LEACH_CONFIG);
  const [pegasisConfig, setPegasisConfig] = useState(DEFAULT_PEGASIS_CONFIG);
  const [leachResults, setLeachResults] = useState<LEACHSimulationResult | null>(null);
  const [pegasisResults, setPegasisResults] = useState<PEGASISSimulationResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Start simulation
  const startSimulation = () => {
    setIsSimulating(true);
    setCurrentRound(1);
    
    // Run the appropriate algorithm simulation
    if (algorithm === 'LEACH') {
      const results = simulateLEACH(nodes, leachConfig);
      setLeachResults(results);
    } else {
      const results = simulatePEGASIS(nodes, pegasisConfig);
      setPegasisResults(results);
    }
  };
  
  // Pause simulation
  const pauseSimulation = () => {
    setIsSimulating(false);
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentRound(1);
    setLeachResults(null);
    setPegasisResults(null);
  };
  
  // Run comparison
  const runComparison = () => {
    // Run both algorithms and compare results
    const leachResults = simulateLEACH(nodes, leachConfig);
    const pegasisResults = simulatePEGASIS(nodes, pegasisConfig);
    
    setLeachResults(leachResults);
    setPegasisResults(pegasisResults);
    setShowComparison(true);
  };
  
  // Update round if simulation is running
  useEffect(() => {
    if (!isSimulating) return;
    
    const maxRounds = algorithm === 'LEACH' 
      ? leachConfig.rounds 
      : pegasisConfig.rounds;
    
    if (currentRound < maxRounds) {
      const timer = setTimeout(() => {
        setCurrentRound(prev => prev + 1);
      }, 500); // Advance one round every 500ms
      
      return () => clearTimeout(timer);
    } else {
      setIsSimulating(false);
    }
  }, [isSimulating, currentRound, algorithm, leachConfig.rounds, pegasisConfig.rounds]);
  
  // Export simulation results as CSV
  const exportResults = () => {
    if (!leachResults && !pegasisResults) return;

    const headers = [
      'Round',
      'Algorithm',
      'Nodes Alive',
      'Energy Usage (J)',
      'Data Transmitted (bits)',
      'Network Status'
    ];

    const rows: string[][] = [];

    if (leachResults) {
      leachResults.rounds.forEach(round => {
        rows.push([
          round.roundNumber.toString(),
          'LEACH',
          round.nodesAlive.toString(),
          Object.values(round.energyUsage).reduce((a, b) => a + b, 0).toFixed(5),
          round.dataTransmitted.toString(),
          round.nodesAlive > nodes.length * 0.5 ? 'Healthy' : 'Degraded'
        ]);
      });
    }

    if (pegasisResults) {
      pegasisResults.rounds.forEach(round => {
        rows.push([
          round.roundNumber.toString(),
          'PEGASIS',
          round.nodesAlive.toString(),
          Object.values(round.energyUsage).reduce((a, b) => a + b, 0).toFixed(5),
          round.dataTransmitted.toString(),
          round.nodesAlive > nodes.length * 0.5 ? 'Healthy' : 'Degraded'
        ]);
      });
    }

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'routing-simulation-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Prepare data for network lifetime chart (comparison)
  const networkLifetimeData = {
    labels: ['LEACH', 'PEGASIS'],
    datasets: [
      {
        label: 'Network Lifetime (rounds)',
        data: [
          leachResults?.metrics.networkLifetime || 0,
          pegasisResults?.metrics.networkLifetime || 0
        ],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
        borderWidth: 1,
      }
    ]
  };
  
  // Prepare data for energy consumption chart (comparison)
  const energyConsumptionData = {
    labels: ['LEACH', 'PEGASIS'],
    datasets: [
      {
        label: 'Energy Consumption (J)',
        data: [
          leachResults?.metrics.energyConsumption || 0,
          pegasisResults?.metrics.energyConsumption || 0
        ],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
        borderWidth: 1,
      }
    ]
  };
  
  // Prepare data for nodes alive per round chart
  const nodesAliveData = {
    labels: Array.from({ length: Math.max(
      leachResults?.rounds.length || 0,
      pegasisResults?.rounds.length || 0
    ) }, (_, i) => `Round ${i + 1}`),
    datasets: [
      {
        label: 'LEACH - Nodes Alive',
        data: leachResults?.rounds.map(r => r.nodesAlive) || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'PEGASIS - Nodes Alive',
        data: pegasisResults?.rounds.map(r => r.nodesAlive) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        tension: 0.1,
      }
    ]
  };
  
  // Prepare data for energy usage per round chart
  const energyUsageData = {
    labels: Array.from({ length: Math.max(
      leachResults?.rounds.length || 0,
      pegasisResults?.rounds.length || 0
    ) }, (_, i) => `Round ${i + 1}`),
    datasets: [
      {
        label: 'LEACH - Energy Usage',
        data: leachResults?.rounds.map(round => 
          Object.values(round.energyUsage).reduce((sum, val) => sum + val, 0)
        ) || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'PEGASIS - Energy Usage',
        data: pegasisResults?.rounds.map(round => 
          Object.values(round.energyUsage).reduce((sum, val) => sum + val, 0)
        ) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        tension: 0.1,
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-neutral-900">WSN Routing Algorithm Simulator</h1>
          <button
            onClick={() => setShowHelp(true)}
            className="p-1 text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={isSimulating ? pauseSimulation : startSimulation}
            className={`btn ${isSimulating ? 'btn-secondary' : 'btn-primary'} flex items-center`}
            disabled={showComparison}
          >
            {isSimulating ? (
              <>
                <PauseCircle className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Simulation
              </>
            )}
          </button>
          
          <button 
            onClick={resetSimulation}
            className="btn btn-outline flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </button>
          
          <button 
            onClick={runComparison}
            className="btn btn-primary flex items-center"
          >
            <GitMerge className="h-4 w-4 mr-2" />
            Compare Algorithms
          </button>

          <button
            onClick={exportResults}
            className="btn btn-outline flex items-center"
            disabled={!leachResults && !pegasisResults}
          >
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export Results
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Simulation Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Algorithm
              </label>
              <select 
                className="select"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as 'LEACH' | 'PEGASIS')}
                disabled={isSimulating}
              >
                <option value="LEACH">LEACH (Low Energy Adaptive Clustering Hierarchy)</option>
                <option value="PEGASIS">PEGASIS (Power-Efficient GAthering in Sensor Information Systems)</option>
              </select>
            </div>
            
            {algorithm === 'LEACH' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Number of Rounds
                  </label>
                  <input 
                    type="number" 
                    className="input"
                    value={leachConfig.rounds}
                    onChange={(e) => setLeachConfig({
                      ...leachConfig,
                      rounds: parseInt(e.target.value)
                    })}
                    min="1"
                    max="100"
                    disabled={isSimulating}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Cluster Head Probability
                  </label>
                  <input 
                    type="range" 
                    className="w-full"
                    value={leachConfig.probabilityThreshold * 100}
                    onChange={(e) => setLeachConfig({
                      ...leachConfig,
                      probabilityThreshold: parseInt(e.target.value) / 100
                    })}
                    min="5"
                    max="50"
                    step="5"
                    disabled={isSimulating}
                  />
                  <div className="text-sm text-neutral-500 text-right">
                    {Math.round(leachConfig.probabilityThreshold * 100)}%
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Number of Rounds
                  </label>
                  <input 
                    type="number" 
                    className="input"
                    value={pegasisConfig.rounds}
                    onChange={(e) => setPegasisConfig({
                      ...pegasisConfig,
                      rounds: parseInt(e.target.value)
                    })}
                    min="1"
                    max="100"
                    disabled={isSimulating}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Leader Selection Method
                  </label>
                  <select 
                    className="select"
                    value={pegasisConfig.leaderSelectionMethod}
                    onChange={(e) => setPegasisConfig({
                      ...pegasisConfig,
                      leaderSelectionMethod: e.target.value as 'roundRobin' | 'energyBased'
                    })}
                    disabled={isSimulating}
                  >
                    <option value="roundRobin">Round Robin</option>
                    <option value="energyBased">Energy Based</option>
                  </select>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Initial Node Energy (Joules)
              </label>
              <input 
                type="number" 
                className="input"
                value={algorithm === 'LEACH' ? leachConfig.initialEnergy : pegasisConfig.initialEnergy}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (algorithm === 'LEACH') {
                    setLeachConfig({
                      ...leachConfig,
                      initialEnergy: value
                    });
                  } else {
                    setPegasisConfig({
                      ...pegasisConfig,
                      initialEnergy: value
                    });
                  }
                }}
                min="0.1"
                max="10"
                step="0.1"
                disabled={isSimulating}
              />
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Network Status</h2>
              {!showComparison && (
                <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  Round {currentRound} / {algorithm === 'LEACH' ? leachConfig.rounds : pegasisConfig.rounds}
                </div>
              )}
            </div>
            
            {showComparison ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card bg-neutral-50">
                    <h3 className="text-md font-medium mb-3">Network Lifetime</h3>
                    <div className="h-64">
                      <Bar
                        data={networkLifetimeData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Rounds until first node dies'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="card bg-neutral-50">
                    <h3 className="text-md font-medium mb-3">Energy Consumption</h3>
                    <div className="h-64">
                      <Bar
                        data={energyConsumptionData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Total energy used (Joules)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Nodes Alive Over Time</h3>
                  <div className="h-64">
                    <Line
                      data={nodesAliveData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of nodes alive'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Energy Usage Per Round</h3>
                  <div className="h-64">
                    <Line
                      data={energyUsageData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Energy used (Joules)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium mb-2">LEACH Summary</h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 text-neutral-600">Network Lifetime</td>
                          <td className="py-2 font-medium text-right">{leachResults?.metrics.networkLifetime || 0} rounds</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 text-neutral-600">Total Energy Used</td>
                          <td className="py-2 font-medium text-right">{leachResults?.metrics.energyConsumption.toFixed(5) || 0} J</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 text-neutral-600">Data Delivered</td>
                          <td className="py-2 font-medium text-right">{Math.round((leachResults?.metrics.dataDelivered || 0) / 1000)} KB</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-600">Average Remaining Energy</td>
                          <td className="py-2 font-medium text-right">{leachResults?.metrics.averageEnergy.toFixed(2) || 0} J</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-2">PEGASIS Summary</h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 text-neutral-600">Network Lifetime</td>
                          <td className="py-2 font-medium text-right">{pegasisResults?.metrics.networkLifetime || 0} rounds</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 text-neutral-600">Total Energy Used</td>
                          <td className="py-2 font-medium text-right">{pegasisResults?.metrics.energyConsumption.toFixed(5) || 0} J</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 text-neutral-600">Data Delivered</td>
                          <td className="py-2 font-medium text-right">{Math.round((pegasisResults?.metrics.dataDelivered || 0) / 1000)} KB</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-600">Average Remaining Energy</td>
                          <td className="py-2 font-medium text-right">{pegasisResults?.metrics.averageEnergy.toFixed(2) || 0} J</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowComparison(false)}
                    className="btn btn-outline"
                  >
                    Return to Simulator
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 text-neutral-500">
                {leachResults || pegasisResults ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="card bg-neutral-50">
                        <h3 className="text-sm font-medium text-neutral-600 mb-1">Nodes Alive</h3>
                        <p className="text-2xl font-bold text-primary-600">
                          {algorithm === 'LEACH' 
                            ? leachResults?.rounds[currentRound - 1]?.nodesAlive 
                            : pegasisResults?.rounds[currentRound - 1]?.nodesAlive}
                        </p>
                      </div>
                      <div className="card bg-neutral-50">
                        <h3 className="text-sm font-medium text-neutral-600 mb-1">Energy Used</h3>
                        <p className="text-2xl font-bold text-primary-600">
                          {algorithm === 'LEACH'
                            ? Object.values(leachResults?.rounds[currentRound - 1]?.energyUsage || {}).reduce((a, b) => a + b, 0).toFixed(5)
                            : Object.values(pegasisResults?.rounds[currentRound - 1]?.energyUsage || {}).reduce((a, b) => a + b, 0).toFixed(5)} J
                        </p>
                      </div>
                      <div className="card bg-neutral-50">
                        <h3 className="text-sm font-medium text-neutral-600 mb-1">Data Transmitted</h3>
                        <p className="text-2xl font-bold text-primary-600">
                          {algorithm === 'LEACH'
                            ? (leachResults?.rounds[currentRound - 1]?.dataTransmitted || 0) / 1000
                            : (pegasisResults?.rounds[currentRound - 1]?.dataTransmitted || 0) / 1000} KB
                        </p>
                      </div>
                      <div className="card bg-neutral-50">
                        <h3 className="text-sm font-medium text-neutral-600 mb-1">Network Status</h3>
                        <p className={`text-2xl font-bold ${
                          (algorithm === 'LEACH' 
                            ? leachResults?.rounds[currentRound - 1]?.nodesAlive 
                            : pegasisResults?.rounds[currentRound - 1]?.nodesAlive) > nodes.length * 0.5
                            ? 'text-success-600'
                            : 'text-error-600'
                        }`}>
                          {(algorithm === 'LEACH' 
                            ? leachResults?.rounds[currentRound - 1]?.nodesAlive 
                            : pegasisResults?.rounds[currentRound - 1]?.nodesAlive) > nodes.length * 0.5
                            ? 'Healthy'
                            : 'Degraded'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="card bg-neutral-50">
                      <h3 className="text-md font-medium mb-3">Energy Usage Over Time</h3>
                      <div className="h-64">
                        <Line
                          data={{
                            labels: Array.from({ length: currentRound }, (_, i) => `Round ${i + 1}`),
                            datasets: [{
                              label: 'Energy Usage (J)',
                              data: (algorithm === 'LEACH' ? leachResults : pegasisResults)?.rounds
                                .slice(0, currentRound)
                                .map(round => Object.values(round.energyUsage).reduce((a, b) => a + b, 0)),
                              borderColor: 'rgb(75, 192, 192)',
                              backgroundColor: 'rgba(75, 192, 192, 0.1)',
                              tension: 0.1
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: 'Energy (Joules)'
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Database className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                    <p>Configure your settings and click "Run Simulation" to start.</p>
                    <p className="mt-2 text-sm">
                      The simulator will show how {algorithm} performs with your current network of {nodes.length} nodes.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!showComparison && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">About WSN Routing Algorithms</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-2">LEACH Protocol</h3>
              <p className="text-sm text-neutral-700 mb-3">
                Low Energy Adaptive Clustering Hierarchy (LEACH) is a hierarchical routing protocol 
                that minimizes energy dissipation in sensor networks by forming clusters. Each cluster 
                has a designated "cluster head" that aggregates and relays data to the base station.
              </p>
              
              <div className="space-y-1">
                <div className="text-sm"><span className="font-medium">Advantages:</span> Distributed approach, rotation of cluster heads, reduced direct transmissions to base station</div>
                <div className="text-sm"><span className="font-medium">Disadvantages:</span> Random selection of cluster heads, uneven energy consumption</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">PEGASIS Protocol</h3>
              <p className="text-sm text-neutral-700 mb-3">
                Power-Efficient GAthering in Sensor Information Systems (PEGASIS) forms a chain of sensor nodes
                where each node communicates only with the closest neighbor. A designated leader node transmits
                the aggregated data to the base station.
              </p>
              
              <div className="space-y-1">
                <div className="text-sm"><span className="font-medium">Advantages:</span> Reduced transmission distances, elimination of dynamic cluster formation overhead</div>
                <div className="text-sm"><span className="font-medium">Disadvantages:</span> Potential for long chains, single point of failure (leader node)</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-primary-50 border border-primary-100 rounded-md">
            <h3 className="text-sm font-medium text-primary-700 mb-1">
              OSI Layers in WSN Networks
            </h3>
            <p className="text-xs text-primary-600 mb-2">
              The routing algorithms operate primarily in the Network layer of the OSI model, managing how 
              data packets are routed from source to destination.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-2 text-xs">
              <div className="p-2 bg-primary-100 text-primary-700 rounded">
                <div className="font-medium">Application</div>
                <div>Water quality monitoring application</div>
              </div>
              <div className="p-2 bg-primary-100 text-primary-700 rounded">
                <div className="font-medium">Presentation</div>
                <div>Data formatting and encryption</div>
              </div>
              <div className="p-2 bg-primary-100 text-primary-700 rounded">
                <div className="font-medium">Session</div>
                <div>Connection management between nodes</div>
              </div>
              <div className="p-2 bg-primary-100 text-primary-700 rounded">
                <div className="font-medium">Transport</div>
                <div>End-to-end delivery of data packets</div>
              </div>
              <div className="p-2 bg-primary-200 text-primary-800 rounded font-medium">
                <div className="font-medium">Network</div>
                <div>LEACH and PEGASIS operate here</div>
              </div>
              <div className="p-2 bg-primary-100 text-primary-700 rounded">
                <div className="font-medium">Data Link</div>
                <div>Medium access control, error detection</div>
              </div>
              <div className="p-2 bg-primary-100 text-primary-700 rounded">
                <div className="font-medium">Physical</div>
                <div>Radio signals, transmission media</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Understanding WSN Routing Protocols</h2>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">LEACH Protocol</h3>
                <p className="text-neutral-600">
                  Low Energy Adaptive Clustering Hierarchy (LEACH) is a hierarchical routing 
                  protocol that organizes nodes into clusters. Each cluster has a Cluster Head 
                  (CH) that aggregates data from cluster members and communicates directly with 
                  the base station.
                </p>
                <ul className="mt-2 space-y-1 text-sm text-neutral-600 list-disc pl-4">
                  <li>Nodes take turns being cluster heads to distribute energy load</li>
                  <li>Reduces number of nodes communicating directly with base station</li>
                  <li>Self-organizing and adaptive</li>
                  <li>Suitable for networks where data aggregation is possible</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">PEGASIS Protocol</h3>
                <p className="text-neutral-600">
                  Power-Efficient GAthering in Sensor Information Systems (PEGASIS) forms a chain 
                  of sensor nodes where each node communicates only with its closest neighbors. 
                  A single leader node transmits the aggregated data to the base station.
                </p>
                <ul className="mt-2 space-y-1 text-sm text-neutral-600 list-disc pl-4">
                  <li>Forms a chain instead of clusters to minimize transmission distance</li>
                  <li>Each node communicates only with closest neighbors</li>
                  <li>Leader node selection rotates to balance energy consumption</li>
                  <li>More energy-efficient than LEACH for many scenarios</li>
                </ul>
              </div>
              
              <div className="bg-primary-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Key Differences</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-primary-700">LEACH</h4>
                    <ul className="space-y-1 text-primary-600">
                      <li>• Cluster-based hierarchy</li>
                      <li>• Dynamic cluster formation</li>
                      <li>• Multiple cluster heads</li>
                      <li>• Better for large-scale networks</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-700">PEGASIS</h4>
                    <ul className="space-y-1 text-primary-600">
                      <li>• Chain-based topology</li>
                      <li>• Static chain formation</li>
                      <li>• Single leader node</li>
                      <li>• Better energy efficiency</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutingSimulator;