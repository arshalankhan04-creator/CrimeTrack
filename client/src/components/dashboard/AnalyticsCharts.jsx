import React from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  Layers
} from 'lucide-react';
import Card from '../common/Card';

const CATEGORY_COLORS = {
  BURGLARY: { bar: 'bg-amber-500', dot: 'bg-amber-500' },
  THEFT: { bar: 'bg-blue-500', dot: 'bg-blue-500' },
  CYBERCRIME: { bar: 'bg-purple-500', dot: 'bg-purple-500' },
  ROBBERY: { bar: 'bg-orange-500', dot: 'bg-orange-500' },
  ASSAULT: { bar: 'bg-rose-500', dot: 'bg-rose-500' },
  MURDER: { bar: 'bg-red-700', dot: 'bg-red-700' },
  HOMICIDE: { bar: 'bg-red-600', dot: 'bg-red-600' },
  FRAUD: { bar: 'bg-indigo-500', dot: 'bg-indigo-500' },
  EXTORTION: { bar: 'bg-teal-500', dot: 'bg-teal-500' },
  OTHER: { bar: 'bg-slate-400', dot: 'bg-slate-400' },
};

const STATUS_CONFIG = {
  OPEN: { label: 'Open Cases', bar: 'bg-blue-500', text: 'text-blue-700' },
  UNDER_INVESTIGATION: { label: 'Under Active Investigation', bar: 'bg-amber-500', text: 'text-amber-700' },
  SOLVED: { label: 'Solved Cases', bar: 'bg-emerald-500', text: 'text-emerald-700' },
  CLOSED: { label: 'Closed / Archived', bar: 'bg-slate-500', text: 'text-slate-700' },
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
    <div className="space-y-6 font-sans min-w-0 w-full">
      {/* 2-Column Primary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 w-full">
        
        {/* Crime Category Distribution Card */}
        <Card
          title="Incident Category Breakdown"
          subtitle={`${totalCrimeCount} Total Classified Records`}
          icon={PieChart}
        >
          {crimeTypes.length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center">No crime incident category data available.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {crimeTypes.map((item) => {
                const percentage = Math.round((item.count / totalCrimeCount) * 100);
                const scheme = CATEGORY_COLORS[item.type] || { bar: 'bg-brand-blue', dot: 'bg-brand-blue' };

                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700 flex items-center gap-1.5 font-semibold">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${scheme.dot}`} />
                        {item.type}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {item.count} <span className="text-slate-400">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${scheme.bar}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Case Status Resolution Pipeline Card */}
        <Card
          title="Case Investigation Lifecycle"
          subtitle={`${stats?.resolutionRate || 0}% Overall Case Resolution Rate`}
          icon={Activity}
          action={
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              {stats?.resolutionRate || 0}% Solved
            </span>
          }
        >
          <div className="space-y-3 pt-1">
            {['OPEN', 'UNDER_INVESTIGATION', 'SOLVED', 'CLOSED'].map((stKey) => {
              const cfg = STATUS_CONFIG[stKey];
              const count = statusDistribution.find((s) => s.status === stKey)?.count || 0;
              const percentage = Math.round((count / totalCaseCount) * 100);

              return (
                <div key={stKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 flex items-center gap-1.5 font-semibold">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.bar}`} />
                      {cfg.label}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {count} <span className="text-slate-400">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${cfg.bar}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Resolution Metrics Strip */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs mt-4 min-w-0">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate" title="Total Cases">Total Cases</span>
              <p className="font-bold text-navy-900 text-sm mt-0.5 font-mono truncate">{stats?.totalCases || 0}</p>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate" title="Active Dossiers">Active Dossiers</span>
              <p className="font-bold text-amber-600 text-sm mt-0.5 font-mono truncate">{stats?.activeCaseload || 0}</p>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate" title="Solved / Closed">Solved / Closed</span>
              <p className="font-bold text-emerald-600 text-sm mt-0.5 font-mono truncate">{stats?.resolvedCases || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 2-Column Secondary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 w-full">
        
        {/* Priority Severity Breakdown */}
        <Card
          title="Caseload Priority Distribution"
          subtitle={`${totalPriorityCount} Categorized Cases`}
          icon={AlertTriangle}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { label: 'Critical', key: 'CRITICAL', bg: 'bg-red-50 text-red-700 border-red-200' },
              { label: 'High', key: 'HIGH', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
              { label: 'Medium', key: 'MEDIUM', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'Low', key: 'LOW', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
            ].map((p) => {
              const count = priorityDistribution.find((item) => item.priority === p.key)?.count || 0;
              const percentage = Math.round((count / totalPriorityCount) * 100);

              return (
                <div key={p.key} className={`p-3 rounded-xl border ${p.bg} text-center`}>
                  <span className="block text-[10px] font-bold uppercase tracking-wider">{p.label}</span>
                  <p className="text-xl font-bold mt-1 font-mono">{count}</p>
                  <span className="text-[10px] opacity-80 font-medium">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Monthly Incident Volume Trend */}
        <Card
          title="Monthly Incident Registration Trend"
          subtitle="Past 6 months incident logs"
          icon={TrendingUp}
        >
          {monthlyTrends.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Incident trends will display here as FIRs are recorded across monthly cycles.
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-32 pt-2 px-1">
              {monthlyTrends.map((m) => {
                const heightPercent = Math.max(Math.round((m.count / maxMonthlyCount) * 100), 12);
                return (
                  <div key={m.period} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-bold text-navy-900 font-mono">{m.count}</span>
                    <div
                      className="w-full max-w-[32px] bg-brand-blue/85 hover:bg-brand-blue rounded-t-md transition-all duration-300 shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                      title={`${m.period}: ${m.count} registered incidents`}
                    />
                    <span className="text-[10px] text-slate-500 font-medium truncate w-full text-center">
                      {m.period.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
