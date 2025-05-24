import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Router, 
  Database, 
  Bell, 
  BarChart2, 
  Settings,
  Droplets 
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/map', label: 'Map View', icon: Map },
  { to: '/nodes', label: 'Node Management', icon: Database },
  { to: '/routing', label: 'Routing Simulator', icon: Router },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-neutral-200 bg-white">
        <div className="h-16 flex items-center px-4 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <Droplets className="h-8 w-8 text-primary-500" />
            <div>
              <h1 className="text-lg font-bold text-neutral-900">YangtzeSense</h1>
              <p className="text-xs text-neutral-500">Water Quality Monitoring</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-2 flex-1 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-700 hover:bg-neutral-50'
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className={cn(
                        'mr-3 h-5 w-5',
                        isActive ? 'text-primary-500' : 'text-neutral-400 group-hover:text-neutral-500'
                      )} 
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-neutral-200 p-4">
          <div className="flex items-center w-full">
            <div className="ml-3 w-full">
              <p className="text-xs text-neutral-500">Simulated Environment</p>
              <p className="text-sm font-medium text-primary-600">Master's Project in CST</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;