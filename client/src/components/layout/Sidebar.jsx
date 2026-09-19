import React, { useEffect } from 'react';
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
  Lock,
  User,
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

export default function Sidebar({ mobileOpen = false, onCloseMobile, onOpenProfile }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  // Lock body scroll when mobile drawer is active
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
    navigate('/login', { replace: true });
  };

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

  const getInitials = (name) => {
    if (!name) return 'CT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleVariant = (role) => {
    if (role === 'ADMIN') return 'danger';
    if (role === 'OFFICER') return 'primary';
    return 'warning';
  };

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
    <div className="flex flex-col justify-between h-full p-4 overflow-y-auto font-sans">
      <div className="space-y-2">
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between pb-3 border-b border-navy-800 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-blue flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              CrimeTrack Station
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Command & Role Workspace */}
        <div className="space-y-0.5">
          <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">
            COMMAND
          </p>
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
            {renderNavGroup('RECORDS', operationalModules)}
            {renderNavGroup('INTELLIGENCE', intelligenceModules)}
            {user?.role === 'ADMIN' && renderNavGroup('ADMINISTRATION', adminModules)}
          </>
        )}
      </div>

      {/* Sidebar Footer — Authenticated Profile & Logout Section */}
      <div className="pt-4 mt-4 border-t border-navy-800/80 space-y-2">
        {isAuthenticated && user ? (
          <div className="bg-navy-950/80 p-3 rounded-xl border border-navy-800 space-y-2.5">
            {/* Clickable Profile Card */}
            <button
              type="button"
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                if (onOpenProfile) onOpenProfile();
              }}
              className="w-full text-left flex items-center justify-between p-1.5 rounded-lg hover:bg-navy-850/80 transition group"
              aria-label="View authenticated user profile"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-navy-800 text-white font-bold text-xs flex items-center justify-center border border-navy-700 shadow-inner shrink-0 group-hover:border-blue-500 transition-colors">
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white tracking-tight truncate group-hover:text-blue-300 transition-colors">
                    {user?.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge variant={getRoleVariant(user?.role)} size="sm">
                      {user?.role}
                    </Badge>
                    {user?.employeeId && (
                      <span className="text-[9px] text-slate-400 font-mono truncate">
                        {user.employeeId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Quick Profile & Sign Out Actions */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-navy-850">
              <button
                type="button"
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  if (onOpenProfile) onOpenProfile();
                }}
                className="flex-1 py-1 px-2 rounded bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white text-[11px] font-medium transition text-center"
              >
                My Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="py-1 px-2 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 text-[11px] font-medium border border-rose-900/40 transition flex items-center gap-1"
                aria-label="Sign out"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-navy-850 p-2.5 rounded-lg border border-navy-800 text-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Station Online
              </span>
              <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside 
        className="hidden md:flex flex-col fixed top-16 left-0 bottom-0 w-64 bg-navy-900 text-slate-300 border-r border-navy-800 z-20 overflow-y-auto"
        aria-label="Main sidebar navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-navy-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

