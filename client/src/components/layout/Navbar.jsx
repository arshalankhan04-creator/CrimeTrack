import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Lock, 
  Radio, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [quickQuery, setQuickQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
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
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleTheme = () => {
    if (!user) return { label: 'GUEST', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' };
    if (user.role === 'ADMIN') {
      return { 
        label: 'HEADQUARTERS ADMIN', 
        badgeClass: 'bg-purple-950/60 text-purple-300 border-purple-800/80',
        ringColor: 'ring-purple-500'
      };
    }
    if (user.role === 'OFFICER') {
      return { 
        label: 'INVESTIGATING OFFICER', 
        badgeClass: 'bg-blue-950/60 text-blue-300 border-blue-800/80',
        ringColor: 'ring-brand-blue'
      };
    }
    if (user.role === 'VIEWER') {
      return { 
        label: 'DESK OPERATOR', 
        badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-800/80',
        ringColor: 'ring-amber-500'
      };
    }
    return { label: user.role, badgeClass: 'bg-slate-800 text-slate-300 border-slate-700', ringColor: 'ring-slate-500' };
  };

  const roleMeta = getRoleTheme();

  return (
    <header className="bg-navy-900 text-white border-b border-navy-800/80 sticky top-0 z-50 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Identity & Department Emblem */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-900/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-blue-200 transition">
                  CrimeTrack
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  PRECINCT OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Central Law Enforcement Command
              </p>
            </div>
          </Link>

          {/* Center Quick Search Bar (For Authenticated Users) */}
          {isAuthenticated ? (
            <form onSubmit={handleQuickSearch} className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Quick search FIRs, Cases, Suspects, Evidence (Press Enter)..."
                  className="w-full bg-navy-950/80 border border-navy-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition font-sans"
                />
              </div>
            </form>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Secure Station Network Online</span>
            </div>
          )}

          {/* Right Controls & User Dossier */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Station Live Pulse Badge */}
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-[10px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Terminal Online</span>
                </div>

                {/* Notifications Bell Preview */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg bg-navy-800/70 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700/70 transition relative"
                    title="Station Dispatch & Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="w-2 h-2 rounded-full bg-brand-blue absolute top-1.5 right-1.5 animate-ping"></span>
                    <span className="w-2 h-2 rounded-full bg-brand-blue absolute top-1.5 right-1.5"></span>
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-2 font-sans">
                      <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                        <span className="font-bold text-white text-[11px] uppercase tracking-wider">Station Dispatch Feed</span>
                        <span className="text-[10px] text-emerald-400 font-bold">All Normal</span>
                      </div>
                      <div className="space-y-1.5 py-1">
                        <div className="p-2 rounded-lg bg-navy-800/60 border border-navy-700/50 text-slate-300">
                          <p className="font-semibold text-white text-[11px]">System Audit Trail</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Immutable mutation logging active across all registries.</p>
                        </div>
                        <div className="p-2 rounded-lg bg-navy-800/60 border border-navy-700/50 text-slate-300">
                          <p className="font-semibold text-white text-[11px]">Privacy Firewall</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Criminal registry scoped to privacy-minimal view.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="w-full text-center py-1 text-[10px] text-slate-400 hover:text-slate-200 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="h-6 w-[1px] bg-navy-800 hidden sm:block"></div>

                {/* User Officer Card */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr from-navy-800 to-slate-800 text-white font-bold text-xs flex items-center justify-center border border-navy-700 ring-2 ${roleMeta.ringColor || 'ring-brand-blue'} ring-offset-1 ring-offset-navy-900 shadow-inner`}>
                    {getInitials(user?.name)}
                  </div>
                  
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white tracking-tight truncate max-w-[130px]">
                        {user?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleMeta.badgeClass}`}>
                        {roleMeta.label}
                      </span>
                      {user?.employeeId && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {user.employeeId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sign Out Action */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-800/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-semibold border border-navy-700/80 hover:border-rose-800/60 transition shadow-xs"
                  title="Sign Out of Terminal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-900/20 transition"
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
