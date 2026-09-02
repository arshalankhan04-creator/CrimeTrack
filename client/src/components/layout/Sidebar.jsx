import React from 'react';
import { 
  Activity, 
  FileText, 
  Briefcase, 
  Users, 
  FileSearch, 
  BarChart3, 
  ShieldCheck,
  LayoutDashboard,
  Search,
  MessageSquare,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, isAuthenticated } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return { name: 'Command Dashboard', path: '/admin/dashboard', icon: LayoutDashboard };
    if (user?.role === 'OFFICER') return { name: 'Officer Workspace', path: '/officer/dashboard', icon: LayoutDashboard };
    if (user?.role === 'VIEWER') return { name: 'Viewer Portal', path: '/viewer/dashboard', icon: LayoutDashboard };
    return null;
  };

  const dashboardItem = getDashboardLink();

  const baseNavItems = [
    { name: 'Station Overview', path: '/', icon: Activity },
  ];

  const liveOperationalNavItems = [
    ...(user?.role === 'ADMIN'
      ? [{ name: 'User Management', path: '/users', icon: Users }]
      : []),
    { name: 'FIR Management', path: '/firs', icon: FileText },
    { name: 'Case Registry', path: '/cases', icon: Briefcase },
    { name: 'Criminal Registry', path: '/criminals', icon: Users },
    { name: 'Investigations', path: '/investigations', icon: FileSearch },
    { name: 'Global Search', path: '/search', icon: Search },
    { name: 'Reports & Exports', path: '/reports', icon: BarChart3 },
    ...(user?.role === 'ADMIN'
      ? [
          { name: 'Audit Trails', path: '/logs', icon: ShieldCheck },
          { name: 'Disaster Recovery', path: '/recovery', icon: Activity },
        ]
      : []),
    { name: 'Feedback & Support', path: '/feedback', icon: MessageSquare },
    ...(user?.role === 'ADMIN'
      ? [{ name: 'System Diagnostics', path: '/qa', icon: Zap }]
      : []),
  ];

  return (
    <aside className="w-64 bg-navy-900 text-slate-300 min-h-[calc(100vh-4rem)] border-r border-navy-800 flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Command Navigation
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
              </NavLink>
            )}

            {/* General Station Status Overview */}
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
                </NavLink>
              );
            })}

            {/* Live Operational Modules */}
            {isAuthenticated && (
              <div className="pt-3">
                <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Station Modules
                </p>
                {liveOperationalNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
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
                        <Icon className="w-4 h-4 text-blue-400" />
                        <span>{item.name}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Role Profile Tag at Sidebar Bottom */}
      <div className="bg-navy-800/80 p-3 rounded-lg border border-navy-700 text-xs">
        <p className="font-medium text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          System Operational
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          {isAuthenticated ? `Signed in as ${user?.role}` : 'Unauthenticated Session'}
        </p>
      </div>
    </aside>
  );
}
