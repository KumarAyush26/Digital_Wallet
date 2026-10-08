import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { IncomeExpenseChart } from '../components/analytics/IncomeExpenseChart';
import { CategoryDonutChart } from '../components/analytics/CategoryDonutChart';
import { AiInsightsCard } from '../components/analytics/AiInsightsCard';
import { formatCurrency } from '../utils/formatters';
import { Sparkles, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [ovRes, trRes, catRes, aiRes] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getMonthlyTrends(),
          analyticsService.getCategoryBreakdown(),
          analyticsService.getAiInsights()
        ]);

        if (ovRes.success) setOverview(ovRes.stats);
        if (trRes.success) setTrends(trRes.trends);
        if (catRes.success) setCategories(catRes.categories);
        if (aiRes.success) setAiInsights(aiRes.insights);
      } catch (e) {
        console.error('Error loading analytics:', e);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & AI Insights
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Deep-dive into income vs expense distributions, category trends, and predictive advice.
        </p>
      </div>

      {/* AI Insights & Anomaly Card */}
      <AiInsightsCard insights={aiInsights} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart trends={trends} />
        <CategoryDonutChart categories={categories} />
      </div>

      {/* Top Frequent Payees Table */}
      {overview?.frequentRecipients && overview.frequentRecipients.length > 0 && (
        <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Most Frequent Payment Recipients
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {overview.frequentRecipients.map((rec) => (
              <div
                key={rec._id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {rec.avatar ? (
                    <img src={rec.avatar} alt={rec.name} className="w-9 h-9 rounded-xl object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center">
                      {rec.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{rec.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{rec.upiId}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    {rec.count} transfers
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {formatCurrency(rec.totalSent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
