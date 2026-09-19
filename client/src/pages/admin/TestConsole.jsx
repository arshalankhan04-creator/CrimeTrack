import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Zap, 
  Layers, 
  RefreshCw,
  Server,
  FileCheck,
  CheckCircle,
  Terminal,
  Cpu
} from 'lucide-react';
import testService from '../../services/testService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

export default function TestConsole() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [running, setRunning] = useState(false);
  const [suiteSummary, setSuiteSummary] = useState(null);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PASSED' | 'FAILED'

  const handleRunSuite = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await testService.runTestSuite();
      setSuiteSummary(res.data);
      if (res.data?.failed === 0) {
        showSuccess(`Full QA Suite completed: All ${res.data?.totalTests} subsystem assertions PASSED.`);
      } else {
        showError(`QA Suite completed with ${res.data?.failed} failures. Review ledger below.`);
      }
    } catch (err) {
      console.error('Failed to run QA test suite:', err);
      const msg = err.message || 'QA Test execution failed to communicate with backend server.';
      setError(msg);
      showError(msg);
    } finally {
      setRunning(false);
    }
  };

  const getFilteredResults = () => {
    if (!suiteSummary || !suiteSummary.results) return [];
    if (activeFilter === 'PASSED') return suiteSummary.results.filter((r) => r.passed);
    if (activeFilter === 'FAILED') return suiteSummary.results.filter((r) => !r.passed);
    return suiteSummary.results;
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="QA Automation & Diagnostic Test Harness"
        description="Execute real-time end-to-end regression tests across all 13 subsystems to verify RBAC integrity, data validation, and API contracts."
        breadcrumbs={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'Diagnostic Console' },
        ]}
        actions={
          <Button
            variant="primary"
            icon={Play}
            loading={running}
            onClick={handleRunSuite}
          >
            {running ? 'Executing QA Suite...' : 'Run Full QA Suite'}
          </Button>
        }
      />

      {error && (
        <ErrorState
          title="QA Harness Communication Error"
          message={error}
          onRetry={handleRunSuite}
        />
      )}

      {/* Telemetry KPI Cards */}
      {suiteSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Assertions"
            value={suiteSummary.totalTests}
            subtitle="Across 13 subsystems"
            icon={FileCheck}
            variant="primary"
          />
          <StatCard
            title="Passing Tests"
            value={suiteSummary.passed}
            subtitle="100% verified status"
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Failed Tests"
            value={suiteSummary.failed}
            subtitle={suiteSummary.failed === 0 ? 'Zero regressions' : 'Needs attention'}
            icon={XCircle}
            variant={suiteSummary.failed > 0 ? 'danger' : 'neutral'}
          />
          <StatCard
            title="Execution Latency"
            value={`${suiteSummary.durationMs}ms`}
            subtitle="Diagnostic roundtrip"
            icon={Clock}
            variant="neutral"
          />
        </div>
      )}

      {/* Main Results Console */}
      <div className="card-surface p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-blue" />
              Automated Subsystem Diagnostics Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of assertions across Authentication, FIRs, Cases, Criminal Registry, Reports, and Recovery.
            </p>
          </div>

          {suiteSummary && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-200/70 p-1 rounded-lg">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  activeFilter === 'ALL'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                All ({suiteSummary.totalTests})
              </button>
              <button
                onClick={() => setActiveFilter('PASSED')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  activeFilter === 'PASSED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Passed ({suiteSummary.passed})
              </button>
              <button
                onClick={() => setActiveFilter('FAILED')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  activeFilter === 'FAILED'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-red-700'
                }`}
              >
                Failed ({suiteSummary.failed})
              </button>
            </div>
          )}
        </div>

        {!suiteSummary && !running && (
          <div className="p-12">
            <EmptyState
              icon={Terminal}
              title="Diagnostic Suite Ready"
              description="Click 'Run Full QA Suite' to initiate live automated API assertions across all core backend subsystems."
              actionLabel="Run QA Suite"
              onAction={handleRunSuite}
            />
          </div>
        )}

        {running && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-blue animate-spin mx-auto" />
            <p className="text-xs font-semibold text-navy-900">
              Executing automated diagnostic assertions across live endpoints...
            </p>
            <p className="text-xs text-slate-400 font-mono">Running test suites...</p>
          </div>
        )}

        {suiteSummary && !running && (
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Subsystem / Domain</th>
                  <th>Assertion Check</th>
                  <th className="text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((test, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap">
                      {test.passed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                          <XCircle className="w-3 h-3 text-red-600" />
                          FAIL
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-200">
                        {test.suite}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-800 font-medium text-xs">{test.testName}</span>
                      {!test.passed && test.details && (
                        <div className="p-2 mt-1.5 bg-red-50 border border-red-200 rounded text-red-900 font-mono text-[11px]">
                          {JSON.stringify(test.details, null, 2)}
                        </div>
                      )}
                    </td>
                    <td className="text-right text-slate-400 font-mono text-xs whitespace-nowrap">
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

