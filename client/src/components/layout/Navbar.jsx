import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  Bell, 
  LogOut, 
  Lock, 
  Menu,
  X,
  User,
  Radio
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

export default function Navbar({ onToggleMobileMenu }) {
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
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-navy-900 text-white border-b border-navy-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Mobile Toggle & Brand Emblem */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="md:hidden p-2 rounded-lg bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 transition"
                title="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-950/40 group-hover:scale-105 transition-transform">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-blue-200 transition">
                    CrimeTrack
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    PORTAL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Central Law Enforcement Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Quick Search Bar (For Authenticated Users) */}
          {isAuthenticated ? (
            <form onSubmit={handleQuickSearch} className="hidden md:flex items-center flex-1 max-w-md mx-2">
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

          {/* Right: Controls & User Officer Dossier */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Notifications Dispatch Popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg bg-navy-800/80 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700/80 transition relative"
                    title="Station Dispatch & System Notices"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="w-2 h-2 rounded-full bg-brand-blue absolute top-1.5 right-1.5"></span>
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-2 font-sans">
                      <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                        <span className="font-bold text-white text-[11px] uppercase tracking-wider">Station Dispatch Feed</span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Online
                        </span>
                      </div>
                      <div className="space-y-1.5 py-1">
                        <div className="p-2 rounded-lg bg-navy-800/60 border border-navy-700/50 text-slate-300">
                          <p className="font-semibold text-white text-[11px]">Audit Trail Active</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Immutable record tracking active on all operational registries.</p>
                        </div>
                        <div className="p-2 rounded-lg bg-navy-800/60 border border-navy-700/50 text-slate-300">
                          <p className="font-semibold text-white text-[11px]">Role Scope Enforced</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Access boundaries strictly verified per active officer session.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="w-full text-center py-1 text-[10px] text-slate-400 hover:text-slate-200 transition"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="h-6 w-[1px] bg-navy-800 hidden sm:block"></div>

                {/* User Profile Info */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-navy-800 text-white font-bold text-xs flex items-center justify-center border border-navy-700 shadow-inner">
                    {getInitials(user?.name)}
                  </div>
                  
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white tracking-tight truncate max-w-[120px]">
                      {user?.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge variant={user?.role?.toLowerCase()} size="sm">
                        {user?.role}
                      </Badge>
                      {user?.employeeId && (
                        <span className="text-[9px] text-slate-400 font-mono">
                          {user.employeeId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-navy-800/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-semibold border border-navy-700/80 hover:border-rose-800/60 transition"
                  title="Sign Out of Terminal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
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
