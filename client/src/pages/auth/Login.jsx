import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both official email address and password.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email.trim(), password);
      // Determine redirection based on user role
      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname, { replace: true });
      } else if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.role === 'OFFICER') {
        navigate('/officer/dashboard', { replace: true });
      } else if (user?.role === 'VIEWER') {
        navigate('/viewer/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Department Emblem */}
        <div className="inline-flex p-3 bg-gradient-to-br from-brand-blue to-blue-700 rounded-2xl text-white shadow-xl shadow-blue-950/60 ring-4 ring-navy-900">
          <Shield className="w-9 h-9 text-white" />
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-white">
          CrimeTrack Central
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Law Enforcement Case & Criminal Intelligence Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-navy-900 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-navy-800">
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-red-200 text-xs font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4.5" onSubmit={handleLogin}>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="officer@crimetrack.gov"
                  className="block w-full pl-9 pr-3 py-2.5 bg-navy-950 border border-navy-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 bg-navy-950 border border-navy-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-2"
            >
              Authenticate & Enter Station
            </Button>
          </form>

          {/* Quick Role Test Credentials Selection */}
          <div className="mt-8 pt-6 border-t border-navy-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Station Role Test Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@crimetrack.gov', 'Admin@123')}
                className="p-2.5 bg-navy-950 hover:bg-navy-800 border border-navy-800 hover:border-purple-800/80 rounded-xl text-center transition group"
              >
                <span className="block text-[11px] font-bold text-purple-400 group-hover:text-purple-300">ADMIN</span>
                <span className="block text-[9px] text-slate-500 mt-0.5">Global Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('officer.sharma@crimetrack.gov', 'Officer@123')}
                className="p-2.5 bg-navy-950 hover:bg-navy-800 border border-navy-800 hover:border-blue-800/80 rounded-xl text-center transition group"
              >
                <span className="block text-[11px] font-bold text-brand-blue group-hover:text-blue-300">OFFICER</span>
                <span className="block text-[9px] text-slate-500 mt-0.5">Investigator</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('viewer.patel@crimetrack.gov', 'Viewer@123')}
                className="p-2.5 bg-navy-950 hover:bg-navy-800 border border-navy-800 hover:border-amber-800/80 rounded-xl text-center transition group"
              >
                <span className="block text-[11px] font-bold text-amber-400 group-hover:text-amber-300">VIEWER</span>
                <span className="block text-[9px] text-slate-500 mt-0.5">Desk Read-only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Official Security Disclaimer */}
        <p className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Authorized law enforcement personnel only. Session activity is audited.</span>
        </p>
      </div>
    </div>
  );
}
