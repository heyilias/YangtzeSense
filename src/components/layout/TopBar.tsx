import React, { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

const TopBar: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSimulationRunning, toggleSimulation } = useSimulation();

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-start">
          <div className="max-w-lg w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search nodes, alerts, or metrics..."
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSimulation}
            className={`btn ${isSimulationRunning ? 'btn-secondary' : 'btn-primary'}`}
          >
            {isSimulationRunning ? 'Pause Simulation' : 'Start Simulation'}
          </button>
          
          <button className="relative p-1 rounded-full text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error-500 ring-2 ring-white"></span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {showMobileMenu && (
        <div className="md:hidden border-b border-neutral-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile menu items */}
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;