import React from 'react';
import { Asset, PortfolioSummary, CurrencyCode } from '../types';
import { convertValue, formatValue, SUPPORTED_CURRENCIES } from '../services/currencyService';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Globe, ChevronDown } from 'lucide-react';

interface DashboardProps {
  summary: PortfolioSummary;
  assets: Asset[];
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
}

export const Dashboard: React.FC<DashboardProps> = React.memo(({ summary, assets, currency, onCurrencyChange }) => {
  const COLORS = ['#00dc82', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

  const getConvertedSummary = () => {
    return {
      totalValue: convertValue(summary.totalValue, currency),
      totalGainLoss: convertValue(summary.totalGainLoss, currency),
    };
  };

  const convertedStats = getConvertedSummary();

  // Mock historical data for the chart, converted dynamically
  const mockHistoryData = [
    { name: 'Jan', value: convertValue(summary.totalValue * 0.85, currency) },
    { name: 'Feb', value: convertValue(summary.totalValue * 0.88, currency) },
    { name: 'Mar', value: convertValue(summary.totalValue * 0.86, currency) },
    { name: 'Apr', value: convertValue(summary.totalValue * 0.92, currency) },
    { name: 'May', value: convertValue(summary.totalValue * 0.95, currency) },
    { name: 'Jun', value: convertValue(summary.totalValue, currency) },
  ];

  // Convert allocation data
  const allocationData = summary.allocation.map(item => ({
    ...item,
    value: convertValue(item.value, currency)
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-1">
            Portfolio <span className="font-bold text-terminal-accent">Overview</span>
          </h1>
          <p className="text-terminal-muted text-sm font-mono">LAST UPDATE: {new Date().toLocaleTimeString()} UTC</p>
        </div>
        <div className="flex gap-4 items-center">
           <div className="relative group">
              <select 
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="appearance-none bg-terminal-panel border border-terminal-border text-white px-4 py-1.5 pr-8 rounded font-mono text-sm focus:outline-none focus:border-terminal-accent cursor-pointer hover:border-terminal-muted"
              >
                {Object.keys(SUPPORTED_CURRENCIES).map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-muted pointer-events-none" />
           </div>

           <span className="px-3 py-1 rounded bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/20 text-xs font-mono flex items-center gap-2" style={{ textShadow: '0 0 10px rgba(0, 220, 130, 0.6)' }}>
             <div className="w-2 h-2 rounded-full bg-terminal-accent animate-pulse"></div>
             SYSTEM ONLINE
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-terminal-panel border border-terminal-border p-5 rounded-lg relative overflow-hidden group hover:border-terminal-accent/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={48} />
          </div>
          <p className="text-terminal-muted text-xs font-mono uppercase tracking-widest mb-1">Net Worth</p>
          <div 
            className="font-mono font-medium text-white leading-none mb-1"
            style={{ 
              fontSize: 'clamp(1rem, 6vw, 1.875rem)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {formatValue(convertedStats.totalValue, currency)}
          </div>
          <div className="mt-2 text-xs text-terminal-muted flex items-center gap-1">
            <span className="text-emerald-500 font-mono">+2.4%</span>
            <span>vs last month</span>
          </div>
        </div>

        <div className="bg-terminal-panel border border-terminal-border p-5 rounded-lg relative overflow-hidden group hover:border-terminal-accent/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={48} />
          </div>
          <p className="text-terminal-muted text-xs font-mono uppercase tracking-widest mb-1">Total PnL</p>
          <div 
            className={`font-mono font-medium leading-none mb-1 ${convertedStats.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
            style={{ 
              fontSize: 'clamp(1rem, 6vw, 1.875rem)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {convertedStats.totalGainLoss >= 0 ? '+' : ''}{formatValue(convertedStats.totalGainLoss, currency)}
          </div>
          <div className="mt-2 text-xs text-terminal-muted flex items-center gap-1">
             <span className={`font-mono ${convertedStats.totalGainLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
               {summary.totalGainLossPercent.toFixed(2)}%
             </span>
            <span>all time</span>
          </div>
        </div>

        <div className="bg-terminal-panel border border-terminal-border p-5 rounded-lg relative overflow-hidden group hover:border-terminal-accent/50 transition-colors">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe size={48} />
          </div>
          <p className="text-terminal-muted text-xs font-mono uppercase tracking-widest mb-1">Top Performer</p>
          <div className="text-2xl md:text-3xl font-mono font-medium text-white">NVDA</div>
          <div className="mt-2 text-xs text-terminal-muted flex items-center gap-1">
            <span className="text-emerald-500 font-mono">+12.4%</span>
            <span>24h change</span>
          </div>
        </div>

        <div className="bg-terminal-panel border border-terminal-border p-5 rounded-lg relative overflow-hidden group hover:border-terminal-accent/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={48} />
          </div>
          <p className="text-terminal-muted text-xs font-mono uppercase tracking-widest mb-1">Risk Score</p>
          <div className="text-2xl md:text-3xl font-mono font-medium text-amber-400">42/100</div>
          <div className="mt-2 text-xs text-terminal-muted flex items-center gap-1">
            <span className="text-terminal-text">Moderate</span>
            <span>- AI Assessment</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Growth Line Chart */}
        <div className="lg:col-span-2 bg-terminal-panel border border-terminal-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Activity size={18} className="text-terminal-accent" />
              Portfolio Growth
            </h3>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '1Y', 'ALL'].map(t => (
                <button key={t} className={`px-3 py-1 text-xs rounded border transition-colors ${t === '1M' ? 'bg-terminal-accent text-black border-terminal-accent' : 'bg-transparent text-terminal-muted border-terminal-border hover:border-terminal-muted'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" tick={{fill: '#71717a', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tick={{fill: '#71717a', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `${SUPPORTED_CURRENCIES[currency].symbol}${val < 1000 ? val : (val/1000).toFixed(0) + 'k'}`} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'transparent', 
                    border: 'none',
                    padding: '0' 
                  }}
                  itemStyle={{ 
                    color: '#00dc82', 
                    textShadow: '0 0 5px rgba(0, 220, 130, 0.5)' 
                  }}
                  labelStyle={{ color: '#fff', marginBottom: '4px' }}
                  wrapperStyle={{ outline: 'none', zIndex: 50 }}
                  formatter={(value: number) => formatValue(value, currency)}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00dc82" 
                  strokeWidth={2} 
                  dot={{ fill: '#121214', stroke: '#00dc82', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, fill: '#00dc82' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Bar Chart */}
        <div className="bg-terminal-panel border border-terminal-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-6">Asset Allocation</h3>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={allocationData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#52525b"
                  tick={{fill: '#71717a', fontSize: 12}}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val < 1000 ? val.toFixed(1) : (val/1000).toFixed(1) + 'k'}`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  stroke="#52525b"
                  tick={{fill: '#71717a', fontSize: 12}}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <RechartsTooltip 
                   contentStyle={{ 
                     backgroundColor: 'transparent', 
                     border: 'none',
                     padding: '0' 
                   }}
                   itemStyle={{ 
                     color: '#00dc82', 
                     textShadow: '0 0 5px rgba(0, 220, 130, 0.5)' 
                   }}
                   labelStyle={{ color: '#fff', marginBottom: '4px' }}
                   wrapperStyle={{ outline: 'none', zIndex: 50 }}
                   formatter={(val: number) => formatValue(val, currency)}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance optimization
  return prevProps.currency === nextProps.currency &&
         JSON.stringify(prevProps.summary) === JSON.stringify(nextProps.summary) &&
         prevProps.assets.length === nextProps.assets.length;
});