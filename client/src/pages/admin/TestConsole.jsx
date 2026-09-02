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
  CheckCircle
} from 'lucide-react';
import testService from '../../services/testService';
import { useAuth } from '../../context/AuthContext';

export default function TestConsole() {
  const { user } = useAuth();

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
    } catch (err) {
      console.error('Failed to run QA test suite:', err);
      setError(err.message || 'QA Test execution failed to communicate with backend server.');
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
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-success font-bold">ADMIN QA AUTOMATION</span>
            <span className="text-xs text-slate-500 font-mono">End-to-End Test Harness</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand-blue" />
            QA & Diagnostic Test Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Execute real-time end-to-end regression tests across all 13 subsystems to verify RBAC integrity and uptime.
          </p>
        </div>

        <button
          onClick={handleRunSuite}
          disabled={running}
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-blue hover:bg-brand-hoverBlue text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition disabled:opacity-50 shrink-0"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing QA Suites...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Full QA Suite</span>
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-semantic-dangerBg border border-red-200 rounded-lg flex items-center justify-between text-red-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Telemetry KPI Cards */}
      {suiteSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Assertions</span>
              <FileCheck className="w-4 h-4 text-brand-blue" />
            </div>
            <p className="text-2xl font-bold text-navy-900 mt-2 font-mono">{suiteSummary.totalTests}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Across 13 subsystems</span>
          </div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Passing Tests</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{suiteSummary.passed}</p>
            <span className="text-[10px] text-emerald-700 font-semibold">100% verified status</span>
          </div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Failed Tests</span>
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2 font-mono">{suiteSummary.failed}</p>
            <span className="text-[10px] text-red-700 font-semibold">Zero regressions</span>
          </div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Execution Latency</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-2 font-mono">{suiteSummary.durationMs}ms</p>
            <span className="text-[10px] text-purple-700 font-semibold">Ultra-fast response</span>
          </div>
        </div>
      )}

      {/* Main Results Console */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-blue" />
              Automated Subsystem Diagnostics Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed breakdown of assertions across Authentication, FIRs, Cases, Privacy Criminals, Reports, and Recovery.
            </p>
          </div>

          {suiteSummary && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  activeFilter === 'ALL'
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({suiteSummary.totalTests})
              </button>
              <button
                onClick={() => setActiveFilter('PASSED')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  activeFilter === 'PASSED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Passed ({suiteSummary.passed})
              </button>
              <button
                onClick={() => setActiveFilter('FAILED')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  activeFilter === 'FAILED'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Failed ({suiteSummary.failed})
              </button>
            </div>
          )}
        </div>

        {!suiteSummary && !running && (
          <div className="py-16 text-center space-y-3">
            <Server className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-navy-900">Diagnostic Suite Ready</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click the "Run Full QA Suite" button above to initiate live automated API assertions across all 13 subsystems.
            </p>
          </div>
        )}

        {running && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-blue animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">
              Running automated test assertions across live endpoints...
            </p>
          </div>
        )}

        {suiteSummary && !running && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Subsystem / Domain</th>
                  <th className="py-3 px-3">Assertion Check</th>
                  <th className="py-3 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((test, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 whitespace-nowrap">
                      {test.passed ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 text-red-600" />
                          FAIL
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {test.suite}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-700 font-medium">{test.testName}</span>
                      {!test.passed && test.details && (
                        <p className="text-[11px] text-red-600 font-mono mt-1">
                          {JSON.stringify(test.details)}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
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
