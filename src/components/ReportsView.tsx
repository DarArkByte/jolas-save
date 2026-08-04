import React, { useState } from 'react';
import { FileText, Download, Calendar, BarChart2, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { SavingsGoal, Transaction } from '../types';
import { JolasLogoIcon } from './JolasLogo';

interface ReportsViewProps {
  goals: SavingsGoal[];
  transactions: Transaction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ goals, transactions }) => {
  const [reportType, setReportType] = useState('deposit');
  const [timeframe, setTimeframe] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Your JOLAS secure audit report has been generated successfully and is ready to download!');
    }, 1500);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  // Compute total saved, pending withdrawals, performance
  const totalSaved = goals.reduce((acc, curr) => acc + curr.amountSaved, 0);
  const targetTotal = goals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const averagePerformance = targetTotal > 0 ? (totalSaved / targetTotal) * 100 : 0;

  // Recharts Bar Data: Deposits vs Withdrawals monthly
  const performanceData = [
    { month: 'Jan', Deposit: 120000, Withdrawal: 10000 },
    { month: 'Feb', Deposit: 80000, Withdrawal: 20000 },
    { month: 'Mar', Deposit: 110000, Withdrawal: 15000 },
    { month: 'Apr', Deposit: 140000, Withdrawal: 50000 },
    { month: 'May', Deposit: 130000, Withdrawal: 65000 }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-jolas-green-primary/5 rounded-2xl">
            <JolasLogoIcon size={44} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight uppercase leading-tight">Wealth Reports &amp; Statements</h2>
            <p className="text-slate-500 text-[11px] mt-0.5">Audit your monthly metrics, goal performances, and download statements</p>
          </div>
        </div>
        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">SECURED BY</span>
          <span className="block font-sans font-black text-xs text-jolas-green-primary tracking-tight leading-none mt-0.5">JOLAS SAVE</span>
          <span className="block text-[8px] font-bold uppercase text-slate-500 tracking-wider mt-1">Save Today... Secure Tomorrow</span>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-jolas-green-primary text-white rounded-3xl p-5 shadow-lg shadow-emerald-600/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Cumulative Savings Val</span>
            <TrendingUp size={16} />
          </div>
          <h3 className="text-2xl font-black mt-1">{formatMoney(totalSaved)}</h3>
          <p className="text-[10px] text-emerald-100 mt-2">Across {goals.length} active savings plans</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Average Goal Achievement</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{Math.round(averagePerformance)}%</h3>
          <p className="text-[10px] text-slate-400 mt-2">Relative to targets of {formatMoney(targetTotal)}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Audited Year</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">2026 Fiscal</h3>
          <p className="text-[10px] text-slate-400 mt-2">Standard Gregorian Cycle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts: Deposits vs Withdrawals */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-sans font-bold text-sm text-slate-800 tracking-tight uppercase">Deposits vs Withdrawals Trends</h3>
            <p className="text-slate-400 text-[10px]">Comparing monthly transaction sums (₦)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₦${val/1000}k`} />
                <Tooltip formatter={(value: any) => `₦${value.toLocaleString()}`} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Deposit" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Withdrawal" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Generate Custom Statement Panel */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs">
          <h3 className="font-sans font-bold text-sm text-slate-800 tracking-tight mb-4 uppercase">Request Audit Statement</h3>
          
          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Report Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-jolas-green-primary focus:outline-hidden bg-white"
                id="rep-type-select"
              >
                <option value="deposit">Deposit Growth Report</option>
                <option value="withdrawal">Withdrawal Logs Report</option>
                <option value="membership">Membership Revenues Audit</option>
                <option value="all">Full Comprehensive Account Statement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Timeframe Range</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-jolas-green-primary focus:outline-hidden bg-white"
                id="rep-timeframe-select"
              >
                <option value="weekly">Past 7 Days</option>
                <option value="monthly">Current Month (May 2026)</option>
                <option value="quarterly">First Quarter (Q1 2026)</option>
                <option value="yearly">Year to Date (YTD)</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50 text-blue-800 rounded-2xl flex gap-2 text-[10px] leading-relaxed border border-blue-100/50">
              <AlertCircle size={14} className="shrink-0 text-blue-600 mt-0.5" />
              <span>Statements are compliance-audited and watermarked with a secure cryptographic QR code verification stamp.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              id="generate-stmt-btn"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Compiling Audit Logs...</span>
                </>
              ) : (
                <>
                  <FileText size={14} />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
