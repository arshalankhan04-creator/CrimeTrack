import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  Briefcase, 
  Crosshair, 
  BarChart3, 
  Layers, 
  RefreshCw, 
  FileSpreadsheet,
  FileCode,
  Shield,
  Clock,
  UserCheck,
  CheckCircle2,
  Users,
  Eye
} from 'lucide-react';
import reportService from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Common UI Components
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import { TableSkeleton } from '../../components/common/Skeletons';
import EmptyState from '../../components/common/EmptyState';

const REPORT_TYPES = [
  { id: 'firs', label: 'FIR Complaints Ledger', icon: FileText, desc: 'Detailed log of citizen complaints, crime types, and assigned officers.' },
  { id: 'cases', label: 'Case Clearance Dossier', icon: Briefcase, desc: 'Lifecycle investigation status, priorities, linked FIRs, and resolution dates.' },
  { id: 'crimes', label: 'Crime Incidents Report', icon: Crosshair, desc: 'Category breakdown, severity levels, incident locations, and forensics.' },
  { id: 'criminals', label: 'Criminal Master Registry', icon: Users, desc: 'Registered offender identities, known aliases, physical marks, and linked case counts.' },
];

const CRIME_TYPES = ['THEFT', 'BURGLARY', 'ROBBERY', 'CYBERCRIME', 'ASSAULT', 'MURDER', 'FRAUD', 'EXTORTION', 'OTHER'];
const CASE_STATUSES = ['OPEN', 'UNDER_INVESTIGATION', 'SOLVED', 'CLOSED'];
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function Reports() {
  const { user } = useAuth();
  const toast = useToast();
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
  const [exportingType, setExportingType] = useState(null); // 'pdf' | 'excel' | 'csv' | null

  const fetchReport = async () => {
    setLoading(true);
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
      toast.error(err.message || 'Error generating report preview.');
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

  const getFilterParams = () => ({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    crimeType: crimeType || undefined,
    status: status || undefined,
    priority: priority || undefined,
  });

  const handleDownloadPDF = async () => {
    setExportingType('pdf');
    try {
      await reportService.downloadPDF(selectedReportType, getFilterParams());
      toast.success('Native PDF Report exported successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to download PDF report.');
    } finally {
      setExportingType(null);
    }
  };

  const handleDownloadExcel = async () => {
    setExportingType('excel');
    try {
      await reportService.downloadExcel(selectedReportType, getFilterParams());
      toast.success('Excel (.xlsx) Report exported successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to download Excel report.');
    } finally {
      setExportingType(null);
    }
  };

  const handleDownloadCSV = async () => {
    setExportingType('csv');
    try {
      await reportService.downloadCSV(selectedReportType, getFilterParams());
      toast.success('CSV Report exported successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to download CSV report.');
    } finally {
      setExportingType(null);
    }
  };

  const handleDownloadJSON = () => {
    try {
      reportService.downloadJSON(selectedReportType, reportData);
      toast.success('JSON dataset downloaded successfully.');
    } catch (err) {
      toast.error('Failed to export JSON.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="print:hidden">
        <PageHeader
          title="Reports & Intelligence Export"
          subtitle="Generate official department datasets, export structured PDF/Excel/CSV ledgers, and print compliance dossiers."
          badge="DATA EXPORT CENTER"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                loading={loading}
                onClick={fetchReport}
              >
                Preview
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={FileText}
                loading={exportingType === 'pdf'}
                onClick={handleDownloadPDF}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Export PDF
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={FileSpreadsheet}
                loading={exportingType === 'excel'}
                onClick={handleDownloadExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Export Excel
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                loading={exportingType === 'csv'}
                onClick={handleDownloadCSV}
              >
                Export CSV
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={handlePrint}
              >
                Print
              </Button>
            </div>
          }
        />
      </div>

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 print:hidden">
        {REPORT_TYPES.map((rt) => {
          const Icon = rt.icon;
          const isSelected = selectedReportType === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setSelectedReportType(rt.id)}
              className={`p-4 rounded-xl border text-left transition ${
                isSelected
                  ? 'bg-navy-50/70 border-brand-blue ring-1 ring-brand-blue shadow-sm'
                  : 'card-surface hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-brand-blue text-white shadow-sm' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && <Badge variant="info">Selected</Badge>}
              </div>
              <h3 className="font-bold text-sm text-navy-950 mt-3">{rt.label}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rt.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Filter Parameters Form */}
      <div className="card-surface p-5 space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-blue" />
            Report Parameters & Scope Filters
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Scope: {user?.role}
          </span>
        </div>

        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-xs"
            />
          </div>

          {(selectedReportType === 'firs' || selectedReportType === 'crimes') && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Crime Category</label>
              <select
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 text-xs font-medium"
              >
                <option value="">All Categories</option>
                {CRIME_TYPES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {selectedReportType === 'cases' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Case Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 text-xs font-medium"
              >
                <option value="">All Statuses</option>
                {CASE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {selectedReportType === 'cases' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 text-xs font-medium"
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={RefreshCw}
              loading={loading}
              className="w-full h-[38px]"
            >
              Update Preview
            </Button>
          </div>
        </form>
      </div>

      {/* Summary KPI Banner */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
          <StatCard
            title="Total FIRs"
            value={summary.totalFIRs || 0}
            subtitle="Incident Complaints"
            icon={FileText}
          />
          <StatCard
            title="Total Case Files"
            value={summary.totalCases || 0}
            subtitle="Investigation Files"
            icon={Briefcase}
          />
          <StatCard
            title="Cases Cleared"
            value={summary.resolved || 0}
            subtitle="Closed / Solved Cases"
            icon={CheckCircle2}
            className="border-emerald-200"
          />
          <StatCard
            title="Clearance Rate"
            value={`${summary.resolutionRate || 0}%`}
            subtitle="Clearance Efficiency"
            icon={BarChart3}
            trend={{ direction: 'up', label: 'Dept Avg' }}
          />
        </div>
      )}

      {/* Official Police Printable Header (Visible only on print/export paper) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4 font-sans">
        <div className="flex items-center justify-between pb-2 border-b border-slate-300">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
              State Police Department — Official Record Dossier
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              CrimeTrack Law Enforcement & Investigation Management Platform
            </p>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-700">
            <p className="font-bold text-slate-900">REPORT: {selectedReportType.toUpperCase()} REGISTRY</p>
            <p className="text-slate-500">Security Classification: Confidential</p>
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 pt-2">
          <span>Printed By: {user?.name} ({user?.employeeId || user?.role})</span>
          <span>Timestamp: {new Date().toLocaleString()}</span>
          <span>Matched Records: {reportData.length}</span>
        </div>
      </div>

      {/* Live Data Preview Table */}
      <div className="card-surface overflow-hidden print:border print:border-slate-300 print:rounded-none">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <h2 className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-brand-blue" />
            Dataset Preview ({reportData.length} Records)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            {selectedReportType.toUpperCase()} Ledger
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : reportData.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="No Data Available"
            description="No records found matching the specified parameters and date bounds."
          />
        ) : (
          <div className="overflow-x-auto print:overflow-visible">
            {/* FIR Table */}
            {selectedReportType === 'firs' && (
              <table className="app-table">
                <thead>
                  <tr>
                    <th>FIR Number</th>
                    <th>Crime Category</th>
                    <th>Complainant</th>
                    <th>Incident Date</th>
                    <th>Location</th>
                    <th>Assigned Officer</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((f) => (
                    <tr key={f._id}>
                      <td className="font-mono font-bold text-navy-950 text-xs">{f.firNumber}</td>
                      <td>
                        <Badge variant="crime" crimeType={f.crimeType}>{f.crimeType}</Badge>
                      </td>
                      <td className="font-medium text-slate-800 text-xs">{f.complainantName}</td>
                      <td className="text-slate-500 font-mono text-xs">
                        {new Date(f.incidentDate).toLocaleDateString()}
                      </td>
                      <td className="text-slate-600 text-xs">{f.incidentPlace || 'N/A'}</td>
                      <td className="text-slate-700 text-xs font-medium">
                        {f.assignedOfficerId?.name || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Case Table */}
            {selectedReportType === 'cases' && (
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Linked FIR</th>
                    <th>Investigating Officer</th>
                    <th>Opened Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((c) => (
                    <tr key={c._id}>
                      <td className="font-mono font-bold text-navy-950 text-xs">{c.caseNumber}</td>
                      <td>
                        <Badge variant="status" status={c.status}>{c.status}</Badge>
                      </td>
                      <td>
                        <Badge variant="priority" priority={c.priority}>{c.priority}</Badge>
                      </td>
                      <td className="font-mono text-slate-700 text-xs">{c.firId?.firNumber || 'N/A'}</td>
                      <td className="text-slate-800 font-medium text-xs">
                        {c.assignedOfficerId?.name || 'Unassigned'}
                      </td>
                      <td className="text-slate-500 font-mono text-xs">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Crime Table */}
            {selectedReportType === 'crimes' && (
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Severity</th>
                    <th>Location</th>
                    <th>Incident Date</th>
                    <th>Associated Case</th>
                    <th>Officer</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((cr) => (
                    <tr key={cr._id}>
                      <td className="font-bold text-navy-950 text-xs">{cr.crimeType}</td>
                      <td>
                        <Badge variant={cr.severity === 'HIGH' || cr.severity === 'CRITICAL' ? 'danger' : 'warning'}>
                          {cr.severity}
                        </Badge>
                      </td>
                      <td className="text-slate-700 text-xs">{cr.location}</td>
                      <td className="text-slate-500 font-mono text-xs">
                        {new Date(cr.crimeDate).toLocaleDateString()}
                      </td>
                      <td className="font-mono text-slate-700 text-xs">{cr.caseId?.caseNumber || 'N/A'}</td>
                      <td className="text-slate-800 text-xs font-medium">
                        {cr.caseId?.assignedOfficerId?.name || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Criminal Table */}
            {selectedReportType === 'criminals' && (
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Aliases</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Physical Marks</th>
                    <th>Associated Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((crm) => (
                    <tr key={crm._id}>
                      <td className="font-bold text-navy-950 text-xs">{crm.name}</td>
                      <td className="text-slate-600 text-xs">{crm.aliases && crm.aliases.length > 0 ? crm.aliases.join(', ') : 'None'}</td>
                      <td className="font-mono text-slate-700 text-xs">{crm.age ?? 'N/A'}</td>
                      <td className="text-slate-700 text-xs">{crm.gender || 'N/A'}</td>
                      <td className="text-slate-600 text-xs">{crm.identifyingMarks || 'None'}</td>
                      <td className="font-mono font-bold text-brand-blue text-xs">
                        {crm.associatedCaseIds ? crm.associatedCaseIds.length : 0} Cases
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


