import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { useSimulation } from '../context/SimulationContext';
import { cn } from '../utils/cn';

const MapView: React.FC = () => {
  const { nodes, waterQualityLevel, waterQualityData, updateNodePosition } = useSimulation();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Center map on Nanjing's Yangtze River section
  const center: LatLngExpression = [32.05, 118.78];

  // Custom icons for different node types and states
  const getNodeIcon = (node: any) => {
    // Base URL for SVG marker
    const iconUrl = `/src/assets/markers/${node.type === 'base' ? 'base' : 'sensor'}-${
      node.status === 'active' ? 'active' : 
      node.status === 'warning' ? 'warning' : 'inactive'
    }.svg`;

    return new Icon({
      iconUrl,
      iconSize: [node.type === 'base' ? 40 : 30, node.type === 'base' ? 40 : 30],
      iconAnchor: [node.type === 'base' ? 20 : 15, node.type === 'base' ? 40 : 30],
      popupAnchor: [0, -35],
    });
  };

  // MapEvents component to handle dragging markers
  const DraggableMarker = ({ node }: { node: any }) => {
    const map = useMapEvents({
      click() {
        map.locate();
      },
    });

    const eventHandlers = {
      dragend(e: any) {
        const marker = e.target;
        const position = marker.getLatLng();
        updateNodePosition(node.id, position.lat, position.lng);
      },
    };

    return (
      <Marker
        key={node.id}
        position={[node.position.lat, node.position.lng]}
        icon={getNodeIcon(node)}
        draggable={true}
        eventHandlers={eventHandlers}
      >
        <Popup>
          <div className="p-1">
            <h3 className="font-semibold">{node.name}</h3>
            <p className="text-sm text-neutral-600">Type: {node.type}</p>
            <p className="text-sm text-neutral-600">
              Battery Level: 
              <span className={cn(
                "ml-1 font-medium",
                node.batteryLevel > 50 ? 'text-success-600' :
                node.batteryLevel > 20 ? 'text-warning-600' :
                'text-error-600'
              )}>
                {Math.round(node.batteryLevel)}%
              </span>
            </p>
            <p className="text-sm text-neutral-600">
              Status: 
              <span className={cn(
                "ml-1 font-medium",
                node.status === 'active' ? 'text-success-600' :
                node.status === 'warning' ? 'text-warning-600' :
                'text-error-600'
              )}>
                {node.status}
              </span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Last Reading: {new Date(node.lastReading).toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500 mt-2">Drag to reposition</p>
          </div>
        </Popup>
      </Marker>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Yangtze River Sensor Network</h1>
        
        <div className={cn(
          "px-4 py-1 rounded-full text-sm font-medium",
          waterQualityLevel === 'Good' ? 'bg-success-100 text-success-700' :
          waterQualityLevel === 'Fair' ? 'bg-warning-100 text-warning-700' :
          'bg-error-100 text-error-700'
        )}>
          Water Quality: {waterQualityLevel}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card p-0" style={{ height: "600px" }}>
            <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {nodes.map(node => (
                <DraggableMarker key={node.id} node={node} />
              ))}
            </MapContainer>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Network Overview</h2>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Total Nodes</span>
                <span className="font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Active Nodes</span>
                <span className="font-medium text-success-600">
                  {nodes.filter(n => n.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Warning Nodes</span>
                <span className="font-medium text-warning-600">
                  {nodes.filter(n => n.status === 'warning').length}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-600">Inactive Nodes</span>
                <span className="font-medium text-error-600">
                  {nodes.filter(n => n.status === 'inactive').length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Legend</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-primary-500 mr-2"></div>
                <span>Base Station</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-success-500 mr-2"></div>
                <span>Active Sensor Node</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-warning-500 mr-2"></div>
                <span>Warning Sensor Node</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-neutral-400 mr-2"></div>
                <span>Inactive Sensor Node</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Current Readings</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-600">Temperature</span>
                <span className="font-medium">{waterQualityData.temperature.toFixed(1)} °C</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-600">pH Level</span>
                <span className="font-medium">{waterQualityData.ph.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-600">Dissolved Oxygen</span>
                <span className="font-medium">{waterQualityData.dissolvedOxygen.toFixed(2)} mg/L</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-600">Turbidity</span>
                <span className="font-medium">{waterQualityData.turbidity.toFixed(1)} NTU</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-600">Conductivity</span>
                <span className="font-medium">{waterQualityData.conductivity.toFixed(0)} μS/cm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;