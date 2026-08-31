import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email, password);
      // Determine redirection based on user role
      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'OFFICER') {
        navigate('/officer/dashboard', { replace: true });
      } else if (user.role === 'VIEWER') {
        navigate('/viewer/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
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
    <div className="min-h-screen bg-navy-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Police Badge / Logo */}
        <div className="inline-flex p-3 bg-brand-blue rounded-2xl text-white shadow-xl ring-4 ring-navy-800">
          <Shield className="w-10 h-10" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
          CrimeTrack Portal
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Police Crime & Case Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-navy-800 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-navy-700">
          {error && (
            <div className="mb-6 p-3.5 bg-semantic-dangerBg border border-red-500/30 rounded-lg flex items-center gap-3 text-semantic-danger text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                Official Email Address
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="officer@crimetrack.gov"
                  className="block w-full pl-10 pr-3 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-navy-900 border border-navy-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-blue hover:bg-brand-hoverBlue text-white text-sm font-semibold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Station Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Selection */}
          <div className="mt-8 pt-6 border-t border-navy-700">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Quick Role Test Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@crimetrack.gov', 'Admin@123')}
                className="p-2 bg-navy-900 hover:bg-navy-700 border border-navy-700 rounded-lg text-center transition group"
              >
                <span className="block text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300">ADMIN</span>
                <span className="block text-[9px] text-slate-400">Global</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('officer.sharma@crimetrack.gov', 'Officer@123')}
                className="p-2 bg-navy-900 hover:bg-navy-700 border border-navy-700 rounded-lg text-center transition group"
              >
                <span className="block text-[11px] font-bold text-brand-blue group-hover:text-blue-300">OFFICER</span>
                <span className="block text-[9px] text-slate-400">Assigned</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('viewer.patel@crimetrack.gov', 'Viewer@123')}
                className="p-2 bg-navy-900 hover:bg-navy-700 border border-navy-700 rounded-lg text-center transition group"
              >
                <span className="block text-[11px] font-bold text-amber-400 group-hover:text-amber-300">VIEWER</span>
                <span className="block text-[9px] text-slate-400">Read-only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <p className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          Restricted access. All authentication attempts are logged.
        </p>
      </div>
    </div>
  );
}
