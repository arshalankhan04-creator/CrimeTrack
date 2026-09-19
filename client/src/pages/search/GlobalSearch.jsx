import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  FileText, 
  Briefcase, 
  Users, 
  FileSearch, 
  Layers, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Tag,
  Crosshair,
  RotateCcw
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import searchService from '../../services/searchService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Common UI Components
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { ListSkeleton } from '../../components/common/Skeletons';

const CRIME_TYPES = [
  'THEFT',
  'BURGLARY',
  'ROBBERY',
  'CYBERCRIME',
  'ASSAULT',
  'MURDER',
  'FRAUD',
  'EXTORTION',
  'OTHER',
];

const CASE_STATUSES = ['OPEN', 'UNDER_INVESTIGATION', 'SOLVED', 'CLOSED'];
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STAGES = [
  'INITIAL_EVALUATION',
  'EVIDENCE_COLLECTION',
  'INTERROGATION',
  'FORENSIC_ANALYSIS',
  'FINAL_REPORT',
];

export default function GlobalSearch() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeEntityTab, setActiveEntityTab] = useState('ALL');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    crimeType: '',
    status: '',
    priority: '',
    stage: '',
    dateFrom: '',
    dateTo: '',
  });

  // Results State
  const [results, setResults] = useState({
    totalCount: 0,
    firs: [],
    cases: [],
    crimes: [],
    criminals: [],
    investigations: [],
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Execute Search Function
  const executeSearch = async (tab = activeEntityTab, customFilters = filters, query = searchTerm) => {
    setLoading(true);
    try {
      const params = {
        q: query,
        entity: tab,
        ...customFilters,
      };

      // Clean empty keys
      Object.keys(params).forEach((k) => {
        if (!params[k]) delete params[k];
      });

      const res = await searchService.searchGlobal(params);
      setResults(res.data || {
        totalCount: 0,
        firs: [],
        cases: [],
        crimes: [],
        criminals: [],
        investigations: [],
      });
      setHasSearched(true);
    } catch (err) {
      console.error('Search failed:', err);
      toast.error(err.message || 'Error executing search query.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(activeEntityTab, filters, searchTerm);
  };

  const handleTabChange = (newTab) => {
    setActiveEntityTab(newTab);
    executeSearch(newTab, filters, searchTerm);
  };

  const handleResetFilters = () => {
    const cleanFilters = {
      crimeType: '',
      status: '',
      priority: '',
      stage: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(cleanFilters);
    setSearchTerm('');
    executeSearch(activeEntityTab, cleanFilters, '');
  };

  // Compile Active Results List for display
  const getDisplayItems = () => {
    if (activeEntityTab === 'FIR') return results.firs;
    if (activeEntityTab === 'CASE') return results.cases;
    if (activeEntityTab === 'CRIME') return results.crimes;
    if (activeEntityTab === 'CRIMINAL') return results.criminals;
    if (activeEntityTab === 'INVESTIGATION') return results.investigations;

    // ALL: Combine and sort
    const all = [
      ...results.firs,
      ...results.cases,
      ...results.crimes,
      ...results.criminals,
      ...results.investigations,
    ];
    return all;
  };

  const displayItems = getDisplayItems();

  const getEntityBadge = (type) => {
    switch (type) {
      case 'FIR':
        return <Badge variant="info">FIR COMPLAINT</Badge>;
      case 'CASE':
        return <Badge variant="purple">CASE FILE</Badge>;
      case 'CRIME':
        return <Badge variant="warning">CRIME INCIDENT</Badge>;
      case 'CRIMINAL':
        return <Badge variant="danger">CRIMINAL PROFILE</Badge>;
      case 'INVESTIGATION':
        return <Badge variant="success">INVESTIGATION DOCKET</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Global Search & Multi-Entity Query"
        subtitle="Search across FIR complaints, case dockets, forensic logs, and suspect profiles with role scoping."
        badge="OMNI-QUERY ENGINE"
      />

      {/* Search Input and Collapsible Filters */}
      <div className="card-surface p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by FIR number, case ID, suspect name, location, forensic notes, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  executeSearch(activeEntityTab, filters, '');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Search}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Search
          </Button>

          <Button
            type="button"
            variant={isFilterPanelOpen || Object.values(filters).some(Boolean) ? 'secondary' : 'outline'}
            size="md"
            icon={Filter}
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className="w-full sm:w-auto"
          >
            Filters {Object.values(filters).filter(Boolean).length > 0 && `(${Object.values(filters).filter(Boolean).length})`}
          </Button>
        </form>

        {/* Collapsible Multi-Filter Panel */}
        {isFilterPanelOpen && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Crime Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Crime Type</label>
              <select
                value={filters.crimeType}
                onChange={(e) => setFilters({ ...filters, crimeType: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-brand-blue"
              >
                <option value="">All Categories</option>
                {CRIME_TYPES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Case Status */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Case Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-brand-blue"
              >
                <option value="">All Statuses</option>
                {CASE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Case Priority */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-brand-blue"
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Investigation Stage */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Investigation Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-brand-blue"
              >
                <option value="">All Stages</option>
                {STAGES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Actions */}
            <div className="sm:col-span-3 lg:col-span-6 flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="xs"
                icon={RotateCcw}
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={() => executeSearch(activeEntityTab, filters, searchTerm)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Entity Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
        {[
          { id: 'ALL', label: 'All Results', count: results.totalCount },
          { id: 'FIR', label: 'FIR Complaints', count: results.firs.length },
          { id: 'CASE', label: 'Case Files', count: results.cases.length },
          { id: 'CRIME', label: 'Crime Incidents', count: results.crimes.length },
          { id: 'CRIMINAL', label: 'Suspect Profiles', count: results.criminals.length },
          { id: 'INVESTIGATION', label: 'Investigations', count: results.investigations.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-3.5 py-2 rounded-xl transition shrink-0 flex items-center gap-2 text-xs font-medium ${
              activeEntityTab === tab.id
                ? 'bg-navy-950 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeEntityTab === tab.id
                  ? 'bg-navy-800 text-slate-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>
          Showing {displayItems.length} matching {activeEntityTab === 'ALL' ? 'records across registry' : `${activeEntityTab} entries`}
        </span>
        {searchTerm && (
          <span>
            Query: <strong className="text-navy-950 font-mono">"{searchTerm}"</strong>
          </span>
        )}
      </div>

      {/* Results Feed */}
      {loading ? (
        <ListSkeleton items={5} />
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Matching Records"
          description="No records found matching your query criteria. Try adjusting keywords or clearing filter constraints."
          action={
            (searchTerm || Object.values(filters).some(Boolean)) ? (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear Search & Filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 min-w-0 w-full">
          {displayItems.map((item, idx) => (
            <div
              key={item._id || idx}
              className="card-surface p-5 hover:border-brand-blue/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs group min-w-0 w-full"
            >
              <div className="space-y-2 flex-1 min-w-0">
                {/* Header Row */}
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  {getEntityBadge(item.entityType)}
                  <span className="font-mono font-bold text-navy-950 truncate max-w-[200px]">{item.referenceNumber}</span>
                  {item.crimeType && (
                    <Badge variant="neutral">{item.crimeType}</Badge>
                  )}
                  {item.priority && (
                    <Badge variant={item.priority === 'CRITICAL' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'info'}>
                      {item.priority} Priority
                    </Badge>
                  )}
                  {item.stage && (
                    <Badge variant="purple">Stage: {item.stage}</Badge>
                  )}
                </div>

                {/* Title & Description */}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-navy-950 break-words">{item.title}</h3>
                  {item.description && (
                    <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed text-xs break-words">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap pt-1 min-w-0">
                  {item.location && (
                    <span className="flex items-center gap-1 text-slate-500 truncate max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </span>
                  )}
                  {item.assignedOfficer && (
                    <span className="truncate max-w-[200px]">Officer: <strong className="text-slate-700">{item.assignedOfficer}</strong></span>
                  )}
                  {item.aliases && item.aliases.length > 0 && (
                    <span className="truncate max-w-[200px]">Aliases: <strong className="text-slate-700">{item.aliases.join(', ')}</strong></span>
                  )}
                  {item.date && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <Link
                to={item.linkUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-brand-blue hover:text-white text-slate-700 font-semibold rounded-lg border border-slate-200 group-hover:border-brand-blue transition text-xs shrink-0 self-end sm:self-center"
              >
                <span>View {item.entityType}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

