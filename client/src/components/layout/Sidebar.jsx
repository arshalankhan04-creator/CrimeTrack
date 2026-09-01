import React from 'react';
import { 
  Activity, 
  FileText, 
  Briefcase, 
  Users, 
  FileSearch, 
  BarChart3, 
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, isAuthenticated } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return { name: 'Admin Command (M2)', path: '/admin/dashboard', icon: LayoutDashboard };
    if (user?.role === 'OFFICER') return { name: 'Officer Workspace (M2)', path: '/officer/dashboard', icon: LayoutDashboard };
    if (user?.role === 'VIEWER') return { name: 'Viewer Portal (M2)', path: '/viewer/dashboard', icon: LayoutDashboard };
    return null;
  };

  const dashboardItem = getDashboardLink();

  const baseNavItems = [
    { name: 'System Status (M1)', path: '/', icon: Activity, badge: 'Active' },
  ];

  const operationalNavItems = [
    ...(user?.role === 'ADMIN'
      ? [{ name: 'User Management (M3)', path: '/users', icon: Users, disabled: false, badge: 'Live' }]
      : []),
    { name: 'FIR Management (M4)', path: '/firs', icon: FileText, disabled: false, badge: 'Live' },
    { name: 'Case Management (M5)', path: '/cases', icon: Briefcase, disabled: false, badge: 'Live' },
    { name: 'Criminal Registry (M6)', path: '/criminals', icon: Users, disabled: false, badge: 'Live' },
    { name: 'Investigations (M7)', path: '/investigations', icon: FileSearch, disabled: false, badge: 'Live' },
    { name: 'Analytics & Reports (M8-10)', path: '/reports', icon: BarChart3, disabled: true },
    { name: 'Audit Logs (M11)', path: '/logs', icon: ShieldCheck, disabled: true, adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-navy-900 text-slate-300 min-h-[calc(100vh-4rem)] border-r border-navy-800 flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Navigation
          </p>
          <nav className="mt-3 space-y-1">
            {/* Role-specific Dashboard if authenticated */}
            {isAuthenticated && dashboardItem && (
              <NavLink
                to={dashboardItem.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition mb-2 ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <dashboardItem.icon className="w-4 h-4 text-emerald-400" />
                  <span>{dashboardItem.name}</span>
                </div>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Live
                </span>
              </NavLink>
            )}

            {/* General Foundation Status */}
            {baseNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition ${
                      isActive
                        ? 'bg-navy-800 text-white font-semibold'
                        : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-brand-blue" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Future Milestones Navigation */}
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Future Modules
          </p>
          <div className="mt-2 space-y-1">
            {operationalNavItems.map((item) => {
              const Icon = item.icon;
              return (
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
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Profile Tag at Sidebar Bottom */}
      <div className="bg-navy-800/80 p-3 rounded-lg border border-navy-700 text-xs">
        <p className="font-medium text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          RBAC Security Active
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          {isAuthenticated ? `Signed in as ${user?.role}` : 'Unauthenticated Session'}
        </p>
      </div>
    </aside>
  );
}
