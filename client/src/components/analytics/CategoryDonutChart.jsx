import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

export const CategoryDonutChart = ({ categories = [] }) => {
  const { isDark } = useTheme();

  const labels = categories.map((c) => c.category);
  const dataValues = categories.map((c) => c.amount);

  const colors = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f43f5e', // Rose
    '#06b6d4', // Cyan
    '#64748b'  // Slate
  ];

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors.slice(0, categories.length),
        borderColor: isDark ? '#111827' : '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const totalSpent = dataValues.reduce((a, b) => a + b, 0);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#94a3b8' : '#475569',
          font: { size: 10, weight: 'bold' },
          usePointStyle: true,
          boxWidth: 6,
          padding: 12
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ₹${context.raw.toLocaleString('en-IN')}`
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Category Distribution</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500">Current cycle expense breakdown</p>
      </div>

      <div className="relative h-64 sm:h-72 w-full my-auto flex items-center justify-center">
        {categories.length === 0 ? (
          <div className="text-xs text-slate-400">No category transactions this month.</div>
        ) : (
          <>
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Spent</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
