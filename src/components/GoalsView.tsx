import React, { useState } from 'react';
import { Target, Plus, Calendar, AlertCircle, ArrowLeft, Image, Sparkles, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavingsGoal, DepositFrequency } from '../types';

import { CustomProgressBar } from './UIComponents';

interface GoalsViewProps {
  goals: SavingsGoal[];
  onCreateGoal: (goalData: Partial<SavingsGoal>) => void;
  onSelectGoalForDeposit: (goalId: string) => void;
  onSelectGoalForWithdraw: (goalId: string) => void;
  categories?: any[];
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onCreateGoal,
  onSelectGoalForDeposit,
  onSelectGoalForWithdraw,
  categories = []
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [view, setView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Create Goal Form State
  const [newGoal, setNewGoal] = useState({
    name: '',
    category: 'House Rent',
    targetAmount: '',
    frequency: DepositFrequency.MONTHLY,
    expectedDeposit: '',
    startDate: '2026-07-15',
    endDate: '2027-07-15',
    withdrawalDate: '2027-07-15',
    reminderEnabled: true,
    notes: '',
    imageUrl: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=400',
    apy: 8.5
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredGoals = goals.filter(g => {
    if (activeTab === 'active') return g.status === 'Active';
    if (activeTab === 'completed') return g.status === 'Completed' || g.status === 'Matured';
    return true;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setNewGoal(prev => ({ ...prev, [name]: val }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!newGoal.name.trim()) errors.name = 'Goal name is required';
    if (!newGoal.targetAmount || Number(newGoal.targetAmount) <= 0) {
      errors.targetAmount = 'Enter a valid target amount';
    }
    if (!newGoal.expectedDeposit || Number(newGoal.expectedDeposit) <= 0) {
      errors.expectedDeposit = 'Enter an expected deposit amount';
    }
    if (!newGoal.startDate) errors.startDate = 'Start date is required';
    if (!newGoal.endDate) errors.endDate = 'End date is required';
    if (new Date(newGoal.endDate) <= new Date(newGoal.startDate)) {
      errors.endDate = 'End date must be in the future of the start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onCreateGoal({
        name: newGoal.name,
        category: newGoal.category,
        targetAmount: Number(newGoal.targetAmount),
        frequency: newGoal.frequency,
        expectedDeposit: Number(newGoal.expectedDeposit),
        amountSaved: 0,
        startDate: newGoal.startDate,
        endDate: newGoal.endDate,
        withdrawalDate: newGoal.withdrawalDate,
        reminderEnabled: newGoal.reminderEnabled,
        imageUrl: newGoal.imageUrl,
        notes: newGoal.notes,
        status: 'Active',
        apy: Number(newGoal.apy) || 8.5,
        accruedInterest: 0
      });
      
      // Reset & go back
      setNewGoal({
        name: '',
        category: 'House Rent',
        targetAmount: '',
        frequency: DepositFrequency.MONTHLY,
        expectedDeposit: '',
        startDate: '2026-07-15',
        endDate: '2027-07-15',
        withdrawalDate: '2027-07-15',
        reminderEnabled: true,
        notes: '',
        imageUrl: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=400',
        apy: 8.5
      });
      setView('list');
    }
  };

  const getCategoryIcon = (catName: string) => {
    const matchedDyn = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return matchedDyn ? matchedDyn.icon : '⭐';
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      <AnimatePresence mode="wait">
        
        {/* GOALS LIST VIEW */}
        {view === 'list' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">My Savings Goals</h2>
                <p className="text-slate-500 text-xs mt-0.5">Track your savings plans, active streaks, and balances</p>
              </div>
              <button 
                onClick={() => setView('create')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-jolas-green-primary hover:bg-jolas-green-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/15"
                id="create-goal-tab-btn"
              >
                <Plus size={16} />
                <span>Create Goal</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-slate-100 mt-6 gap-2">
              {['active', 'completed', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-3 px-4 text-xs font-bold capitalize transition-all border-b-2 ${
                    activeTab === tab 
                      ? 'border-jolas-green-primary text-jolas-green-primary font-extrabold' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                  id={`tab-goals-${tab}`}
                >
                  {tab} ({
                    tab === 'active' 
                      ? goals.filter(g => g.status === 'Active').length 
                      : tab === 'completed' 
                        ? goals.filter(g => g.status === 'Completed' || g.status === 'Matured').length 
                        : goals.length
                  })
                </button>
              ))}
            </div>

            {/* Goal Cards Grid */}
            {filteredGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {filteredGoals.map(goal => {
                  const progress = (goal.amountSaved / goal.targetAmount) * 100;
                  const timeRemaining = new Date(goal.endDate).getTime() - new Date().getTime();
                  const daysLeft = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

                  return (
                    <div 
                      key={goal.id}
                      onClick={() => { setSelectedGoal(goal); setView('details'); }}
                      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs hover:shadow-md hover:border-slate-200/80 transition-all cursor-pointer relative overflow-hidden group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-jolas-green-primary/5 border border-jolas-green-primary/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                            {getCategoryIcon(goal.category)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm tracking-tight leading-snug">{goal.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-medium">{goal.category} • {goal.frequency}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-right text-xs font-bold text-slate-800">{formatMoney(goal.targetAmount)}</span>
                      </div>
 
                      <div className="space-y-1.5 mt-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500 font-medium">Progress</span>
                          <span className="text-jolas-green-primary font-mono font-bold">{Math.round(progress)}%</span>
                        </div>
                        <CustomProgressBar percentage={progress} />
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                          <span>{formatMoney(goal.amountSaved)} saved</span>
                          <span>{daysLeft > 0 ? `${daysLeft} days remaining` : 'Matured'}</span>
                        </div>
                      </div>
 
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500 font-medium">
                        <div className="flex gap-3">
                          <span>Expected: <strong className="text-slate-700">{formatMoney(goal.expectedDeposit)}</strong></span>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-xs mt-6">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target size={28} />
                </div>
                <h3 className="font-bold text-slate-800 text-base">No Goals Found</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">Create a personalized savings goal to start securing your financial future.</p>
                <button 
                  onClick={() => setView('create')} 
                  className="mt-4 px-4 py-2 bg-jolas-green-primary text-white rounded-xl text-xs font-bold"
                  id="no-goal-create-btn"
                >
                  Create Your First Goal
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* CREATE GOAL VIEW */}
        {view === 'create' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}>
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => setView('list')} 
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                id="back-to-goals-list"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Create Savings Goal</h2>
            </div>
            <p className="text-slate-500 text-xs mb-6">Define a target, schedule payments, and build a consistent discipline.</p>

            <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Goal Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newGoal.name}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    placeholder="e.g. House Rent 2027"
                    id="new-goal-name"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Select Savings Category</label>
                  <select
                    name="category"
                    value={newGoal.category}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    id="new-goal-cat"
                  >
                    {categories.length > 0 ? categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    )) : (
                      <option value="">-- No categories yet --</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target Amount (₦)</label>
                  <input
                    type="number"
                    name="targetAmount"
                    value={newGoal.targetAmount}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    placeholder="e.g. 600000"
                    id="new-goal-target"
                  />
                  {formErrors.targetAmount && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.targetAmount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Deposit Frequency</label>
                  <select
                    name="frequency"
                    value={newGoal.frequency}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    id="new-goal-freq"
                  >
                    <option value={DepositFrequency.DAILY}>Daily</option>
                    <option value={DepositFrequency.WEEKLY}>Weekly</option>
                    <option value={DepositFrequency.MONTHLY}>Monthly</option>
                    <option value={DepositFrequency.ANYTIME}>Anytime (Flexible)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Expected Recurring Deposit (₦)</label>
                  <input
                    type="number"
                    name="expectedDeposit"
                    value={newGoal.expectedDeposit}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    placeholder="e.g. 50000"
                    id="new-goal-expected"
                  />
                  {formErrors.expectedDeposit && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.expectedDeposit}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Savings Plan</label>
                  <select
                    name="apy"
                    value={newGoal.apy}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    id="new-goal-apy"
                  >
                    <option value="0">Standard Savings Plan</option>
                    <option value="0">Growth Booster Plan</option>
                    <option value="0">High-Yield Lock Vault</option>
                    <option value="0">Super Elite Wealth Vault</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={newGoal.startDate}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    id="new-goal-start"
                  />
                  {formErrors.startDate && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={newGoal.endDate}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    id="new-goal-end"
                  />
                  {formErrors.endDate && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.endDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Safe Withdrawal Date</label>
                  <input
                    type="date"
                    name="withdrawalDate"
                    value={newGoal.withdrawalDate}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    id="new-goal-withdrawal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Goal Image <span className="text-slate-400 font-normal">(Visual representation)</span></label>
                <select
                  name="imageUrl"
                  value={newGoal.imageUrl}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                  id="new-goal-img"
                >
                  <option value="https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=400">💰 Financial Growth</option>
                  <option value="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400">🏠 Modern House Apartment</option>
                  <option value="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=400">🎓 School/Education Graduation</option>
                  <option value="https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&q=80&w=400">💻 Tech Gadgets &amp; Laptops</option>
                  <option value="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400">✈ Vacation Beach Travel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Notes / Description</label>
                <textarea
                  name="notes"
                  value={newGoal.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                  placeholder="What are you saving for specifically? Any custom motivations?"
                  id="new-goal-notes"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="reminderEnabled"
                  checked={newGoal.reminderEnabled}
                  onChange={handleInputChange}
                  className="rounded-sm accent-jolas-green-primary cursor-pointer"
                  id="new-goal-reminder"
                />
                <label htmlFor="new-goal-reminder" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Send me recurring automated email/SMS reminders for payments
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="w-full py-3.5 border border-slate-200 text-slate-700 rounded-2xl font-semibold text-xs hover:bg-slate-50 transition-colors"
                  id="cancel-create-goal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-semibold py-3.5 rounded-2xl shadow-md transition-all text-xs cursor-pointer flex items-center justify-center gap-1"
                  id="submit-create-goal"
                >
                  <Sparkles size={14} />
                  <span>Create Savings Goal</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* GOAL DETAILS VIEW */}
        {view === 'details' && selectedGoal && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => { setSelectedGoal(null); setView('list'); }} 
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                id="back-to-list-from-details"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Savings Plan Details</h2>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
              {/* Image banner */}
              <div className="h-44 relative bg-slate-100">
                <img 
                  src={selectedGoal.imageUrl || 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=400'} 
                  alt="Goal Banner" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <span className="absolute bottom-4 left-4 text-white text-lg font-extrabold flex items-center gap-1.5 font-sans">
                  <span>{getCategoryIcon(selectedGoal.category)}</span>
                  <span>{selectedGoal.name}</span>
                </span>
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-emerald-500 text-white uppercase">
                  {selectedGoal.status}
                </span>
              </div>

              {/* Progress Panel */}
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                    <span>Goal Accumulation</span>
                    <span className="text-jolas-green-primary font-mono">
                      {Math.round((selectedGoal.amountSaved / selectedGoal.targetAmount) * 100)}%
                    </span>
                  </div>
                  <CustomProgressBar percentage={(selectedGoal.amountSaved / selectedGoal.targetAmount) * 100} />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">SAVED SO FAR</span>
                      <span className="text-lg font-extrabold text-slate-800">{formatMoney(selectedGoal.amountSaved)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">TARGET GOAL</span>
                      <span className="text-lg font-extrabold text-slate-800">{formatMoney(selectedGoal.targetAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Details Meta */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs border-t border-b border-slate-100 py-4">
                  <div>
                    <span className="text-slate-400 font-medium">Deposit Frequency:</span>
                    <span className="block font-bold text-slate-700 mt-0.5">{selectedGoal.frequency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Expected Deposit:</span>
                    <span className="block font-bold text-slate-700 mt-0.5">{formatMoney(selectedGoal.expectedDeposit)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Start Date:</span>
                    <span className="block font-bold text-slate-700 mt-0.5">{selectedGoal.startDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Safe Withdrawal Date:</span>
                    <span className="block font-bold text-slate-700 mt-0.5">{selectedGoal.withdrawalDate}</span>
                  </div>
                  {/* APY and Accrued Interest displays removed */}
                </div>

                {selectedGoal.notes && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150/40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Goal Notes</span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedGoal.notes}</p>
                  </div>
                )}

                <div className="p-3 bg-jolas-green-primary/5 text-jolas-green-primary rounded-2xl flex gap-2 text-xs">
                  <Check size={16} className="shrink-0 mt-0.5" />
                  <span>Guaranteed compliance: All Jolas funds are protected and secure. Early payouts are eligible for administrative checkups.</span>
                </div>

                {/* Detailed Action buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => onSelectGoalForWithdraw(selectedGoal.id)}
                    className="w-full py-3.5 border border-rose-200 text-rose-600 rounded-2xl font-bold text-xs hover:bg-rose-50/50 transition-colors flex items-center justify-center gap-1.5"
                    id="withdraw-from-goal-btn"
                  >
                    <span>Request Payout</span>
                  </button>
                  <button
                    onClick={() => onSelectGoalForDeposit(selectedGoal.id)}
                    className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-bold py-3.5 rounded-2xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5"
                    id="save-to-goal-btn"
                  >
                    <Plus size={14} />
                    <span>Save Funds Now</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
