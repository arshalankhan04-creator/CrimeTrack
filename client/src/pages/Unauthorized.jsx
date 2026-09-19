import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'OFFICER') return '/officer/dashboard';
    if (user?.role === 'VIEWER') return '/viewer/dashboard';
    return '/';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full card-surface p-8 text-center border-red-200 shadow-lg">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <Badge variant="danger">HTTP 403 FORBIDDEN</Badge>
        
        <h1 className="text-2xl font-bold text-navy-900 mt-3">
          Access Restricted
        </h1>
        
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Your current security credential (<strong className="text-navy-900 font-mono">{user?.role || 'Guest'}</strong>) is not authorized to access this department console or workflow resource.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate(getDashboardPath())}
            className="w-full sm:w-auto"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

