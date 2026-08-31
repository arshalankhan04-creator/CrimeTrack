import React from 'react';
import { Shield, Bell, User, Server } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-navy-900 text-white border-b border-navy-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-brand-blue p-2 rounded-lg text-white shadow-md flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">CrimeTrack</span>
              <span className="ml-2 text-xs bg-navy-800 text-slate-400 px-2 py-0.5 rounded border border-navy-700">
                v1.0 • MERN
              </span>
            </div>
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-navy-800 px-3 py-1.5 rounded-md border border-navy-700">
              <Server className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>API Gateway Active</span>
            </div>
            <button 
              type="button"
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-navy-800 transition"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-navy-800">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-semibold">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-white">System Host</p>
                <p className="text-[10px] text-slate-400">ADMIN / OPERATOR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
