import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Search, 
  Bell, 
  LogOut, 
  Lock, 
  Menu,
  X,
  User,
  Radio,
  CheckCheck,
  Trash2,
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../common/Badge';

export default function Navbar({ onToggleMobileMenu, onOpenProfile }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [quickQuery, setQuickQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Escape key to close dropdowns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickQuery.trim())}`);
      setQuickQuery('');
    }
  };

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

  const getDashboardPath = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'OFFICER') return '/officer/dashboard';
    if (user?.role === 'VIEWER') return '/viewer/dashboard';
    return '/';
  };

  const getPageTitle = (pathname) => {
    if (pathname === '/' || pathname === '/health') return 'Station Overview';
    if (pathname === '/admin/dashboard') return 'Command Dashboard';
    if (pathname === '/officer/dashboard') return 'Officer Workspace';
    if (pathname === '/viewer/dashboard') return 'Viewer Portal';
    if (pathname.startsWith('/firs')) return 'FIR Management';
    if (pathname.startsWith('/cases')) return 'Case Registry';
    if (pathname.startsWith('/criminals')) return 'Criminal Registry';
    if (pathname.startsWith('/investigations')) return 'Investigation Diary';
    if (pathname.startsWith('/search')) return 'Global Search';
    if (pathname.startsWith('/reports')) return 'Reports & Exports';
    if (pathname.startsWith('/users')) return 'User Management';
    if (pathname.startsWith('/logs')) return 'Audit Trails';
    if (pathname.startsWith('/recovery')) return 'Disaster Recovery';
    if (pathname.startsWith('/feedback')) return 'Feedback & Support';
    if (pathname.startsWith('/qa')) return 'System Diagnostics';
    return '';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="bg-navy-900 text-white border-b border-navy-800 sticky top-0 z-30 shadow-sm font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Mobile Toggle, CrimeTrack Shield Branding & Page Breadcrumb */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="md:hidden p-2 rounded-lg bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 transition"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-950/40 group-hover:scale-105 transition-transform shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-blue-200 transition select-none">
                  CrimeTrack
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 select-none">
                  PORTAL
                </span>
              </div>
            </Link>

            {/* Page Title Breadcrumb on Desktop */}
            {pageTitle && (
              <div className="hidden lg:flex items-center gap-2 pl-2.5 border-l border-navy-800 text-xs">
                <span className="text-slate-500">/</span>
                <span className="font-semibold text-slate-300 tracking-wide select-none">
                  {pageTitle}
                </span>
              </div>
            )}
          </div>

          {/* Center: Quick Search Bar (For Authenticated Users) */}
          {isAuthenticated ? (
            <form onSubmit={handleQuickSearch} className="hidden md:flex items-center flex-1 max-w-md mx-3 lg:mx-6">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Quick search FIRs, Cases, Suspects (Press Enter)..."
                  className="w-full bg-navy-950/80 border border-navy-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition font-sans"
                />
              </div>
            </form>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Station Network Online</span>
            </div>
          )}

          {/* Right: Notification Bell & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Notification Bell & Dropdown Popover */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileMenu(false);
                    }}
                    className={`p-2 rounded-lg border transition relative ${
                      showNotifications 
                        ? 'bg-navy-800 text-white border-navy-600' 
                        : 'bg-navy-800/80 hover:bg-navy-800 text-slate-300 hover:text-white border-navy-700/80'
                    }`}
                    aria-label={`View notifications (${unreadCount} unread)`}
                    aria-expanded={showNotifications}
                  >
                    <Bell className="w-4 h-4" />
                    {/* Unread Indicator: Render ONLY when unreadCount > 0 */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-blue px-1 text-[9px] font-bold text-white shadow-xs animate-in zoom-in-50">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-navy-900 border border-navy-700 rounded-xl shadow-2xl p-0 z-50 text-xs font-sans animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                      {/* Dropdown Header */}
                      <div className="p-3.5 bg-navy-950/90 border-b border-navy-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs uppercase tracking-wider">
                            Station Dispatch
                          </span>
                          {unreadCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                              {unreadCount} unread
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              All caught up
                            </span>
                          )}
                        </div>

                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllAsRead}
                            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      {/* Notification List Container */}
                      <div className="max-h-72 overflow-y-auto divide-y divide-navy-800/60 p-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center space-y-2 text-slate-400">
                            <Inbox className="w-8 h-8 text-slate-500 mx-auto" />
                            <p className="font-semibold text-xs text-slate-300">No Notifications</p>
                            <p className="text-[11px] text-slate-500">You're all caught up with station dispatches.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={`p-3 rounded-lg transition-colors cursor-pointer flex items-start gap-2.5 ${
                                notif.isRead 
                                  ? 'hover:bg-navy-800/40 text-slate-400' 
                                  : 'bg-navy-800/70 hover:bg-navy-800 text-slate-200 border-l-2 border-l-brand-blue'
                              }`}
                            >
                              <div className="pt-0.5 shrink-0">
                                {!notif.isRead ? (
                                  <span className="w-2 h-2 rounded-full bg-brand-blue block mt-1 shadow-xs shadow-brand-blue/50"></span>
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <p className={`text-xs truncate ${!notif.isRead ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                                    {notif.title}
                                  </p>
                                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                    {notif.time}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notif.id);
                                }}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded transition opacity-60 hover:opacity-100"
                                aria-label="Dismiss notification"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Dropdown Footer */}
                      <div className="p-2.5 bg-navy-950/80 border-t border-navy-800 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Radio className="w-3 h-3 text-emerald-400" />
                          Central Terminal Feed
                        </span>
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={clearAllNotifications}
                            className="text-slate-400 hover:text-slate-200 transition"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="h-6 w-[1px] bg-navy-800 hidden sm:block"></div>

                {/* User Profile Popover in Navbar */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifications(false);
                    }}
                    className={`flex items-center gap-2 p-1 sm:p-1.5 rounded-xl border transition ${
                      showProfileMenu 
                        ? 'bg-navy-800 border-navy-600' 
                        : 'bg-navy-800/70 hover:bg-navy-800 border-navy-700/80'
                    }`}
                    aria-label="User profile and session menu"
                    aria-expanded={showProfileMenu}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-blue-600 text-white font-bold text-xs flex items-center justify-center border border-navy-700 shadow-inner shrink-0">
                      {getInitials(user?.name)}
                    </div>
                    
                    <div className="hidden sm:block text-left pr-1">
                      <p className="text-xs font-bold text-white tracking-tight truncate max-w-[110px]">
                        {user?.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant={getRoleVariant(user?.role)} size="sm">
                          {user?.role}
                        </Badge>
                      </div>
                    </div>

                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180 text-white' : ''}`} />
                  </button>

                  {/* Profile Menu Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl p-0 z-50 text-xs font-sans animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                      {/* User Dossier Summary Card */}
                      <div className="p-3.5 bg-navy-950/90 border-b border-navy-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-white text-xs truncate">
                            {user?.name}
                          </p>
                          <Badge variant={getRoleVariant(user?.role)} size="sm">
                            {user?.role}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {user?.email}
                        </p>
                        {user?.employeeId && (
                          <p className="text-[10px] text-blue-400 font-mono pt-0.5">
                            ID: {user.employeeId}
                          </p>
                        )}
                      </div>

                      {/* Menu Actions */}
                      <div className="p-1.5 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            if (onOpenProfile) onOpenProfile();
                          }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-navy-800 transition font-medium text-xs"
                        >
                          <User className="w-4 h-4 text-brand-blue" />
                          <span>My Profile Dossier</span>
                        </button>

                        <Link
                          to={getDashboardPath()}
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-navy-800 transition font-medium text-xs"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                          <span>Role Workspace</span>
                        </Link>
                      </div>

                      {/* Logout Action */}
                      <div className="p-1.5 border-t border-navy-800">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-rose-300 hover:text-rose-200 hover:bg-rose-950/50 transition font-medium text-xs"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out of Terminal</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-blue hover:bg-brand-hoverBlue text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Station Login</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

