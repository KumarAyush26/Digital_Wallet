import React, { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { BudgetManager } from '../components/budget/BudgetManager';
import { SavingsGoalList } from '../components/budget/SavingsGoalList';
import { Target, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, goalsRes] = await Promise.all([
        budgetService.getBudgets(),
        budgetService.getSavingsGoals()
      ]);

      if (budgetsRes.success) setBudgets(budgetsRes.budgets);
      if (goalsRes.success) setGoals(goalsRes.goals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetBudget = async (category, limitAmount) => {
    await budgetService.setBudget({ category, limitAmount });
    loadData();
  };

  const handleCreateGoal = async (goalData) => {
    await budgetService.createSavingsGoal(goalData);
    loadData();
  };

  const handleContributeGoal = async (id, amount) => {
    await budgetService.contributeGoal(id, amount);
    loadData();
  };

  const handleWithdrawGoal = async (id, amount) => {
    await budgetService.withdrawGoal(id, amount);
    loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Budgets & Savings Vaults
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Establish category spending guardrails and fund your target financial goals.
        </p>
      </div>

      {/* Budget Manager Component */}
      <BudgetManager budgets={budgets} onSetBudget={handleSetBudget} />

      {/* Savings Goal Pots Component */}
      <SavingsGoalList
        goals={goals}
        onCreateGoal={handleCreateGoal}
        onContributeGoal={handleContributeGoal}
        onWithdrawGoal={handleWithdrawGoal}
      />
    </div>
  );
};
