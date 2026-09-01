import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Layers
} from 'lucide-react';

const CATEGORY_COLORS = {
  BURGLARY: 'bg-amber-500 text-amber-500',
  THEFT: 'bg-blue-500 text-blue-500',
  CYBERCRIME: 'bg-purple-500 text-purple-500',
  ROBBERY: 'bg-red-500 text-red-500',
  ASSAULT: 'bg-orange-500 text-orange-500',
  MURDER: 'bg-rose-700 text-rose-700',
  HOMICIDE: 'bg-rose-600 text-rose-600',
  FRAUD: 'bg-emerald-500 text-emerald-500',
  EXTORTION: 'bg-indigo-500 text-indigo-500',
  OTHER: 'bg-slate-500 text-slate-500',
};

const STATUS_COLORS = {
  OPEN: 'bg-blue-500',
  UNDER_INVESTIGATION: 'bg-amber-500',
  SOLVED: 'bg-emerald-500',
  CLOSED: 'bg-slate-600',
};

const PRIORITY_COLORS = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-amber-500',
  MEDIUM: 'bg-blue-500',
  LOW: 'bg-slate-400',
};

export default function AnalyticsCharts({ charts, stats }) {
  if (!charts) return null;

  const { crimeTypes = [], statusDistribution = [], priorityDistribution = [], monthlyTrends = [] } = charts;

  // Calculate totals for proportions
  const totalCrimeCount = crimeTypes.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const totalCaseCount = statusDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const totalPriorityCount = priorityDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const maxMonthlyCount = Math.max(...monthlyTrends.map((m) => m.count), 1);

  return (
    <div className="space-y-6 font-sans">
      {/* 2-Column Primary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Category Distribution Card */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-blue" />
              Crime Incident Category Breakdown
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">{totalCrimeCount} Total Incidents</span>
          </div>

          {crimeTypes.length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center">No crime category data logged.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {crimeTypes.map((item) => {
                const percentage = Math.round((item.count / totalCrimeCount) * 100);
                const colorClass = CATEGORY_COLORS[item.type] || 'bg-brand-blue text-brand-blue';

                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${colorClass.split(' ')[0]}`}></span>
                        {item.type}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${colorClass.split(' ')[0]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Case Status Lifecycle Pipeline Card */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Case Investigation Resolution Pipeline
            </h3>
            <span className="badge-success font-bold font-mono">
              {stats?.resolutionRate || 0}% Resolution Rate
            </span>
          </div>

          {/* Lifecycle Status Progress Bars */}
          <div className="space-y-3 pt-2">
            {[
              { label: 'Open Case Files', key: 'OPEN', color: STATUS_COLORS.OPEN },
              { label: 'Under Active Investigation', key: 'UNDER_INVESTIGATION', color: STATUS_COLORS.UNDER_INVESTIGATION },
              { label: 'Solved Cases', key: 'SOLVED', color: STATUS_COLORS.SOLVED },
              { label: 'Closed / Archived', key: 'CLOSED', color: STATUS_COLORS.CLOSED },
            ].map((st) => {
              const count = statusDistribution.find((s) => s.status === st.key)?.count || 0;
              const percentage = Math.round((count / totalCaseCount) * 100);

              return (
                <div key={st.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${st.color}`}></span>
                      {st.label}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${st.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resolution Metric Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs mt-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Cases</span>
              <p className="font-bold text-navy-900 text-sm mt-0.5">{stats?.totalCases || 0}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Caseload</span>
              <p className="font-bold text-amber-600 text-sm mt-0.5">{stats?.activeCaseload || 0}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Solved/Closed</span>
              <p className="font-bold text-emerald-600 text-sm mt-0.5">{stats?.resolvedCases || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Secondary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Priority Level Distribution */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Caseload Priority Split
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">{totalPriorityCount} Categorized Cases</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: 'Critical', key: 'CRITICAL', bg: 'bg-red-50 text-red-700 border-red-200' },
              { label: 'High', key: 'HIGH', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
              { label: 'Medium', key: 'MEDIUM', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'Low', key: 'LOW', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
            ].map((p) => {
              const count = priorityDistribution.find((item) => item.priority === p.key)?.count || 0;
              const percentage = Math.round((count / totalPriorityCount) * 100);

              return (
                <div key={p.key} className={`p-3.5 rounded-xl border ${p.bg} text-center`}>
                  <span className="block text-[10px] font-bold uppercase tracking-wider">{p.label}</span>
                  <p className="text-xl font-bold mt-1 font-mono">{count}</p>
                  <span className="text-[10px] opacity-75 font-semibold">{percentage}% of cases</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Incident Volume Trend */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-blue" />
              Monthly Incident Trend (Past 6 Months)
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">Incident Volume</span>
          </div>

          {monthlyTrends.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Recent monthly incident trends will populate automatically as FIRs are registered.
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-36 pt-4 px-2">
              {monthlyTrends.map((m) => {
                const heightPercent = Math.max(Math.round((m.count / maxMonthlyCount) * 100), 15);
                return (
                  <div key={m.period} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-navy-900 font-mono">{m.count}</span>
                    <div
                      className="w-full max-w-[36px] bg-brand-blue/80 hover:bg-brand-blue rounded-t-md transition-all duration-500 shadow-sm"
                      style={{ height: `${heightPercent}%` }}
                      title={`${m.period}: ${m.count} registered incidents`}
                    ></div>
                    <span className="text-[10px] text-slate-500 font-semibold truncate w-full text-center">
                      {m.period.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
