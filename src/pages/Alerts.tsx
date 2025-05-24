import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Bell, BellOff, AlertTriangle, AlertCircle, 
  ThermometerSun, Droplets, Battery, Zap, CheckCircle2, 
  ChevronDown, ChevronUp, Search, Trash2 
} from 'lucide-react';
import { cn } from '../utils/cn';
import { format, formatDistanceToNow } from 'date-fns';

// Mock alert data structure
interface Alert {
  id: string;
  type: 'water_quality' | 'node_status' | 'battery' | 'system';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
  details?: {
    parameter?: string;
    value?: number;
    threshold?: number;
    nodeId?: string;
    location?: { lat: number; lng: number };
  };
}

const Alerts: React.FC = () => {
  const { waterQualityData, waterQualityLevel, nodes } = useSimulation();
  
  // Generate mock alerts based on current system state
  const generateMockAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const now = new Date();
    
    // Add water quality alerts based on current quality level
    if (waterQualityLevel === 'Poor') {
      alerts.push({
        id: 'wq-1',
        type: 'water_quality',
        severity: 'critical',
        message: 'Water quality has degraded to Poor level',
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
        read: false,
        details: {
          parameter: 'Overall Quality',
          value: 0,
          threshold: 0,
        }
      });
      
      // Find which parameter is causing the poor quality
      if (waterQualityData.ph < 6.0 || waterQualityData.ph > 9.0) {
        alerts.push({
          id: 'wq-2',
          type: 'water_quality',
          severity: 'critical',
          message: 'pH level is outside acceptable range',
          timestamp: new Date(now.getTime() - 20 * 60000).toISOString(), // 20 minutes ago
          read: false,
          details: {
            parameter: 'pH',
            value: waterQualityData.ph,
            threshold: waterQualityData.ph < 6.0 ? 6.0 : 9.0,
          }
        });
      }
      
      if (waterQualityData.dissolvedOxygen < 5) {
        alerts.push({
          id: 'wq-3',
          type: 'water_quality',
          severity: 'critical',
          message: 'Dissolved oxygen level is critically low',
          timestamp: new Date(now.getTime() - 25 * 60000).toISOString(), // 25 minutes ago
          read: false,
          details: {
            parameter: 'Dissolved Oxygen',
            value: waterQualityData.dissolvedOxygen,
            threshold: 5,
          }
        });
      }
    } else if (waterQualityLevel === 'Fair') {
      alerts.push({
        id: 'wq-4',
        type: 'water_quality',
        severity: 'warning',
        message: 'Water quality has changed to Fair level',
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), // 45 minutes ago
        read: true,
        details: {
          parameter: 'Overall Quality',
          value: 0,
          threshold: 0,
        }
      });
    }
    
    // Add node status alerts based on current node status
    const inactiveNodes = nodes.filter(n => n.status === 'inactive');
    const warningNodes = nodes.filter(n => n.status === 'warning');
    const lowBatteryNodes = nodes.filter(n => n.batteryLevel < 20);
    
    if (inactiveNodes.length > 0) {
      inactiveNodes.forEach((node, index) => {
        alerts.push({
          id: `node-${index}`,
          type: 'node_status',
          severity: 'critical',
          message: `Node ${node.name} has gone offline`,
          timestamp: new Date(now.getTime() - (60 + index * 5) * 60000).toISOString(), // 1+ hours ago
          read: index > 0, // Only the latest is unread
          details: {
            nodeId: node.id,
            location: node.position,
          }
        });
      });
    }
    
    if (warningNodes.length > 0) {
      warningNodes.forEach((node, index) => {
        alerts.push({
          id: `warning-${index}`,
          type: 'node_status',
          severity: 'warning',
          message: `Node ${node.name} has communication issues`,
          timestamp: new Date(now.getTime() - (120 + index * 5) * 60000).toISOString(), // 2+ hours ago
          read: true,
          details: {
            nodeId: node.id,
            location: node.position,
          }
        });
      });
    }
    
    if (lowBatteryNodes.length > 0) {
      lowBatteryNodes.forEach((node, index) => {
        alerts.push({
          id: `battery-${index}`,
          type: 'battery',
          severity: 'warning',
          message: `Node ${node.name} has low battery (${Math.round(node.batteryLevel)}%)`,
          timestamp: new Date(now.getTime() - (180 + index * 5) * 60000).toISOString(), // 3+ hours ago
          read: true,
          details: {
            nodeId: node.id,
            value: node.batteryLevel,
            threshold: 20,
          }
        });
      });
    }
    
    // Add some system alerts
    alerts.push({
      id: 'sys-1',
      type: 'system',
      severity: 'info',
      message: 'System maintenance scheduled for tomorrow',
      timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(), // 12 hours ago
      read: true,
    });
    
    alerts.push({
      id: 'sys-2',
      type: 'system',
      severity: 'info',
      message: 'New node added to the network',
      timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(), // 2 days ago
      read: true,
    });
    
    // Sort alerts by timestamp (newest first)
    return alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };
  
  const [alerts, setAlerts] = useState<Alert[]>(generateMockAlerts());
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filter alerts based on selected filter and search query
  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = 
      selectedFilter === 'all' || 
      (selectedFilter === 'unread' && !alert.read) ||
      (selectedFilter === 'critical' && alert.severity === 'critical') ||
      (selectedFilter === 'warning' && alert.severity === 'warning') ||
      (selectedFilter === 'info' && alert.severity === 'info') ||
      (selectedFilter === 'water_quality' && alert.type === 'water_quality') ||
      (selectedFilter === 'node_status' && alert.type === 'node_status') ||
      (selectedFilter === 'battery' && alert.type === 'battery') ||
      (selectedFilter === 'system' && alert.type === 'system');
    
    const matchesSearch = 
      searchQuery === '' || 
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  // Mark alert as read
  const markAsRead = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };
  
  // Mark all alerts as read
  const markAllAsRead = () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, read: true }))
    );
  };
  
  // Delete alert
  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    if (expandedAlert === id) {
      setExpandedAlert(null);
    }
  };
  
  // Clear all alerts
  const clearAllAlerts = () => {
    setAlerts([]);
    setExpandedAlert(null);
  };
  
  // Toggle alert expansion
  const toggleExpand = (id: string) => {
    if (expandedAlert === id) {
      setExpandedAlert(null);
    } else {
      setExpandedAlert(id);
      markAsRead(id);
    }
  };
  
  // Get icon for alert type
  const getAlertIcon = (alert: Alert) => {
    switch (alert.type) {
      case 'water_quality':
        return <Droplets className="h-5 w-5" />;
      case 'node_status':
        return <Zap className="h-5 w-5" />;
      case 'battery':
        return <Battery className="h-5 w-5" />;
      case 'system':
        return <AlertCircle className="h-5 w-5" />;
    }
  };
  
  // Get color for alert severity
  const getAlertColorClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-error-600 bg-error-50';
      case 'warning':
        return 'text-warning-600 bg-warning-50';
      case 'info':
        return 'text-primary-600 bg-primary-50';
    }
  };
  
  // Get badge for alert severity
  const getAlertBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-error-100 text-error-800">
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-warning-100 text-warning-800">
            Warning
          </span>
        );
      case 'info':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800">
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Alert Manager</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={markAllAsRead}
            className="btn btn-outline flex items-center"
            disabled={!alerts.some(alert => !alert.read)}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark All Read
          </button>
          
          <button 
            onClick={clearAllAlerts}
            className="btn btn-outline flex items-center text-error-600 hover:text-error-700 hover:border-error-300 hover:bg-error-50"
            disabled={alerts.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedFilter('all')}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center",
                  selectedFilter === 'all' ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50'
                )}
              >
                <Bell className="h-4 w-4 mr-2" />
                All Alerts
                <span className="ml-auto bg-neutral-100 text-neutral-600 text-xs py-0.5 px-2 rounded-full">
                  {alerts.length}
                </span>
              </button>
              
              <button 
                onClick={() => setSelectedFilter('unread')}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center",
                  selectedFilter === 'unread' ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50'
                )}
              >
                <BellOff className="h-4 w-4 mr-2" />
                Unread
                <span className="ml-auto bg-neutral-100 text-neutral-600 text-xs py-0.5 px-2 rounded-full">
                  {alerts.filter(a => !a.read).length}
                </span>
              </button>
              
              <h3 className="text-xs font-medium text-neutral-500 uppercase mt-4 mb-2 px-3">By Severity</h3>
              
              <button 
                onClick={() => setSelectedFilter('critical')}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center",
                  selectedFilter === 'critical' ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50'
                )}
              >
                <AlertTriangle className="h-4 w-4 mr-2 text-error-500" />
                Critical
                <span className="ml-auto bg-neutral-100 text-neutral-600 text-xs py-0.5 px-2 rounded-full">
                  {alerts.filter(a => a.severity === 'critical').length}
                </span>
              </button>
              
              <button 
                onClick={() => setSelectedFilter('warning')}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center",
                  selectedFilter === 'warning' ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50'
                )}
              >
                <AlertTriangle className="h-4 w-4 mr-2 text-warning-500" />
                Warning
                <span className="ml-auto bg-neutral-100 text-neutral-600 text-xs py-0.5 px-2 rounded-full">
                  {alerts.filter(a => a.severity === 'warning').length}
                </span>
              </button>
              
              <button 
                onClick={() => setSelectedFilter('info')}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center",
                  selectedFilter === 'info' ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50'
                )}
              >
                <AlertCircle className="h-4 w-4 mr-2 text-primary-500" />
                Information
                <span className="ml-auto bg-neutral-100 text-neutral-600 text-xs py-0.5 px-2 rounded-full">
                  {alerts.filter(a => a.severity === 'info').length}
                </span>
              </button>
              
              <h3 className="text-xs font-medium text-neutral-500 uppercase mt-4 mb-2 px-3">By Type</h3>
              
              <button 
                onClick={() => setSelectedFilter('water_quality')}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center",
                  selectedFilter === 'water_quality' ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50'
                )}
              >
                <Droplets className="h-4 w-4 mr-2 text-primary-500" />
                Water Quality
                <span className="ml-auto bg-neutral-100 text-neutral-600 text-xs py-0.5 px-2 rounded-full">
                  {alerts.filter(a => a.type === 'water_quality').length}
                </span>
              </button>
              
              <button 
                onClick={() => setSelectedFilter('node_status')}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center",
                  selectedFilter === 'node_status' ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50'
                )}
              >
                <Zap className="h-4 w-4 mr-2 text-primary-500" />
                Node Status
                <span className="ml-auto bg-neutral-100 text-neutral-600 text-xs py-0.5 px-2 rounded-full">
                  {alerts.filter(a => a.type === 'node_status').length}
                </span>
              </button>
              
              <button 
                onClick={() => setSelectedFilter('battery')}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center",
                  selectedFilter === 'battery' ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50'
                )}
              >
                <Battery className="h-4 w-4 mr-2 text-primary-500" />
                Battery
                <span className="ml-auto bg-neutral-100 text-neutral-600 text-xs py-0.5 px-2 rounded-full">
                  {alerts.filter(a => a.type === 'battery').length}
                </span>
              </button>
              
              <button 
                onClick={() => setSelectedFilter('system')}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center",
                  selectedFilter === 'system' ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50'
                )}
              >
                <AlertCircle className="h-4 w-4 mr-2 text-primary-500" />
                System
                <span className="ml-auto bg-neutral-100 text-neutral-600 text-xs py-0.5 px-2 rounded-full">
                  {alerts.filter(a => a.type === 'system').length}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Alert List</h2>
            
            {filteredAlerts.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500">No alerts found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAlerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={cn(
                      "border rounded-md overflow-hidden transition-all",
                      !alert.read ? 'border-l-4 border-l-primary-500' : 'border-neutral-200'
                    )}
                  >
                    <div 
                      className={cn(
                        "p-4 cursor-pointer",
                        !alert.read ? 'bg-primary-50' : 'bg-white hover:bg-neutral-50',
                        expandedAlert === alert.id ? 'border-b border-neutral-200' : ''
                      )}
                      onClick={() => toggleExpand(alert.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={cn(
                            "p-2 rounded-full mr-3",
                            getAlertColorClass(alert.severity)
                          )}>
                            {getAlertIcon(alert)}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">{alert.message}</div>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getAlertBadge(alert.severity)}
                          {expandedAlert === alert.id ? (
                            <ChevronUp className="h-5 w-5 text-neutral-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-neutral-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {expandedAlert === alert.id && (
                      <div className="p-4 bg-white">
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-neutral-900 mb-2">Details</h3>
                          <div className="text-sm text-neutral-700">
                            {alert.details ? (
                              <div className="space-y-2">
                                {alert.details.parameter && (
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500">Parameter:</span>
                                    <span>{alert.details.parameter}</span>
                                  </div>
                                )}
                                {alert.details.value !== undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500">Value:</span>
                                    <span>{alert.details.value}</span>
                                  </div>
                                )}
                                {alert.details.threshold !== undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500">Threshold:</span>
                                    <span>{alert.details.threshold}</span>
                                  </div>
                                )}
                                {alert.details.nodeId && (
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500">Node ID:</span>
                                    <span>{alert.details.nodeId}</span>
                                  </div>
                                )}
                                {alert.details.location && (
                                  <div className="flex justify-between">
                                    <span className="text-neutral-500">Location:</span>
                                    <span>
                                      {alert.details.location.lat.toFixed(6)}, {alert.details.location.lng.toFixed(6)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p>No additional details available.</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <div>
                            {format(new Date(alert.timestamp), 'MMM d, yyyy HH:mm:ss')}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAlert(alert.id);
                            }}
                            className="text-error-600 hover:text-error-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;