import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Calendar, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const AiInsightsCard = ({ insights }) => {
  if (!insights) return null;

  const { summary, categorySpikes = [], budgetAlerts = [], recommendations = [] } = insights;

  return (
    <div className="space-y-4">
      {/* AI Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-purple-600 text-white p-6 shadow-xl">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-extrabold tracking-wider uppercase w-fit border border-white/20 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>PayFlow AI Financial Intelligence</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
          Smart Spending & Predictive Insights
        </h3>
        <p className="text-xs text-indigo-100 mt-1 max-w-xl">
          Continuous algorithmic evaluation of your cash flow, category spikes, and weekend habits.
        </p>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/15">
          <div>
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Current Cycle Spend</span>
            <span className="text-base sm:text-lg font-black">{formatCurrency(summary?.currentMonthSpend || 0)}</span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Spend Velocity</span>
            <div className="flex items-center space-x-1 mt-0.5">
              {summary?.spendDeltaPercentage > 0 ? (
                <span className="text-amber-300 font-extrabold text-sm flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{summary.spendDeltaPercentage}%
                </span>
              ) : (
                <span className="text-emerald-300 font-extrabold text-sm flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {summary?.spendDeltaPercentage || 0}%
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Weekend Outflow</span>
            <span className="text-base sm:text-lg font-black">{summary?.weekendPercentage || 0}%</span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">Potential Savings</span>
            <span className="text-base sm:text-lg font-black text-emerald-300">
              {formatCurrency(summary?.potentialWeekendSavings || 0)}/mo
            </span>
          </div>
        </div>
      </div>

      {/* Actionable AI Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Spike Warnings */}
        {categorySpikes.length > 0 && (
          <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Category Spending Spike
              </h4>
            </div>
            {categorySpikes.map((spike, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 mb-2">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {spike.category}: +{spike.increasePercentage}% vs Last Month
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                  {spike.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* AI Recommendations List */}
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`p-1.5 rounded-lg ${
                  rec.type === 'warning'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    : rec.type === 'success'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                    : 'bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                }`}>
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {rec.title}
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                {rec.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
