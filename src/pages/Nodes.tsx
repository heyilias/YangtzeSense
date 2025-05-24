import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Battery, Trash2, ChevronDown, ChevronUp, Edit, Save, X, Plus } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatDistanceToNow } from 'date-fns';

const Nodes: React.FC = () => {
  const { nodes, addNode, removeNode } = useSimulation();
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const toggleExpand = (nodeId: string) => {
    if (expandedNode === nodeId) {
      setExpandedNode(null);
    } else {
      setExpandedNode(nodeId);
    }
  };

  const startEdit = (nodeId: string, name: string) => {
    setEditingNode(nodeId);
    setEditName(name);
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setEditName('');
  };

  const handleAddNode = () => {
    addNode();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Node Management</h1>
        
        <button 
          onClick={handleAddNode}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Node
        </button>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Sensor Nodes</h2>
        
        <div className="overflow-hidden border border-neutral-200 rounded-lg">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  ID & Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Battery
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Update
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {nodes.map((node) => (
                <React.Fragment key={node.id}>
                  <tr className={cn(expandedNode === node.id ? 'bg-primary-50' : 'hover:bg-neutral-50')}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            node.status === 'active' ? 'bg-success-500' :
                            node.status === 'warning' ? 'bg-warning-500' :
                            'bg-neutral-300'
                          )} />
                        </div>
                        <div className="ml-4">
                          {editingNode === node.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="input text-sm py-1 px-2"
                              autoFocus
                            />
                          ) : (
                            <>
                              <div className="text-sm font-medium text-neutral-900">{node.name}</div>
                              <div className="text-xs text-neutral-500">{node.id}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full capitalize bg-primary-100 text-primary-800">
                        {node.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Battery className={cn(
                          "h-4 w-4 mr-1",
                          node.batteryLevel > 50 ? 'text-success-500' :
                          node.batteryLevel > 20 ? 'text-warning-500' :
                          'text-error-500'
                        )} />
                        <span className={cn(
                          "text-sm",
                          node.batteryLevel > 50 ? 'text-success-700' :
                          node.batteryLevel > 20 ? 'text-warning-700' :
                          'text-error-700'
                        )}>
                          {Math.round(node.batteryLevel)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full capitalize",
                        node.status === 'active' ? 'bg-success-100 text-success-800' :
                        node.status === 'warning' ? 'bg-warning-100 text-warning-800' :
                        'bg-neutral-100 text-neutral-800'
                      )}>
                        {node.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatDistanceToNow(new Date(node.lastReading), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingNode === node.id ? (
                        <div className="flex space-x-2 justify-end">
                          <button 
                            onClick={() => cancelEdit()}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => cancelEdit()}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2 justify-end">
                          <button 
                            onClick={() => startEdit(node.id, node.name)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => toggleExpand(node.id)}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            {expandedNode === node.id ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </button>
                          {node.type !== 'base' && (
                            <button 
                              onClick={() => removeNode(node.id)}
                              className="text-error-600 hover:text-error-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  
                  {expandedNode === node.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-primary-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-neutral-900 mb-2">Node Details</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-neutral-500">Position (lat, lng):</div>
                              <div>{node.position.lat.toFixed(6)}, {node.position.lng.toFixed(6)}</div>
                              
                              <div className="text-neutral-500">Created:</div>
                              <div>April 15, 2025</div>
                              
                              <div className="text-neutral-500">Last Reading:</div>
                              <div>{new Date(node.lastReading).toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-neutral-900 mb-2">Energy Usage</h3>
                            <div className="h-24 bg-white rounded border border-neutral-200 p-2">
                              {node.energyUsage.length > 0 ? (
                                <div className="h-full flex items-end">
                                  {node.energyUsage.slice(-10).map((usage, index) => (
                                    <div 
                                      key={index} 
                                      className="w-full bg-primary-200 mx-0.5 rounded-t"
                                      style={{ 
                                        height: `${Math.min(100, usage.value * 100)}%`,
                                      }}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center text-neutral-400 text-xs">
                                  No energy data available
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Nodes;