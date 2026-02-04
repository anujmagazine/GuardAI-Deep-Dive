
import React, { useState, useRef, useEffect } from 'react';
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
  CircleCheck,
  ClipboardList,
  BookOpen
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
    website: 'https://',
    licenseTier: LicenseTier.FREE,
    scenario: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [result, setResult] = useState<DeepDiveResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const websiteInputRef = useRef<HTMLInputElement>(null);

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

  const handleWebsiteFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTimeout(() => {
      e.target.setSelectionRange(val.length, val.length);
    }, 0);
  };

  const downloadPDF = () => {
    if (!resultRef.current) return;
    const element = resultRef.current;
    
    // Use a higher scale and better settings for PDF clarity
    const opt = {
      margin: 0.4,
      filename: `GuardAI_Report_${input.toolName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2.5, 
        backgroundColor: '#0f172a',
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Ensure the element is visible and rendered properly before capture
    (window as any).html2pdf().set(opt).from(element).save();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-400 border-red-500/50 bg-red-950/50';
      case 'high': return 'text-orange-400 border-orange-500/50 bg-orange-950/50';
      case 'medium': return 'text-yellow-400 border-yellow-500/50 bg-yellow-950/50';
      default: return 'text-blue-400 border-blue-500/50 bg-blue-950/50';
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all text-sm font-bold shadow-lg shadow-blue-900/20"
            >
              <Download className="w-4 h-4" />
              Download Audit Report
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
                Analyze specific workflows and license tiers to uncover exactly where your data goes, backed by real-time evidence.
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
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white"
                      value={input.toolName}
                      onChange={e => setInput({...input, toolName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Website URL</label>
                    <input 
                      required
                      ref={websiteInputRef}
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white"
                      value={input.website}
                      onFocus={handleWebsiteFocus}
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
                    placeholder="Describe exactly what you are doing (e.g. Recording customer success calls and uploading to X tool...)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none text-white"
                    value={input.scenario}
                    onChange={e => setInput({...input, scenario: e.target.value})}
                  />
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
            <button onClick={() => setError(null)} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold">Retry</button>
          </div>
        )}

        {result && (
          <div ref={resultRef} className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20 p-2">
            {/* Context & Scenario Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Audit Scope & Scenario Summary
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" />
                  Source Grounded
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-lg text-white font-semibold leading-relaxed">
                  {result.scenarioSummary}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Software Tool</span>
                    <span className="text-sm font-mono text-blue-400 font-bold">{result.toolName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">License Tier</span>
                    <span className="text-sm font-mono text-blue-400 font-bold">{result.licenseTier}</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-[200px]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">User Query</span>
                    <span className="text-xs text-slate-300 line-clamp-2 italic">"{result.scenario}"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence & Sources Section */}
            {result.sources.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                  <BookOpen className="w-3.5 h-3.5" />
                  Audit Evidence Base
                </div>
                <div className="flex flex-wrap gap-3">
                  {result.sources.map((source, idx) => (
                    <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] bg-slate-950 border border-slate-800 hover:border-blue-500 text-slate-200 hover:text-blue-400 px-3 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm">
                      <span className="truncate max-w-[220px] font-medium">{source.title}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic">Findings are based on current official documentation and privacy policies listed above.</p>
              </div>
            )}

            {/* Verdict Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600/30 to-slate-900 p-8 border-b border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-widest text-xs">
                      <Zap className="w-4 h-4 fill-current" />
                      Executive Verdict
                    </div>
                    <h2 className="text-3xl font-black text-white">{result.toolName} Risk Assessment</h2>
                  </div>
                  <div className="text-center p-4 bg-slate-950 rounded-2xl border border-slate-700 min-w-[140px] shadow-inner">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Security Score</div>
                    <div className={`text-5xl font-black ${getScoreColor(result.verdict.securityScore)}`}>
                      {result.verdict.securityScore}<span className="text-lg opacity-50">/100</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 grid md:grid-cols-2 gap-8 bg-slate-900">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white"><Info className="w-5 h-5 text-blue-400" />Risk Summary</h3>
                  <p className="text-slate-200 leading-relaxed font-medium">"{result.verdict.summary}"</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white"><ShieldCheck className="w-5 h-5 text-emerald-400" />Actionable Recommendation</h3>
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-50 font-bold leading-snug">
                    {result.verdict.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Truth Bomb Warning */}
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-0.5 shadow-xl">
              <div className="bg-slate-950 rounded-[14px] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Terminal className="w-32 h-32 -rotate-12" /></div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 text-orange-400 font-black uppercase tracking-tighter">
                    <AlertTriangle className="w-5 h-5" />
                    Truth Bomb: Scenario Reality
                  </div>
                  <p className="text-xl md:text-2xl font-black text-white leading-tight">{result.truthBomb}</p>
                </div>
              </div>
            </div>

            {/* Data Flow Analysis */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white px-2"><Activity className="w-6 h-6 text-blue-400" />Scenario Data Flow Analysis</h3>
              <div className="relative space-y-6 before:absolute before:left-8 before:top-4 before:bottom-4 before:w-px before:bg-slate-800">
                {result.dataFlowAnalysis.map((step, idx) => (
                  <div key={idx} className="relative pl-16 group">
                    <div className="absolute left-6 top-2 w-4 h-4 rounded-full bg-slate-950 border-4 border-blue-500 z-10" />
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                      <h4 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                        {step.step} 
                        <span className="text-[10px] text-white px-2 py-0.5 border border-slate-700 rounded bg-slate-800 font-black">STEP {idx + 1}</span>
                      </h4>
                      <p className="text-sm text-slate-200 leading-relaxed font-medium mb-4">{step.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {step.dataTypes.map((type, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-md uppercase tracking-wider">{type}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Risks */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white px-2"><Layers className="w-6 h-6 text-blue-400" />Critical Risks Identified</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.specificRisks.map((risk, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3 relative overflow-hidden shadow-sm">
                    <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-widest border-l border-b rounded-bl-lg shadow-sm ${getSeverityColor(risk.severity)}`}>
                      {risk.severity}
                    </div>
                    <div>
                      <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{risk.category}</span>
                      <h4 className="text-white font-bold text-lg mt-1">{risk.risk}</h4>
                    </div>
                    <p className="text-sm text-slate-200 font-medium leading-relaxed">{risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Safety Settings */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white px-2"><Settings className="w-6 h-6 text-blue-400" />Data Safety & Privacy Controls</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 space-y-6 bg-slate-900">
                  {!result.safetySettings.available ? (
                    <div className="flex items-center gap-4 text-slate-400 py-6 italic font-medium px-4 bg-slate-950/50 rounded-xl">
                      <ToggleLeft className="w-8 h-8 opacity-40 text-slate-500" />
                      Note: This scenario or license tier lacks verified user-configurable privacy toggles.
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {result.safetySettings.configurations.map((config, cIdx) => (
                        <div key={cIdx} className="space-y-4 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm">
                          <h4 className="flex items-center gap-3 font-black text-blue-400 text-lg">
                            <CircleCheck className="w-5 h-5 text-emerald-400" />
                            {config.title}
                          </h4>
                          <ol className="space-y-3">
                            {config.steps.map((step, sIdx) => (
                              <li key={sIdx} className="text-sm text-slate-100 font-medium flex gap-4 items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shadow-md">
                                  {sIdx + 1}
                                </span>
                                <span className="pt-0.5">{step}</span>
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

            <div className="pt-10 flex justify-center no-print">
              <button 
                onClick={() => {
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] group"
              >
                Start New Analysis
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Automated Privacy Audit Platform</p>
          <p className="text-slate-700 text-xs font-mono">&copy; {new Date().getFullYear()} GuardAI Deep Dive. Confidential Intelligence Report.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
