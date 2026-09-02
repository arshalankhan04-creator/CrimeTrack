import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  Crosshair, 
  BarChart3, 
  Layers, 
  RefreshCw, 
  FileSpreadsheet,
  FileCode,
  Shield,
  Clock,
  UserCheck
} from 'lucide-react';
import reportService from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';

const REPORT_TYPES = [
  { id: 'firs', label: 'FIR Complaints Ledger', icon: FileText, desc: 'Detailed log of citizen complaints, crime types, and assigned officers.' },
  { id: 'cases', label: 'Case Clearance Dossier', icon: Briefcase, desc: 'Lifecycle investigation status, priorities, linked FIRs, and resolution dates.' },
  { id: 'crimes', label: 'Crime Incidents Report', icon: Crosshair, desc: 'Category breakdown, severity levels, incident locations, and forensics.' },
];

const CRIME_TYPES = ['THEFT', 'BURGLARY', 'ROBBERY', 'CYBERCRIME', 'ASSAULT', 'MURDER', 'FRAUD', 'EXTORTION', 'OTHER'];
const CASE_STATUSES = ['OPEN', 'UNDER_INVESTIGATION', 'SOLVED', 'CLOSED'];
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function Reports() {
  const { user } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState('firs');
  
  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [crimeType, setCrimeType] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  // Data & State
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        crimeType: crimeType || undefined,
        status: status || undefined,
        priority: priority || undefined,
      };

      const [dataRes, summaryRes] = await Promise.all([
        reportService.getReportData(selectedReportType, params),
        reportService.getSummary(params),
      ]);

      setReportData(dataRes.data.report || []);
      setSummary(summaryRes.data.summary || null);
    } catch (err) {
      console.error('Failed to load report data:', err);
      setError(err.message || 'Error generating report preview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedReportType]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleDownloadCSV = async () => {
    setExporting(true);
    setError(null);
    try {
      const params = {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        crimeType: crimeType || undefined,
        status: status || undefined,
        priority: priority || undefined,
      };
      await reportService.downloadCSV(selectedReportType, params);
      setSuccessMsg('CSV Report downloaded successfully.');
    } catch (err) {
      setError(err.message || 'Failed to download CSV report.');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadJSON = () => {
    try {
      reportService.downloadJSON(selectedReportType, reportData);
      setSuccessMsg('JSON Report downloaded successfully.');
    } catch (err) {
      setError('Failed to export JSON.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-info font-bold">RECORDS & ANALYTICS</span>
            <span className="text-xs text-slate-500 font-mono">Official Police Archive & Export</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            Reports & Data Export Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate official department datasets, export formatted CSV/Excel ledgers, and print official police dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadCSV}
            disabled={exporting || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow transition disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exporting ? 'Generating...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            disabled={loading || reportData.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs border border-slate-300 transition disabled:opacity-50"
          >
            <FileCode className="w-4 h-4 text-purple-600" />
            <span>JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg text-xs shadow transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-semantic-successBg border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-800 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-semantic-dangerBg border border-red-200 rounded-lg flex items-center justify-between text-red-800 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        {REPORT_TYPES.map((rt) => {
          const Icon = rt.icon;
          const isSelected = selectedReportType === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setSelectedReportType(rt.id)}
              className={`p-4 rounded-xl border text-left transition ${
                isSelected
                  ? 'bg-blue-50/80 border-brand-blue ring-1 ring-brand-blue shadow-sm'
                  : 'card-surface hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && <span className="badge-info font-bold text-[10px]">Selected</span>}
              </div>
              <h3 className="font-bold text-sm text-navy-900 mt-3">{rt.label}</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{rt.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Filter Parameters Form */}
      <div className="card-surface p-5 space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-blue" />
            Report Parameters & Range Filters
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Filtered Scope: {user?.role}
          </span>
        </div>

        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          {selectedReportType === 'firs' && (
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Crime Category</label>
              <select
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
              >
                <option value="">All Categories</option>
                {CRIME_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedReportType === 'cases' && (
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Case Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
              >
                <option value="">All Statuses</option>
                {CASE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedReportType === 'cases' && (
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Update Preview</span>
            </button>
          </div>
        </form>
      </div>

      {/* Summary KPI Banner */}
      {summary && (
        <div className="card-surface p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Registered FIRs</span>
            <p className="text-xl font-bold text-navy-900 mt-0.5 font-mono">{summary.totalFIRs}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Case Files</span>
            <p className="text-xl font-bold text-navy-900 mt-0.5 font-mono">{summary.totalCases}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Cases Solved/Closed</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5 font-mono">{summary.resolved}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Resolution Clearance</span>
            <p className="text-xl font-bold text-brand-blue mt-0.5 font-mono">{summary.resolutionRate}%</p>
          </div>
        </div>
      )}

      {/* Official Police Printable Header (Visible only when printed) */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">
          State Police Department — Official Record Dossier
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          CrimeTrack Law Enforcement & Investigation Management System
        </p>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-4 border-t border-slate-300 pt-2">
          <span>Report Type: {selectedReportType.toUpperCase()}</span>
          <span>Printed By: {user?.name} ({user?.employeeId})</span>
          <span>Date: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Live Data Preview Table */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-brand-blue" />
            Dataset Preview ({reportData.length} Records)
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Format: {selectedReportType.toUpperCase()} Ledger
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading report dataset...</div>
        ) : reportData.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No records found for the selected parameters. Adjust your filters or dates.
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* FIR Table */}
            {selectedReportType === 'firs' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">FIR Number</th>
                    <th className="py-3 px-3">Crime Category</th>
                    <th className="py-3 px-3">Complainant</th>
                    <th className="py-3 px-3">Incident Date</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Assigned Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-navy-900">{f.firNumber}</td>
                      <td className="py-3 px-3">
                        <span className="badge-info font-bold">{f.crimeType}</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{f.complainantName}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {new Date(f.incidentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{f.incidentLocation || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-700">
                        {f.assignedOfficerId?.name || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Case Table */}
            {selectedReportType === 'cases' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Case Number</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Linked FIR</th>
                    <th className="py-3 px-3">Investigating Officer</th>
                    <th className="py-3 px-3">Opened Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-navy-900">{c.caseNumber}</td>
                      <td className="py-3 px-3">
                        <span className="badge-warning font-bold">{c.status}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="badge-danger font-bold">{c.priority}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{c.firId?.firNumber || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-800 font-medium">
                        {c.assignedOfficerId?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Crime Table */}
            {selectedReportType === 'crimes' && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Incident Date</th>
                    <th className="py-3 px-3">Associated Case</th>
                    <th className="py-3 px-3">Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((cr) => (
                    <tr key={cr._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-bold text-navy-900">{cr.category}</td>
                      <td className="py-3 px-3">
                        <span className="badge-danger font-bold">{cr.severity}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{cr.location}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {new Date(cr.dateTime).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{cr.caseId?.caseNumber || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-800">
                        {cr.caseId?.assignedOfficerId?.name || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
