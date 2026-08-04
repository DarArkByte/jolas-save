import React, { useState } from 'react';
import { Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, Target, TrendingUp, Sparkles, AlertCircle, ChevronRight, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { SavingsGoal, Transaction, DepositRequest, DepositRequestStatus } from '../types';
import { CustomProgressBar } from './UIComponents';
import { JolasLogoIcon } from './JolasLogo';

interface DashboardViewProps {
  userProfile: any;
  goals: SavingsGoal[];
  transactions: Transaction[];
  depositRequests: DepositRequest[];
  onQuickAction: (action: string) => void;
  onViewTransaction: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  goals,
  transactions,
  depositRequests,
  onQuickAction,
  onViewTransaction
}) => {
  const [hideBalances, setHideBalances] = useState(false);

  const formatMoney = (amount: number) => {
    if (hideBalances) return '•••••••';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amount);
  };

  // Compute stats
  const totalSavings = goals.reduce((acc, curr) => acc + curr.amountSaved, 0);
  const totalInterest = goals.reduce((acc, curr) => acc + (curr.accruedInterest || 0), 0);
  const activePlansCount = goals.filter(g => g.status === 'Active').length;
  const totalDeposits = transactions.filter(t => t.type === 'Deposit' && t.status === 'Successful').reduce((acc, curr) => acc + curr.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'Withdrawal' && (t.status === 'Successful' || t.status === 'Approved' || t.status === 'Paid')).reduce((acc, curr) => acc + curr.amount, 0);

  // Deposit Request statistics
  const userRequests = depositRequests.filter(req => 
    (req.customerId && req.customerId === userProfile.username) || 
    (req.customerUsername && req.customerUsername === userProfile.username)
  );
  
  const pendingRequestsList = userRequests.filter(req => 
    req.status === DepositRequestStatus.PENDING ||
    req.status === DepositRequestStatus.DRAFT || 
    req.status === DepositRequestStatus.WAITING_WHATSAPP || 
    req.status === DepositRequestStatus.AWAITING_TRANSFER ||
    (req.status as string) === 'Pending' ||
    (req.status as string) === 'Draft' ||
    (req.status as string) === 'Waiting for WhatsApp Contact' ||
    (req.status as string) === 'Awaiting Transfer'
  );
  
  const pendingRequestsCount = pendingRequestsList.length;
  const pendingRequestsTotal = pendingRequestsList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const awaitingVerificationCount = userRequests.filter(req => 
    req.status === DepositRequestStatus.AWAITING_VERIFICATION ||
    (req.status as string) === 'Awaiting Verification'
  ).length;

  const successfullyCreditedCount = userRequests.filter(req => 
    req.status === DepositRequestStatus.CREDITED ||
    (req.status as string) === 'Credited'
  ).length;

  // Compute real dynamic savings growth trend from transaction records
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  
  const last5Months = [];
  for (let i = 4; i >= 0; i--) {
    let mIdx = currentMonthIdx - i;
    if (mIdx < 0) mIdx += 12;
    last5Months.push(months[mIdx]);
  }

  const growthData = last5Months.map((m, index) => {
    // Cumulative successful transactions up to this month's index
    const txsUpToMonth = transactions.filter(t => {
      if (t.status !== 'Successful') return false;
      const txMonthName = new Date(t.date).toLocaleString('en-US', { month: 'short' });
      const txMonthIdx = months.indexOf(txMonthName);
      const targetMonthIdx = months.indexOf(m);
      return txMonthIdx <= targetMonthIdx && txMonthIdx !== -1;
    });

    const deposits = txsUpToMonth.filter(t => t.type === 'Deposit').reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = txsUpToMonth.filter(t => t.type === 'Withdrawal').reduce((sum, t) => sum + t.amount, 0);
    
    let balance = Math.max(0, deposits - withdrawals);
    
    // Set current month to absolute totalSavings for maximum precision
    if (index === 4) {
      balance = totalSavings;
    }

    return { name: m, savings: balance };
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Visual Header Banner */}
      <div className="bg-jolas-green-primary/5/50 border border-jolas-green-primary/10/80 text-slate-800 rounded-[24px] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent"></div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <JolasLogoIcon size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white rounded-2xl border border-jolas-green-primary/10 shadow-2xs hidden sm:block">
              <JolasLogoIcon size={44} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-jolas-green-primary font-mono text-[10px] tracking-wider uppercase font-bold">
                <Sparkles size={12} className="text-jolas-green-primary" />
                <span>Premium Wealth Vault</span>
              </div>
              <span className="text-slate-500 text-xs mt-1 block font-medium">Account Balance</span>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans text-slate-900">
                  {formatMoney(totalSavings)}
                </h1>
                <button 
                  onClick={() => setHideBalances(!hideBalances)}
                  className="p-1.5 bg-white hover:bg-slate-100 rounded-full text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                  id="toggle-balance-btn"
                >
                  {hideBalances ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-jolas-green-primary text-xs mt-2 font-semibold flex items-center gap-1">
                <TrendingUp size={14} className="text-jolas-green-primary" />
                <span>Total Active Savings: {formatMoney(totalSavings)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button 
              onClick={() => onQuickAction('deposit')}
              className="px-4 py-3 bg-jolas-green-primary hover:bg-jolas-green-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              id="dash-quick-deposit"
            >
              <ArrowUpRight size={14} />
              <span>Quick Deposit</span>
            </button>
            <button 
              onClick={() => onQuickAction('withdraw')}
              className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              id="dash-quick-withdraw"
            >
              <ArrowDownLeft size={14} />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Savings Balance</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{formatMoney(totalSavings)}</h3>
          <button onClick={() => onQuickAction('goals')} className="text-jolas-green-primary font-semibold text-[10px] mt-2 flex items-center gap-0.5 hover:underline">
            <span>View {activePlansCount} Active Plans</span>
            <ChevronRight size={10} />
          </button>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pending Deposits</span>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingRequestsCount} {pendingRequestsCount === 1 ? 'Request' : 'Requests'}</h3>
          <span className="text-slate-500 font-bold text-xs mt-1 block">{formatMoney(pendingRequestsTotal)}</span>
          <button onClick={() => onQuickAction('deposit')} className="text-amber-600 font-semibold text-[10px] mt-2 flex items-center gap-0.5 hover:underline">
            <span>Track status</span>
            <ChevronRight size={10} />
          </button>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Awaiting Review</span>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-2xl font-extrabold text-purple-600">{awaitingVerificationCount}</h3>
            {awaitingVerificationCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide animate-pulse">
                In Review
              </span>
            )}
          </div>
          <span className="text-slate-400 text-[9px] mt-2 block font-mono">Receipts uploaded</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Credited Deposits</span>
          <h3 className="text-2xl font-extrabold text-jolas-green-primary mt-1">{successfullyCreditedCount} Credited</h3>
          <span className="text-slate-400 text-[9px] mt-2 block font-mono">Saved sum: {formatMoney(totalDeposits)}</span>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-xs">
        <h3 className="font-sans font-bold text-sm text-slate-800 tracking-tight mb-4 uppercase">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { id: 'create_goal', label: 'Create Goal', icon: Target, color: 'bg-jolas-green-primary/5 text-jolas-green-primary border-jolas-green-primary/10/50' },
            { id: 'deposit', label: 'Save Money', icon: Plus, color: 'bg-blue-50 text-blue-600 border-blue-100/50' },
            { id: 'withdraw', label: 'Request Cash', icon: ArrowDownLeft, color: 'bg-rose-50 text-rose-600 border-rose-100/50' },
            { id: 'reports', label: 'Get Reports', icon: FileText, color: 'bg-amber-50 text-amber-600 border-amber-100/50' }
          ].map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onQuickAction(action.id)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
                id={`qa-btn-${action.id}`}
              >
                <div className={`w-11 h-11 rounded-full ${action.color} border flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                  <Icon size={18} className="stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 text-center tracking-tight leading-tight group-hover:text-slate-800">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Section */}
        <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-sans font-bold text-sm text-slate-800 tracking-tight uppercase">Wealth Growth trend</h3>
              <p className="text-slate-400 text-[10px]">Monthly savings valuation</p>
            </div>
            <span className="text-xs font-bold text-jolas-green-primary bg-jolas-green-primary/5 px-2.5 py-1 rounded-full border border-jolas-green-primary/10">
              YTD 2026
            </span>
          </div>

          <div className="h-60 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₦${val/1000}k`} />
                <Tooltip 
                  formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Savings Balance']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                />
                <Area type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Progress Summary */}
        <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-bold text-sm text-slate-800 tracking-tight uppercase">Goal Progress</h3>
            <button 
              onClick={() => onQuickAction('goals')} 
              className="text-xs font-bold text-jolas-green-primary hover:underline"
              id="dash-view-all-goals"
            >
              See all
            </button>
          </div>

          <div className="space-y-4">
            {goals.slice(0, 3).map(goal => {
              const progress = (goal.amountSaved / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="space-y-1.5 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{goal.name}</span>
                    <span className="text-slate-500 font-mono">{Math.round(progress)}%</span>
                  </div>
                  <CustomProgressBar percentage={progress} />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>₦{goal.amountSaved.toLocaleString()} saved</span>
                    <span>₦{goal.targetAmount.toLocaleString()} target</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {goals.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl flex gap-2 text-xs text-amber-800">
              <AlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Goal Security Active</p>
                <p className="text-[10px] leading-relaxed text-amber-700/90 mt-0.5">Your <strong>{goals[0].name}</strong> goal is active and tracking towards target {formatMoney(goals[0].targetAmount)}.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-bold text-sm text-slate-800 tracking-tight uppercase">Recent Activities</h3>
          <button 
            onClick={() => onQuickAction('activity')} 
            className="text-xs font-bold text-jolas-green-primary hover:underline"
            id="dash-view-all-activities"
          >
            See history
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 4).map(tx => (
            <div 
              key={tx.id} 
              onClick={() => onViewTransaction(tx)}
              className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 px-2 rounded-xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                  tx.type === 'Deposit' 
                    ? 'bg-jolas-green-primary/10 text-jolas-green-primary' 
                    : tx.type === 'Withdrawal' 
                      ? 'bg-rose-100 text-rose-700' 
                      : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {tx.type === 'Deposit' ? '+' : tx.type === 'Withdrawal' ? '-' : 'M'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{tx.goalName}</h4>
                  <p className="text-[10px] text-slate-400">{tx.date} • {tx.time}</p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold font-mono block ${
                  tx.type === 'Deposit' 
                    ? 'text-jolas-green-primary' 
                    : tx.type === 'Withdrawal' 
                      ? 'text-rose-600' 
                      : 'text-indigo-600'
                }`}>
                  {tx.type === 'Deposit' ? '+' : '-'}{formatMoney(tx.amount)}
                </span>
                <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  tx.status === 'Successful' || tx.status === 'Approved' || tx.status === 'Paid'
                    ? 'bg-jolas-green-primary/5 text-jolas-green-primary'
                    : tx.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
