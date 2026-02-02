
import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Download, 
  Zap, 
  ExternalLink, 
  Activity, 
  Terminal, 
  Layers, 
  ShieldAlert,
  ChevronRight,
  Info,
  Loader2,
  Settings,
  ToggleLeft,
  CircleCheck
} from 'lucide-react';
import { LicenseTier, DeepDiveResult, AnalysisInput } from './types';
import { performDeepDive } from './services/geminiService';

const LOADING_MESSAGES = [
  "Interrogating Privacy Policies...",
  "Tracing Data Flow Packets...",
  "Cross-referencing License Tiers...",
  "Hunting for Zero-Day Privacy Risks...",
  "Simulating Data Exfiltration Scenarios...",
  "Scouring Sub-processor Agreements..."
];

const App: React.FC = () => {
  const [input, setInput] = useState<AnalysisInput>({
    toolName: '',
    website: '',
    licenseTier: LicenseTier.FREE,
    scenario: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [result, setResult] = useState<DeepDiveResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const msgInterval = setInterval(() => {
      setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 3000);

    try {
      const data = await performDeepDive(input);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during the deep dive.');
    } finally {
      clearInterval(msgInterval);
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!resultRef.current) return;
    const element = resultRef.current;
    const opt = {
      margin: 0.5,
      filename: `GuardAI_DeepDive_${input.toolName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#0f172a' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    (window as any).html2pdf().set(opt).from(element).save();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-500 border-red-500/50 bg-red-500/10';
      case 'high': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
      default: return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">GuardAI <span className="text-blue-400">Deep Dive</span></h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Advanced Scenario Analysis v3.1</p>
            </div>
          </div>
          {result && (
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result && !isLoading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl font-extrabold text-white sm:text-5xl">Precise Risk Auditing.</h2>
              <p className="text-lg text-slate-400">
                General audits aren't enough. Analyze specific workflows and license tiers to uncover exactly where your data goes.
              </p>
            </section>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Tool Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Notion, Zoom, Cursor"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      value={input.toolName}
                      onChange={e => setInput({...input, toolName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Website URL</label>
                    <input 
                      required
                      type="url"
                      placeholder="https://..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      value={input.website}
                      onChange={e => setInput({...input, website: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">License Tier</label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.values(LicenseTier).map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setInput({...input, licenseTier: tier})}
                        className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                          input.licenseTier === tier 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Specific Scenario</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe exactly what you are doing (e.g., 'I am uploading our quarterly financial spreadsheets to the AI model for trend analysis and chart generation...')"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                    value={input.scenario}
                    onChange={e => setInput({...input, scenario: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Details matter: Mention if you are recording meetings, uploading code, or using personal PII.</p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 group"
                >
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Initiate Deep Dive Analysis
                </button>
              </form>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <ShieldAlert className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1">Deep Dive in Progress</h3>
              <p className="text-slate-400 mono text-sm">{loadingMsg}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-white">Analysis Terminated</h3>
            <p className="text-red-200">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {result && (
          <div ref={resultRef} className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
            {/* Verdict Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600/20 to-transparent p-8 border-b border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs">
                      <Zap className="w-4 h-4 fill-current" />
                      Executive Verdict
                    </div>
                    <h2 className="text-3xl font-black text-white">{result.toolName} Audit Result</h2>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-slate-300">Tier: {result.licenseTier}</span>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700 min-w-[140px]">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Security Score</div>
                    <div className={`text-5xl font-black ${getScoreColor(result.verdict.securityScore)}`}>
                      {result.verdict.securityScore}<span className="text-lg opacity-50">/100</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Info className="w-5 h-5 text-blue-400" />
                    Summary
                  </h3>
                  <p className="text-slate-300 leading-relaxed italic">"{result.verdict.summary}"</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Primary Recommendation
                  </h3>
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-100 font-medium">
                    {result.verdict.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Truth Bomb Warning */}
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-0.5 shadow-lg shadow-orange-900/20">
              <div className="bg-slate-950 rounded-[14px] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Terminal className="w-32 h-32 -rotate-12" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-tighter">
                    <AlertTriangle className="w-5 h-5" />
                    Truth Bomb: Scenario Reality Check
                  </div>
                  <p className="text-lg md:text-xl font-bold text-white leading-snug">
                    {result.truthBomb}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Flow Analysis */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white px-2">
                <Activity className="w-6 h-6 text-blue-400" />
                Scenario Data Flow Analysis
              </h3>
              <div className="relative space-y-4 before:absolute before:left-8 before:top-4 before:bottom-4 before:w-px before:bg-slate-800">
                {result.dataFlowAnalysis.map((step, idx) => (
                  <div key={idx} className="relative pl-16 group">
                    <div className="absolute left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 z-10 group-hover:scale-125 transition-transform" />
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                      <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                        {step.step}
                        <span className="text-[10px] text-slate-500 px-2 py-0.5 border border-slate-800 rounded bg-slate-950">STEP {idx + 1}</span>
                      </h4>
                      <p className="text-sm text-slate-400 mb-3">{step.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {step.dataTypes.map((type, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specific Risks */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white px-2">
                <Layers className="w-6 h-6 text-blue-400" />
                Critical Risks Identified
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.specificRisks.map((risk, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-widest border-l border-b rounded-bl-lg ${getSeverityColor(risk.severity)}`}>
                      {risk.severity}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{risk.category}</span>
                      <h4 className="text-white font-bold text-lg mt-1">{risk.risk}</h4>
                    </div>
                    <p className="text-sm text-slate-400">{risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Safety Settings (NEW SECTION) */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white px-2">
                <Settings className="w-6 h-6 text-blue-400" />
                Data Safety & Privacy Controls
              </h3>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 space-y-6">
                  {!result.safetySettings.available ? (
                    <div className="flex items-center gap-4 text-slate-500 py-4 italic">
                      <ToggleLeft className="w-8 h-8 opacity-20" />
                      None: This scenario or license tier lacks user-configurable privacy toggles.
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {result.safetySettings.configurations.map((config, cIdx) => (
                        <div key={cIdx} className="space-y-3 bg-slate-950/50 border border-slate-800/50 rounded-xl p-5">
                          <h4 className="flex items-center gap-2 font-bold text-blue-400">
                            <CircleCheck className="w-4 h-4" />
                            {config.title}
                          </h4>
                          <ol className="space-y-2">
                            {config.steps.map((step, sIdx) => (
                              <li key={sIdx} className="text-sm text-slate-300 flex gap-3">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold border border-blue-500/20">
                                  {sIdx + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sources */}
            {result.sources.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                  <ExternalLink className="w-3 h-3" />
                  Audit Sources & Evidence
                </h3>
                <div className="flex flex-wrap gap-3 px-2">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-400 hover:text-blue-400 px-3 py-2 rounded-lg flex items-center gap-2 transition-all"
                    >
                      <span className="truncate max-w-[200px]">{source.title}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-10 flex justify-center">
              <button 
                onClick={() => {
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
              >
                Start New Analysis
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-xs font-mono">
            &copy; {new Date().getFullYear()} GuardAI Deep Dive Security Platform. For internal corporate use only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
