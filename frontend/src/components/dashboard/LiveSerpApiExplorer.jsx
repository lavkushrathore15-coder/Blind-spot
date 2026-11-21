import React, { useState, useEffect } from 'react';
import {
  Globe,
  Newspaper,
  ShieldAlert,
  Bus,
  AlertTriangle,
  Radio,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Alert from '../common/Alert';
import intelligenceService from '../../services/intelligenceService';

export const LiveSerpApiExplorer = ({ destinationName, className }) => {
  const [status, setStatus] = useState(null);
  const [activeStream, setActiveStream] = useState('live-feed');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Check backend SerpApi status
  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await intelligenceService.getStatus();
        if (mounted) setStatus(res?.data);
      } catch (err) {
        if (mounted) {
          setStatus({
            configured: false,
            verified: false,
            message: 'Unable to reach backend intelligence service.',
          });
        }
      }
    };
    fetchStatus();
    return () => {
      mounted = false;
    };
  }, []);

  // Automatically trigger initial live stream fetch when SerpApi is configured
  useEffect(() => {
    if (status?.configured && destinationName && !results && !isLoading) {
      handleFetchStream();
    }
  }, [status?.configured, destinationName]);

  const streams = [
    { id: 'live-feed', label: 'All 5 Streams (Aggregated)', icon: Layers },
    { id: 'search', label: '1. Destination Search', icon: Globe },
    { id: 'news', label: '2. Google News', icon: Newspaper },
    { id: 'advisories', label: '3. Travel Advisories', icon: ShieldAlert },
    { id: 'transit', label: '4. Transit Disruptions', icon: Bus },
    { id: 'scams', label: '5. Scams & Street Concerns', icon: AlertTriangle },
  ];

  const handleFetchStream = async () => {
    if (!destinationName) return;
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      let res;
      switch (activeStream) {
        case 'search':
          res = await intelligenceService.searchDestination(destinationName);
          break;
        case 'news':
          res = await intelligenceService.searchNews(destinationName);
          break;
        case 'advisories':
          res = await intelligenceService.searchAdvisories(destinationName);
          break;
        case 'transit':
          res = await intelligenceService.searchTransit(destinationName);
          break;
        case 'scams':
          res = await intelligenceService.searchScams(destinationName);
          break;
        case 'live-feed':
        default:
          res = await intelligenceService.getLiveFeed(destinationName);
          break;
      }
      setResults(res.data);
    } catch (err) {
      setError(err.message || 'Failed to query live SerpApi intelligence stream.');
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigured = Boolean(status?.configured);

  return (
    <div className={`glass-card rounded-2xl p-6 border border-slate-200/90 shadow-glass-light space-y-6 ${className || ''}`}>
      {/* Top Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-200 text-cyan-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Live SerpApi Discovery Engine</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-400">
                Phase 3 Live Feeds
              </span>
            </div>
            <p className="text-xs text-slate-500">Real-time Google search, news, consular advisories, transit & scam ingestion</p>
          </div>
        </div>

        {/* Backend Credential Status Badge */}
        <div>
          {isConfigured ? (
            <Badge variant="success" className="gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SerpApi Connected (Live)
            </Badge>
          ) : (
            <Badge variant="warning" className="gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Credentials Pending / Unverified
            </Badge>
          )}
        </div>
      </div>

      {/* Unverified Credential Notice (if API key is not yet set) */}
      {!isConfigured && (
        <div className="p-4 rounded-xl bg-amber-50/30 border border-amber-200 text-xs text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Live Integration Status: Unverified</span>
          </div>
          <p className="leading-relaxed opacity-90">
            Live integration has not yet been verified because a SerpApi key has not been supplied in <code className="text-amber-300 font-mono">backend/.env</code>. To activate real-time Google Search, Google News, and diplomatic alert ingestion, configure <code className="text-amber-300 font-mono">SERPAPI_API_KEY</code> on the backend.
          </p>
          <div className="text-[11px] text-amber-400/90 font-mono">
            Integrity Guard: Simulated or fabricated search results are never generated when credentials are absent.
          </div>
        </div>
      )}

      {/* Stream Selection Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/80 border border-slate-200/90 shadow-glass-light overflow-x-auto text-xs">
        {streams.map((s) => {
          const Icon = s.icon;
          const isActive = activeStream === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                setActiveStream(s.id);
                setResults(null);
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500 text-navy-950 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-white hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Trigger Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/70 border border-slate-200">
        <div className="text-xs text-slate-600">
          <span>Target Target: </span>
          <strong className="text-slate-900 font-mono">{destinationName || 'None selected'}</strong>
        </div>

        <Button
          size="sm"
          onClick={handleFetchStream}
          isLoading={isLoading}
          icon={RefreshCw}
          className="shadow-xs w-full sm:w-auto"
        >
          Query Live SerpApi Feed
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert
          type="danger"
          title="SerpApi Query Exception"
          message={error}
        />
      )}

      {/* Results View */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">
              Found {results.totalResults || results.count || 0} deduplicated intelligence records
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              Retrieved: {new Date(results.retrievedAt || Date.now()).toLocaleTimeString()}
            </span>
          </div>

          {/* List of items */}
          <div className="space-y-3">
            {(results.feed || results.results || []).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white/80 border border-slate-200 hover:border-cyan-200 transition-all space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                      {item.category} • {item.sourceName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 hover:text-cyan-800 transition-colors">
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </h4>
                  </div>

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-white flex-shrink-0"
                    title="Open verified source URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {item.snippet && (
                  <p className="text-slate-600 leading-relaxed">{item.snippet}</p>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>
                    {item.publishedDate ? `Published: ${item.publishedDate}` : 'Publication date unlisted'}
                  </span>
                  <span className="truncate max-w-[220px] text-slate-500">
                    {item.sourceUrl}
                  </span>
                </div>
              </div>
            ))}

            {(results.feed || results.results || []).length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-white/85/40 border border-slate-200">
                No matching intelligence telemetry returned for this query parameter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSerpApiExplorer;
