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
  const [error, setError] = useState(null);

  // Execute Search Function
  const executeSearch = async (tab = activeEntityTab, customFilters = filters, query = searchTerm) => {
    setLoading(true);
    setError(null);
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
      setError(err.message || 'Error executing search query.');
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

  const getEntityIcon = (type) => {
    switch (type) {
      case 'FIR':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'CASE':
        return <Briefcase className="w-4 h-4 text-purple-600" />;
      case 'CRIME':
        return <Crosshair className="w-4 h-4 text-amber-600" />;
      case 'CRIMINAL':
        return <Users className="w-4 h-4 text-rose-600" />;
      case 'INVESTIGATION':
        return <FileSearch className="w-4 h-4 text-emerald-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEntityBadge = (type) => {
    switch (type) {
      case 'FIR':
        return <span className="badge-info font-bold">FIR COMPLAINT</span>;
      case 'CASE':
        return <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-bold">CASE FILE</span>;
      case 'CRIME':
        return <span className="badge-warning font-bold">CRIME INCIDENT</span>;
      case 'CRIMINAL':
        return <span className="badge-danger font-bold">CRIMINAL PROFILE</span>;
      case 'INVESTIGATION':
        return <span className="badge-success font-bold">INVESTIGATION DOCKET</span>;
      default:
        return <span className="badge-info font-bold">{type}</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-info font-bold">CROSS-ENTITY SEARCH</span>
            <span className="text-xs text-slate-500 font-mono">Omni-Query Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            Advanced Global Search & Multi-Criteria Filtering
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search across FIR complaints, case dockets, forensic logs, and suspect profiles with role scoping and privacy enforcement.
          </p>
        </div>
      </div>

      {/* Omni-Search Form & Filter Drawer */}
      <div className="card-surface p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by FIR number, case ID, suspect name, location, forensic notes, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none transition font-medium"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-xl text-sm shadow transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`w-full sm:w-auto px-4 py-3 border rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shrink-0 ${
              isFilterPanelOpen || Object.values(filters).some(Boolean)
                ? 'bg-blue-50 border-brand-blue text-brand-blue'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters {Object.values(filters).filter(Boolean).length > 0 && `(${Object.values(filters).filter(Boolean).length})`}</span>
            {isFilterPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </form>

        {/* Collapsible Multi-Filter Panel */}
        {isFilterPanelOpen && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Crime Category */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Crime Type</label>
              <select
                value={filters.crimeType}
                onChange={(e) => setFilters({ ...filters, crimeType: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
              >
                <option value="">All Categories</option>
                {CRIME_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Case Status */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Case Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
              >
                <option value="">All Statuses</option>
                {CASE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Case Priority */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Investigation Stage */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Investigation Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
              >
                <option value="">All Stages</option>
                {STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
              >
              </input>
            </div>

            {/* Date To */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
              >
              </input>
            </div>

            {/* Filter Action Buttons */}
            <div className="sm:col-span-3 lg:col-span-6 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-slate-800 font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
              <button
                type="button"
                onClick={() => executeSearch(activeEntityTab, filters, searchTerm)}
                className="px-4 py-1.5 bg-brand-blue text-white font-semibold rounded-lg shadow hover:bg-brand-hoverBlue transition"
              >
                Apply Filters
              </button>
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
            className={`px-4 py-2 rounded-lg transition shrink-0 flex items-center gap-2 ${
              activeEntityTab === tab.id
                ? 'bg-navy-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeEntityTab === tab.id
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Results Header & Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>
          Showing {displayItems.length} matching {activeEntityTab === 'ALL' ? 'records across system' : `${activeEntityTab} entries`}
        </span>
        {searchTerm && (
          <span>
            Query: <strong className="text-navy-900 font-mono">"{searchTerm}"</strong>
          </span>
        )}
      </div>

      {/* Results Feed */}
      {loading ? (
        <div className="card-surface p-12 text-center text-slate-400 text-xs">
          Searching department records...
        </div>
      ) : displayItems.length === 0 ? (
        <div className="card-surface p-12 text-center text-slate-500 text-xs space-y-2">
          <p className="font-semibold text-slate-700">No records found matching your query criteria.</p>
          <p className="text-slate-400">
            Try adjusting your search keywords, clearing filter constraints, or searching another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayItems.map((item, idx) => (
            <div
              key={item._id || idx}
              className="card-surface p-5 hover:border-brand-blue transition group flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-2 flex-1">
                {/* Badge Header Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {getEntityBadge(item.entityType)}
                  <span className="font-mono font-bold text-slate-900">{item.referenceNumber}</span>
                  {item.crimeType && (
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {item.crimeType}
                    </span>
                  )}
                  {item.priority && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold">
                      {item.priority} Priority
                    </span>
                  )}
                  {item.stage && (
                    <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold">
                      Stage: {item.stage}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-sm text-navy-900">{item.title}</h3>
                  {item.description && (
                    <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap pt-1">
                  {item.location && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location}
                    </span>
                  )}
                  {item.assignedOfficer && (
                    <span>Officer: <strong className="text-slate-700">{item.assignedOfficer}</strong></span>
                  )}
                  {item.aliases && item.aliases.length > 0 && (
                    <span>Aliases: <strong className="text-slate-700">{item.aliases.join(', ')}</strong></span>
                  )}
                  {item.date && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Navigation Action */}
              <Link
                to={item.linkUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-brand-blue hover:text-white text-slate-700 font-semibold rounded-lg border border-slate-200 group-hover:border-brand-blue transition text-xs shrink-0 self-end sm:self-center"
              >
                <span>View in {item.entityType}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
