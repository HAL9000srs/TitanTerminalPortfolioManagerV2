import React, { useState } from 'react';
import { Asset, AIAnalysisResult } from '../types';
import { analyzePortfolioWithGemini, researchMarketWithGemini, generateSpeechWithGemini } from '../services/geminiService';
import { playAudioContent } from '../services/audioService';
import { Sparkles, AlertTriangle, CheckCircle, ShieldCheck, RefreshCw, Volume2, Globe, ArrowRight } from 'lucide-react';

interface AIAnalystProps {
  assets: Asset[];
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ assets }) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'market'>('portfolio');
  
  // Portfolio Analysis State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Market Research State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{text: string, groundingChunks: any[]} | null>(null);

  const handleAnalyze = async () => {
    if (assets.length === 0) {
      setError("Portfolio is empty. Add positions to generate analysis.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzePortfolioWithGemini(assets);
      setResult(data);
    } catch (e) {
      setError("Analysis unavailable. Please check API Key configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySummary = async () => {
    if (!result || audioPlaying) return;
    setAudioPlaying(true);
    try {
      const audioData = await generateSpeechWithGemini(result.summary);
      const source = await playAudioContent(audioData);
      source.onended = () => setAudioPlaying(false);
    } catch (e) {
      console.error("Audio playback failed", e);
      setAudioPlaying(false);
    }
  };

  const handleMarketSearch = async () => {
    if (!searchQuery) return;
    setSearchLoading(true);
    try {
      const data = await researchMarketWithGemini(searchQuery);
      setSearchResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-1 flex items-center gap-2">
            Titan <span className="font-bold text-terminal-accent">Intelligence</span>
            <span className="px-2 py-0.5 rounded-full bg-terminal-accent/10 text-terminal-accent text-[10px] font-bold border border-terminal-accent/20">BETA</span>
          </h1>
          <p className="text-terminal-muted text-sm font-mono">Generative AI Portfolio Risk & Market Research Engine</p>
        </div>
        
        <div className="flex bg-terminal-panel rounded p-1 border border-terminal-border">
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'portfolio' ? 'bg-terminal-bg text-white shadow-sm' : 'text-terminal-muted hover:text-white'}`}
          >
            Portfolio
          </button>
          <button 
             onClick={() => setActiveTab('market')}
             className={`px-4 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'market' ? 'bg-terminal-bg text-white shadow-sm' : 'text-terminal-muted hover:text-white'}`}
          >
            Market Research
          </button>
        </div>
      </div>

      {activeTab === 'portfolio' && (
        <>
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center py-20 bg-terminal-panel/30 border border-dashed border-terminal-border rounded-lg">
                <Sparkles size={48} className="text-terminal-muted mb-4 opacity-50" />
                <h3 className="text-xl text-white font-light mb-2">Deep Portfolio Analysis</h3>
                <p className="text-terminal-muted mb-6 text-center max-w-lg">
                  Generate a comprehensive risk assessment, diversification check, and actionable optimization strategy using Gemini 3.
                </p>
                {error && (
                  <div className="mb-4 text-rose-500 bg-rose-500/10 px-4 py-2 rounded border border-rose-500/20 text-sm flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {error}
                  </div>
                )}
                <button 
                  onClick={handleAnalyze}
                  className="bg-terminal-accent text-black px-6 py-3 rounded font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(0,220,130,0.3)]"
                >
                  <Sparkles size={18} /> Initialize Analysis
                </button>
             </div>
          )}

          {loading && (
            <div className="h-64 flex flex-col items-center justify-center bg-terminal-panel border border-terminal-border rounded-lg">
              <RefreshCw size={48} className="text-terminal-accent animate-spin mb-4" />
              <p className="text-terminal-text font-mono animate-pulse">PROCESSING MARKET DATA...</p>
              <p className="text-terminal-muted text-xs mt-2">Connecting to Gemini Inference Model</p>
            </div>
          )}

          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Main Summary Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-terminal-panel border border-terminal-border rounded-lg p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-terminal-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                   <div className="flex justify-between items-start mb-4">
                     <h2 className="text-xl font-bold text-white flex items-center gap-2">
                       <ShieldCheck className="text-terminal-accent" /> Executive Summary
                     </h2>
                     <button 
                       onClick={handlePlaySummary}
                       disabled={audioPlaying}
                       className="text-terminal-accent hover:text-emerald-300 p-2 rounded hover:bg-terminal-accent/10 transition-colors"
                       title="Listen to Report"
                     >
                        <Volume2 size={20} className={audioPlaying ? 'animate-pulse' : ''} />
                     </button>
                   </div>
                   <p className="text-terminal-text leading-relaxed text-lg">
                     {result.summary}
                   </p>
                </div>

                 <div className="bg-terminal-panel border border-terminal-border rounded-lg p-6">
                   <h2 className="text-xl font-bold text-white mb-4">Strategic Recommendations</h2>
                   <div className="space-y-4">
                     {result.recommendations.map((rec, idx) => (
                       <div key={idx} className="flex gap-4 p-4 bg-terminal-bg rounded border border-terminal-border/50 hover:border-terminal-accent/30 transition-colors">
                         <div className="shrink-0 w-8 h-8 rounded-full bg-terminal-accent/10 flex items-center justify-center text-terminal-accent font-bold font-mono border border-terminal-accent/20">
                           {idx + 1}
                         </div>
                         <p className="text-sm text-terminal-text">{rec}</p>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                 <div className="bg-terminal-panel border border-terminal-border rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <h3 className="text-terminal-muted font-mono text-sm uppercase tracking-widest mb-4">Risk Score</h3>
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="#27272a" strokeWidth="8" fill="none" />
                        <circle 
                          cx="64" cy="64" r="56" 
                          stroke={result.riskScore > 70 ? '#f43f5e' : result.riskScore > 40 ? '#f59e0b' : '#10b981'} 
                          strokeWidth="8" 
                          fill="none" 
                          strokeDasharray={351} 
                          strokeDashoffset={351 - (351 * result.riskScore) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold text-white">{result.riskScore}</span>
                        <span className="text-[10px] text-terminal-muted uppercase">Low-High</span>
                      </div>
                    </div>
                    <p className="text-xs text-terminal-muted">
                      Based on volatility analysis of asset classes and historical sector correlation.
                    </p>
                 </div>

                 <div className="bg-terminal-panel border border-terminal-border rounded-lg p-6">
                    <h3 className="text-terminal-muted font-mono text-sm uppercase tracking-widest mb-4">Diversification</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle size={20} className="text-terminal-accent" />
                      <span className="text-xl font-bold text-white">{result.diversificationStatus}</span>
                    </div>
                    <div className="w-full bg-terminal-bg h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-terminal-accent to-blue-500" 
                        style={{ width: result.diversificationStatus === 'Excellent' ? '90%' : result.diversificationStatus === 'Moderate' ? '60%' : '30%' }}
                      ></div>
                    </div>
                 </div>

                 <button onClick={handleAnalyze} className="w-full py-3 border border-terminal-border text-terminal-muted hover:text-white hover:bg-terminal-border/50 rounded transition-colors text-sm">
                   Re-run Analysis
                 </button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'market' && (
        <div className="animate-fade-in space-y-6">
           <div className="bg-terminal-panel border border-terminal-border rounded-lg p-6">
             <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               <Globe className="text-terminal-accent" /> Global Market Grounding
             </h2>
             <p className="text-terminal-muted mb-4">
               Access real-time information using Google Search grounding. Ask about recent market events, stock news, or economic indicators.
             </p>
             <div className="flex gap-2">
               <input 
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)} 
                 placeholder="e.g., 'Latest news on NVIDIA stock' or 'US inflation rate trend'"
                 className="flex-1 bg-terminal-bg border border-terminal-border rounded px-4 py-3 text-white focus:outline-none focus:border-terminal-accent"
                 onKeyDown={(e) => e.key === 'Enter' && handleMarketSearch()}
               />
               <button 
                 onClick={handleMarketSearch}
                 disabled={searchLoading || !searchQuery}
                 className="bg-terminal-accent text-black px-6 rounded font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {searchLoading ? <RefreshCw className="animate-spin" /> : <ArrowRight />}
               </button>
             </div>
           </div>

           {searchResult && (
             <div className="bg-terminal-panel border border-terminal-border rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Research Findings</h3>
                <div className="prose prose-invert prose-sm max-w-none text-terminal-text">
                   <p className="whitespace-pre-wrap">{searchResult.text}</p>
                </div>
                
                {searchResult.groundingChunks && searchResult.groundingChunks.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-terminal-border">
                    <h4 className="text-xs font-mono text-terminal-muted uppercase mb-2">Sources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {searchResult.groundingChunks.map((chunk, idx) => (
                         chunk.web?.uri ? (
                            <a 
                              key={idx} 
                              href={chunk.web.uri} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-2 text-xs text-terminal-accent hover:underline truncate p-2 bg-terminal-bg/50 rounded"
                            >
                              <Globe size={12} />
                              {chunk.web.title || chunk.web.uri}
                            </a>
                         ) : null
                      ))}
                    </div>
                  </div>
                )}
             </div>
           )}
        </div>
      )}
    </div>
  );
};