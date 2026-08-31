import React from 'react';
import { 
  Activity, 
  FileText, 
  Briefcase, 
  Users, 
  FileSearch, 
  BarChart3, 
  ShieldCheck, 
  Settings 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'System Status (M1)', path: '/', icon: Activity, badge: 'Active' },
  { name: 'FIR Management (M4)', path: '/firs', icon: FileText, disabled: true },
  { name: 'Case Management (M5)', path: '/cases', icon: Briefcase, disabled: true },
  { name: 'Criminal Registry (M6)', path: '/criminals', icon: Users, disabled: true },
  { name: 'Investigations (M7)', path: '/investigations', icon: FileSearch, disabled: true },
  { name: 'Analytics & Reports (M8-10)', path: '/reports', icon: BarChart3, disabled: true },
  { name: 'Audit Logs (M11)', path: '/logs', icon: ShieldCheck, disabled: true },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-navy-900 text-slate-300 min-h-[calc(100vh-4rem)] border-r border-navy-800 flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Modules
          </p>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return item.disabled ? (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 rounded-lg cursor-not-allowed select-none group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-600" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[9px] bg-navy-800 text-slate-600 px-1.5 py-0.5 rounded border border-navy-700">
                    Next
                  </span>
                </div>
              ) : (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition ${
                      isActive
                        ? 'bg-brand-blue text-white shadow-sm font-semibold'
                        : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-navy-800/80 p-3 rounded-lg border border-navy-700 text-xs">
        <p className="font-medium text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          CrimeTrack Architecture
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Role-Based Access • Officer Ownership • MERN Foundation
        </p>
      </div>
    </aside>
  );
}
