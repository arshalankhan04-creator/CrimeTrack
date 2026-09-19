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
  X,
  Radio,
  Lock
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const { user, isAuthenticated } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return { name: 'Command Dashboard', path: '/admin/dashboard', icon: LayoutDashboard };
    if (user?.role === 'OFFICER') return { name: 'Officer Workspace', path: '/officer/dashboard', icon: LayoutDashboard };
    if (user?.role === 'VIEWER') return { name: 'Viewer Portal', path: '/viewer/dashboard', icon: LayoutDashboard };
    return null;
  };

  const dashboardItem = getDashboardLink();

  const operationalModules = [
    { name: 'FIR Management', path: '/firs', icon: FileText },
    { name: 'Case Registry', path: '/cases', icon: Briefcase },
    { name: 'Criminal Registry', path: '/criminals', icon: Users },
    { name: 'Investigations', path: '/investigations', icon: FileSearch },
  ];

  const intelligenceModules = [
    { name: 'Global Search', path: '/search', icon: Search },
    { name: 'Reports & Exports', path: '/reports', icon: BarChart3 },
    { name: 'Feedback & Support', path: '/feedback', icon: MessageSquare },
  ];

  const adminModules = [
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Audit Trails', path: '/logs', icon: ShieldCheck },
    { name: 'Disaster Recovery', path: '/recovery', icon: Activity },
    { name: 'System Diagnostics', path: '/qa', icon: Zap },
  ];

  const renderNavGroup = (title, items) => (
    <div className="pt-3">
      <p className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'bg-brand-blue text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white" />
                <span>{item.name}</span>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
      <div className="space-y-2">
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between pb-3 border-b border-navy-800 md:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Navigation Menu
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Overview & Role Dashboard */}
        <div className="space-y-0.5">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-navy-800 text-white font-semibold'
                  : 'text-slate-300 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-brand-blue" />
              <span>Station Overview</span>
            </div>
          </NavLink>

          {isAuthenticated && dashboardItem && (
            <NavLink
              to={dashboardItem.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand-blue text-white font-semibold shadow-xs'
                    : 'text-slate-200 bg-navy-850 hover:bg-navy-800'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <dashboardItem.icon className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">{dashboardItem.name}</span>
              </div>
            </NavLink>
          )}
        </div>

        {/* Authenticated Operational Sections */}
        {isAuthenticated && (
          <>
            {renderNavGroup('Operational Registries', operationalModules)}
            {renderNavGroup('Intelligence & Tools', intelligenceModules)}
            {user?.role === 'ADMIN' && renderNavGroup('Security & Governance', adminModules)}
          </>
        )}
      </div>

      {/* Sidebar Footer Session Tag */}
      <div className="pt-4 mt-4 border-t border-navy-800/80">
        <div className="bg-navy-850 p-2.5 rounded-lg border border-navy-800 text-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Station Online
            </span>
            <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {isAuthenticated ? `${user?.name || 'Officer'} (${user?.role})` : 'Unauthenticated Session'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="w-60 bg-navy-900 text-slate-300 min-h-[calc(100vh-4rem)] border-r border-navy-800 hidden md:block shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-navy-900 shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
