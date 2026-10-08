import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const IncomeExpenseChart = ({ trends = [] }) => {
  const { isDark } = useTheme();

  const labels = trends.map((t) => t.month);
  const incomeData = trends.map((t) => t.income);
  const expenseData = trends.map((t) => t.expense);

  const data = {
    labels,
    datasets: [
      {
        label: 'Money Received (+)',
        data: incomeData,
        backgroundColor: '#10b981',
        borderRadius: 8,
        barPercentage: 0.6
      },
      {
        label: 'Money Sent (-)',
        data: expenseData,
        backgroundColor: '#6366f1',
        borderRadius: 8,
        barPercentage: 0.6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#94a3b8' : '#475569',
          font: { size: 11, weight: 'bold' },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ₹${context.raw.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 10, weight: 'bold' }
        }
      },
      y: {
        grid: {
          color: isDark ? '#1e293b' : '#f1f5f9'
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 10 },
          callback: (value) => `₹${value >= 1000 ? `${value / 1000}k` : value}`
        }
      }
    }
  };

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cash Flow Comparison</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500">6-month income vs expenses</p>
        </div>
      </div>
      <div className="h-64 sm:h-72 w-full">
        {trends.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No cash flow history available yet.
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
};
