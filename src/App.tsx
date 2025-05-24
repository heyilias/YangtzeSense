import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Nodes from './pages/Nodes';
import RoutingSimulator from './pages/RoutingSimulator';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import { SimulationProvider } from './context/SimulationContext';

function App() {
  return (
    <SimulationProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/routing" element={<RoutingSimulator />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </SimulationProvider>
  );
}

export default App;