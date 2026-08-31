import React from 'react';
import { Shield, Bell, User, LogOut, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') {
      return <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">ADMIN</span>;
    }
    if (user.role === 'OFFICER') {
      return <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold">OFFICER</span>;
    }
    if (user.role === 'VIEWER') {
      return <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">VIEWER</span>;
    }
    return null;
  };

  return (
    <header className="bg-navy-900 text-white border-b border-navy-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-brand-blue p-2 rounded-lg text-white shadow-md flex items-center justify-center group-hover:bg-brand-hoverBlue transition">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">CrimeTrack</span>
              <span className="ml-2 text-xs bg-navy-800 text-slate-400 px-2 py-0.5 rounded border border-navy-700">
                v1.0 • MERN
              </span>
            </div>
          </Link>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-semibold border border-navy-700">
                    <User className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-white">{user?.name}</p>
                      {getRoleBadge()}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 bg-navy-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 rounded-lg text-xs font-medium border border-navy-700 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-hoverBlue text-white text-xs font-semibold rounded-lg shadow transition"
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
