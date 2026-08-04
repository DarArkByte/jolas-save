import React, { useState } from 'react';
import { Shield, Users, ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, AlertCircle, Sparkles, Plus, Send, Activity, RefreshCw, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, WithdrawalRequest, DepositRequest, DepositRequestStatus, SavingsGoal, Transaction } from '../types';

import { JolasLogoIcon } from './JolasLogo';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { InforgeBaaS } from '../lib/inforge';


interface AdminDashboardViewProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  withdrawalRequests: WithdrawalRequest[];
  onApproveWithdrawal: (id: string) => void;
  onRejectWithdrawal: (id: string) => void;
  onBroadcastAnnouncement: (title: string, msg: string) => void;
  usersList: UserProfile[];
  onToggleUserStatus: (username: string, status: 'Active' | 'Frozen' | 'Suspended') => void;
  categoriesList: Array<{ id: string; name: string; icon: string; color: string }>;
  onAddCategory: (name: string, icon: string) => void;
  depositRequests: DepositRequest[];
  onVerifyDepositRequest: (reqId: string, action: 'verify' | 'credit' | 'reject', notes?: string) => void;
  goalsList: SavingsGoal[];
  transactionsList: Transaction[];
  onAssignAgent?: (customerUsername: string, agentUsername: string | null) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentView,
  setCurrentView,
  withdrawalRequests,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onBroadcastAnnouncement,
  usersList,
  onToggleUserStatus,
  categoriesList,
  onAddCategory,
  depositRequests,
  onVerifyDepositRequest,
  goalsList,
  transactionsList,
  onAssignAgent
}) => {
  let activeSubTab: 'payouts' | 'deposits' | 'users' | 'broadcast' | 'categories' = 'payouts';
  if (currentView === 'admin_users') activeSubTab = 'users';
  else if (currentView === 'admin_transactions') activeSubTab = 'deposits';
  else if (currentView === 'admin_reports') activeSubTab = 'categories';
  else if (currentView === 'admin_broadcast') activeSubTab = 'broadcast';

  const handleTabChange = (tabId: 'payouts' | 'deposits' | 'users' | 'broadcast' | 'categories') => {
    if (tabId === 'payouts') setCurrentView('admin_dashboard');
    else if (tabId === 'users') setCurrentView('admin_users');
    else if (tabId === 'deposits') setCurrentView('admin_transactions');
    else if (tabId === 'broadcast') setCurrentView('admin_broadcast');
    else if (tabId === 'categories') setCurrentView('admin_reports');
  };
  
  // Deposit Search & Filtering States
  const [depSearch, setDepSearch] = useState('');
  const [depFilter, setDepFilter] = useState<string>('All');
  const [adminNote, setAdminNote] = useState('');
  const [activeNoteReqId, setActiveNoteReqId] = useState<string | null>(null);

  // Broadcast State
  const [bTitle, setBTitle] = useState('');
  const [bMsg, setBMsg] = useState('');

  // Category State
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('⭐');

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bMsg.trim()) return;
    onBroadcastAnnouncement(bTitle, bMsg);
    setBTitle('');
    setBMsg('');
    alert('System announcement broadcasted successfully to all platform users!');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    onAddCategory(catName, catIcon);
    setCatName('');
    alert(`Category "${catName}" added successfully to savings options!`);
  };

  const totalAssets = goalsList.reduce((acc, curr) => acc + curr.amountSaved, 0);
  const totalFees = transactionsList
    .filter(t => (t.type === 'Membership Fee' || t.type === 'Withdrawal Fee' || t.goalName?.toLowerCase().includes('clearance')) && t.status === 'Successful')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const pendingPayouts = withdrawalRequests.filter(w => w.status === 'Pending');

  // Compute dynamic deposit volumes for the last 6 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    let mIdx = currentMonthIdx - i;
    if (mIdx < 0) mIdx += 12;
    last6Months.push(months[mIdx]);
  }

  const dynamicChartData = last6Months.map(m => {
    const monthTxs = transactionsList.filter(t => {
      if (t.type !== 'Deposit' || t.status !== 'Successful') return false;
      const txMonthName = new Date(t.date).toLocaleString('en-US', { month: 'short' });
      return txMonthName === m;
    });
    const volume = monthTxs.reduce((sum, t) => sum + t.amount, 0);
    return { month: m, deposits: volume };
  });

  const pendingDepositRequestsCount = depositRequests.filter(r => 
    r.status === DepositRequestStatus.PENDING ||
    r.status === DepositRequestStatus.AWAITING_VERIFICATION ||
    r.status === DepositRequestStatus.WAITING_WHATSAPP ||
    r.status === DepositRequestStatus.AWAITING_TRANSFER ||
    (r.status as string) === 'Pending' ||
    (r.status as string) === 'Awaiting Verification' ||
    (r.status as string) === 'Waiting for WhatsApp Contact' ||
    (r.status as string) === 'Awaiting Transfer'
  ).length;

  const creditedDepositRequestsCount = depositRequests.filter(r => 
    r.status === DepositRequestStatus.CREDITED ||
    (r.status as string) === 'Credited'
  ).length;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {activeSubTab === 'payouts' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-jolas-green-primary/5 rounded-2xl">
                <JolasLogoIcon size={44} />
              </div>
              <div>
                <div className="flex items-center gap-1 text-jolas-green-primary font-mono text-[10px] tracking-wider uppercase font-bold">
                  <Shield size={12} />
                  <span>Auditing &amp; Back-Office Ops</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight leading-none mt-0.5">Fintech Admin Command</h2>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border">
                Role: <span className="text-jolas-green-primary">Audit Compliance Admin</span>
              </div>
              <span className="text-[8px] font-bold uppercase text-slate-500 tracking-wider">JOLAS SAVE • Secure Tomorrow</span>
            </div>
          </div>

          {/* Admin stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => handleTabChange('deposits')}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs text-left hover:border-amber-300 transition-all cursor-pointer group"
            >
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pending Deposits</span>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-2xl font-extrabold text-amber-600">{pendingDepositRequestsCount}</h3>
                {pendingDepositRequestsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse uppercase tracking-wide">
                    {pendingDepositRequestsCount === 1 ? '1 Request' : `${pendingDepositRequestsCount} Requests`}
                  </span>
                )}
              </div>
              <span className="text-amber-600 font-bold text-[9px] mt-1.5 block group-hover:underline">Click to view &amp; approve →</span>
            </button>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Savings Balance</span>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{formatMoney(totalAssets)}</h3>
              <span className="text-slate-400 text-[9px] mt-2 block font-mono">Credited customer savings</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Credited Deposits</span>
              <h3 className="text-2xl font-extrabold text-jolas-green-primary mt-1">{creditedDepositRequestsCount} Credited</h3>
              <span className="text-slate-400 text-[9px] mt-2 block font-mono">Verified bank transfers</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pending Withdrawals</span>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-2xl font-extrabold text-red-600">{pendingPayouts.length}</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-50 text-red-700 border border-red-100 animate-pulse uppercase tracking-wide">
                  Action Req
                </span>
              </div>
              <span className="text-slate-400 text-[9px] mt-1.5 block font-mono">Requires instant review</span>
            </div>
          </div>

          {/* Platform Growth Charts */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Platform Performance &amp; Growth</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Real-time deposit volume &amp; active savings trend</p>
              </div>
              <span className="text-[10px] font-bold text-jolas-green-primary bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">Active Monitoring</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B6E4F" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0B6E4F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} fontStyle="bold" tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} fontStyle="bold" tickLine={false} axisLine={false} tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Deposits Volume']} labelStyle={{ fontSize: '10px', fontWeight: 'bold' }} contentStyle={{ fontSize: '10px', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="deposits" stroke="#0B6E4F" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDeposits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Admin tabs */}
      <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pb-1">
        {[
          { id: 'payouts', label: `Pending Payouts (${pendingPayouts.length})`, icon: ArrowDownLeft },
          { id: 'deposits', label: `Manual Deposits (${depositRequests.filter(r => 
            r.status === DepositRequestStatus.PENDING ||
            r.status === DepositRequestStatus.AWAITING_VERIFICATION ||
            r.status === DepositRequestStatus.WAITING_WHATSAPP ||
            r.status === DepositRequestStatus.AWAITING_TRANSFER ||
            (r.status as string) === 'Pending' ||
            (r.status as string) === 'Awaiting Verification' ||
            (r.status as string) === 'Waiting for WhatsApp Contact' ||
            (r.status as string) === 'Awaiting Transfer'
          ).length})`, icon: ArrowUpRight },
          { id: 'users', label: 'User Compliance &amp; KYC', icon: Users },
          { id: 'broadcast', label: 'Broadcast Bulletin', icon: Send },
          { id: 'categories', label: 'Savings Categories', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === tab.id
                  ? 'border-jolas-green-primary text-jolas-green-primary font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              id={`admin-tab-${tab.id}`}
            >
              <Icon size={14} />
              <span dangerouslySetInnerHTML={{ __html: tab.label }}></span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
        
        {/* PAYOUTS & DEPOSITS Review Approval */}
        {activeSubTab === 'payouts' && (
          <div className="space-y-6">
            {/* PENDING DEPOSIT APPROVALS HIGHLIGHT BANNER */}
            {depositRequests.filter(r => 
              r.status === DepositRequestStatus.PENDING ||
              r.status === DepositRequestStatus.AWAITING_VERIFICATION ||
              r.status === DepositRequestStatus.WAITING_WHATSAPP ||
              r.status === DepositRequestStatus.AWAITING_TRANSFER ||
              ['Pending', 'Awaiting Verification', 'Waiting for WhatsApp Contact', 'Awaiting Transfer'].includes(r.status as string)
            ).length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 p-4.5 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center font-bold text-sm">
                    ⏳
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                      Pending Deposit Approvals ({
                        depositRequests.filter(r => 
                          r.status === DepositRequestStatus.PENDING ||
                          r.status === DepositRequestStatus.AWAITING_VERIFICATION ||
                          r.status === DepositRequestStatus.WAITING_WHATSAPP ||
                          r.status === DepositRequestStatus.AWAITING_TRANSFER ||
                          ['Pending', 'Awaiting Verification', 'Waiting for WhatsApp Contact', 'Awaiting Transfer'].includes(r.status as string)
                        ).length
                      })
                    </h4>
                    <p className="text-[11px] text-amber-800 font-medium">Customer deposit requests are awaiting your verification and account crediting.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange('deposits')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  Review &amp; Approve Deposits →
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Awaiting Settlement Approvals</h3>
              <span className="text-[10px] text-slate-500 font-medium">Click Approve to trigger payout settlement</span>
            </div>

            {pendingPayouts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {pendingPayouts.map(req => (
                  <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-sm font-bold font-mono">
                          {req.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800">
                          {req.amount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })} payout
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Goal: <strong className="text-slate-700">{req.goalName}</strong> • Type: <strong className="text-slate-700">{req.withdrawalType}</strong>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Destination Bank: <span className="text-slate-500 font-semibold">{req.bankAccount}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                        "Reason: {req.reason}"
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => onRejectWithdrawal(req.id)}
                        className="px-3 py-2 border border-red-200 text-red-600 bg-red-50/20 hover:bg-red-50 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                        id={`reject-btn-${req.id}`}
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => onApproveWithdrawal(req.id)}
                        className="px-4.5 py-2 bg-jolas-green-primary hover:bg-jolas-green-dark text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                        id={`approve-btn-${req.id}`}
                      >
                        <CheckCircle2 size={14} />
                        <span>Audit &amp; Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <CheckCircle2 size={36} className="text-jolas-green-primary mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No Pending Payouts</h4>
                <p className="text-slate-400 text-xs mt-1">All requested withdrawals have been cleared and disbursed.</p>
              </div>
            )}
          </div>
        )}

        {/* DEPOSIT REQUESTS MANAGEMENT */}
        {activeSubTab === 'deposits' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-tight">Manual Deposit Requests</h3>
                <p className="text-[10px] text-slate-400">Review and verify manual customer bank transfers to credit their savings balances</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['All', 'Pending', 'Awaiting Verification', 'Awaiting Transfer', 'Waiting for WhatsApp', 'Credited', 'Rejected'].map(st => (
                  <button
                    key={st}
                    onClick={() => setDepFilter(st)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                      depFilter === st
                        ? 'bg-jolas-green-primary text-white border-transparent'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Search inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={depSearch}
                onChange={(e) => setDepSearch(e.target.value)}
                placeholder="Search by ID, Name, Phone, Username..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary"
              />
            </div>

            {/* List of deposit requests */}
            {(() => {
              const filtered = depositRequests.filter(req => {
                // Search term match
                const matchSearch = 
                  req.id.toLowerCase().includes(depSearch.toLowerCase()) ||
                  req.customerName.toLowerCase().includes(depSearch.toLowerCase()) ||
                  req.customerPhone.toLowerCase().includes(depSearch.toLowerCase()) ||
                  req.customerUsername.toLowerCase().includes(depSearch.toLowerCase());

                // Filter status match
                if (depFilter === 'All') return matchSearch;
                if (depFilter === 'Pending') return matchSearch && (req.status === DepositRequestStatus.PENDING || (req.status as string) === 'Pending');
                if (depFilter === 'Awaiting Verification') return matchSearch && (req.status === DepositRequestStatus.AWAITING_VERIFICATION || (req.status as string) === 'Awaiting Verification');
                if (depFilter === 'Awaiting Transfer') return matchSearch && (req.status === DepositRequestStatus.AWAITING_TRANSFER || (req.status as string) === 'Awaiting Transfer');
                if (depFilter === 'Waiting for WhatsApp') return matchSearch && (req.status === DepositRequestStatus.WAITING_WHATSAPP || (req.status as string) === 'Waiting for WhatsApp Contact');
                if (depFilter === 'Credited') return matchSearch && (req.status === DepositRequestStatus.CREDITED || (req.status as string) === 'Credited');
                if (depFilter === 'Rejected') return matchSearch && (req.status === DepositRequestStatus.REJECTED || (req.status as string) === 'Rejected' || (req.status as string) === 'Declined');
                return matchSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-10">
                    <p className="text-slate-400 text-xs">No deposit requests match your search or filter.</p>
                  </div>
                );
              }

              // Sort newest requests first (by createdAt or numerical ID timestamp)
              const sorted = [...filtered].sort((a, b) => {
                const timeA = new Date(a.createdAt).getTime() || 0;
                const timeB = new Date(b.createdAt).getTime() || 0;
                if (timeA !== timeB) return timeB - timeA;
                return b.id.localeCompare(a.id);
              });

              return (
                <div className="divide-y divide-slate-150">
                  {sorted.map(req => (
                    <div key={req.id} className="py-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-jolas-green-primary/5 text-jolas-green-primary border border-jolas-green-primary/10 font-mono font-bold px-1.5 py-0.5 rounded-sm">
                              {req.id}
                            </span>
                            <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                              req.status === DepositRequestStatus.CREDITED 
                                ? 'bg-jolas-green-primary text-white' 
                                : req.status === DepositRequestStatus.AWAITING_VERIFICATION 
                                  ? 'bg-purple-50 text-purple-700 border border-purple-100 animate-pulse'
                                  : 'bg-slate-100 text-slate-600'
                            }`}>
                              {req.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800">
                            {formatMoney(req.amount)} &bull; Goal: <span className="text-jolas-green-primary">{req.goalName}</span>
                          </h4>

                          <p className="text-[11px] text-slate-500 font-medium">
                            Customer: <strong className="text-slate-700">{req.customerName}</strong> (@{req.customerUsername}) &bull; Tel: <span className="font-mono">{req.customerPhone}</span>
                          </p>

                          <div className="flex items-center gap-2 text-[11px] pt-1">
                            <span className="font-semibold text-slate-600">Payment Proof:</span>
                            {req.proofOfPaymentUrl ? (
                              <a href={req.proofOfPaymentUrl} target="_blank" rel="noreferrer" className="text-jolas-green-primary underline font-bold hover:text-jolas-green-dark">
                                View Uploaded Receipt ↗
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                💬 Payment proof: Awaiting WhatsApp receipt (Match via ID: <span className="font-mono">{req.id}</span>)
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-slate-400 pt-0.5">
                            Requested At: <span className="font-mono">{req.createdAt}</span>
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 shrink-0">
                          {(
                            req.status === DepositRequestStatus.PENDING ||
                            req.status === DepositRequestStatus.WAITING_WHATSAPP ||
                            req.status === DepositRequestStatus.AWAITING_VERIFICATION ||
                            req.status === DepositRequestStatus.AWAITING_TRANSFER ||
                            ['Pending', 'Waiting for WhatsApp Contact', 'Awaiting Verification', 'Awaiting Transfer'].includes(req.status as string)
                          ) && (
                            <>
                              <button
                                onClick={() => onVerifyDepositRequest(req.id, 'reject', adminNote)}
                                className="px-3 py-1.5 border border-red-200 text-red-600 bg-red-50/10 hover:bg-red-50 text-[10px] font-bold rounded-lg cursor-pointer"
                              >
                                Reject Payment
                              </button>
                              <button
                                onClick={() => {
                                  onVerifyDepositRequest(req.id, 'credit', adminNote);
                                  setAdminNote('');
                                  setActiveNoteReqId(null);
                                }}
                                className="px-3 py-1.5 bg-jolas-green-primary hover:bg-jolas-green-dark text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-xs"
                              >
                                Credit Savings Account
                              </button>
                            </>
                          )}

                          {activeNoteReqId === req.id ? (
                            <button
                              onClick={() => {
                                setActiveNoteReqId(null);
                                setAdminNote('');
                              }}
                              className="px-2.5 py-1.5 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                            >
                              Cancel Note
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveNoteReqId(req.id);
                                setAdminNote(req.notes || '');
                              }}
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border text-slate-600 text-[10px] font-bold rounded-lg"
                            >
                              {req.notes ? 'Edit Note' : 'Add Auditor Note'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notes Box input if open */}
                      {activeNoteReqId === req.id && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                          <label className="block text-[10px] font-bold text-slate-600">Auditor Notes</label>
                          <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={2}
                            placeholder="Type internal transaction audit notes here..."
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden"
                          />
                        </div>
                      )}

                      {/* Display existing notes & Proof of Payment if uploaded */}
                      {(req.notes || req.proofOfPaymentUrl) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border">
                          {req.notes && (
                            <div className="space-y-1">
                              <span className="block text-[9px] uppercase font-bold text-slate-400">Auditor &amp; User Notes</span>
                              <p className="text-xs text-slate-600 leading-relaxed italic">"{req.notes}"</p>
                            </div>
                          )}

                          {req.proofOfPaymentUrl && (
                            <div className="space-y-1.5">
                              <span className="block text-[9px] uppercase font-bold text-slate-400">Uploaded Transfer Proof</span>
                              <div className="flex items-center gap-2">
                                <a 
                                  href={req.proofOfPaymentUrl} 
                                  target="_blank" 
                                  rel="referrer" 
                                  className="text-xs font-bold text-jolas-green-primary hover:underline flex items-center gap-1 bg-white border px-2 py-1 rounded-md"
                                >
                                  <span>View Full Evidence</span>
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mini Audit Log Timeline */}
                      <div className="space-y-1 pt-1">
                        <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Audit logs</span>
                        <div className="flex flex-wrap gap-2">
                          {req.auditLog.map((log, lidx) => (
                            <span key={lidx} className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm">
                              {log.timestamp} - {log.action} ({log.actor})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* USERS Compliance Management */}
        {activeSubTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Registered Accounts &amp; Member Profiles</h3>
                <p className="text-[10px] text-slate-400">View brief member profiles, reset security credentials, assign agents, and manage account access status</p>
              </div>
              <span className="text-xs font-bold text-jolas-green-primary bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                {usersList.length} Total Registered Members
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="pb-2">User Profile &amp; Contact</th>
                    <th className="pb-2">Compliance &amp; Status</th>
                    <th className="pb-2">Settlement Bank</th>
                    <th className="pb-2">Assigned Agent</th>
                    <th className="pb-2 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((usr, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          {usr.passportPhoto ? (
                            <img src={usr.passportPhoto} alt="User Avatar" className="w-9 h-9 rounded-full object-cover border" />
                          ) : (
                            <div className="w-9 h-9 bg-jolas-green-primary/10 text-jolas-green-primary rounded-full flex items-center justify-center font-bold text-xs">
                              {usr.fullName ? usr.fullName.charAt(0) : 'U'}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-800 block leading-snug">{usr.fullName}</span>
                            <span className="text-[10px] text-slate-500 block">@{usr.username} &bull; {usr.email}</span>
                            <span className="text-[9px] text-slate-400 font-mono">Tel: {usr.phoneNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="space-y-1">
                          <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            usr.kycStatus === 'Verified' ? 'bg-jolas-green-primary/10 text-jolas-green-primary border border-jolas-green-primary/20' : 'bg-red-50 text-red-700 border border-red-150'
                          }`}>
                            KYC: {usr.kycStatus}
                          </span>
                          <span className="block text-[10px]">
                            Status: <strong className={usr.status === 'Active' ? 'text-jolas-green-primary font-bold' : 'text-rose-600 font-bold'}>{usr.status}</strong>
                          </span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[10px] text-slate-600">
                        <span className="font-bold text-slate-700 block">{usr.bankName || 'N/A'}</span>
                        <span>{usr.accountNumber || 'N/A'}</span>
                        <span className="block text-[9px] text-slate-400">{usr.accountName || ''}</span>
                      </td>
                      <td className="py-3">
                        {usr.role === 'Customer' ? (
                          <select
                            value={usr.assignedAgentUsername || ''}
                            onChange={(e) => onAssignAgent?.(usr.username, e.target.value || null)}
                            className="text-[10px] bg-slate-50 rounded-lg border border-slate-200 p-1.5 text-slate-700 font-semibold focus:outline-hidden"
                            id={`assign-agent-${usr.username}`}
                          >
                            <option value="">-- No Agent --</option>
                            {usersList.filter(u => u.role === 'Agent').map(agent => (
                              <option key={agent.username} value={agent.username}>
                                {agent.fullName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-medium">Staff ({usr.role})</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Admin Reset Password button */}
                          <button
                            onClick={() => {
                              const newPass = prompt(`Enter new security password for @${usr.username}:`);
                              if (newPass && newPass.trim()) {
                                InforgeBaaS.auth.resetPassword(usr.email, newPass.trim());
                                alert(`Security password for @${usr.username} updated successfully!`);
                              }
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            id={`reset-pwd-${usr.username}`}
                            title="Reset member password"
                          >
                            Reset Password
                          </button>

                          {/* Account Status / Ban Toggle */}
                          {usr.status === 'Active' ? (
                            <button
                              onClick={() => onToggleUserStatus(usr.username, 'Frozen')}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              id={`freeze-usr-${usr.username}`}
                              title="Ban / Freeze member access"
                            >
                              Ban / Freeze
                            </button>
                          ) : (
                            <button
                              onClick={() => onToggleUserStatus(usr.username, 'Active')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              id={`unfreeze-usr-${usr.username}`}
                              title="Unban / Activate member access"
                            >
                              Unban Account
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BROADCAST Bulletin Announcements */}
        {activeSubTab === 'broadcast' && (
          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="pb-2 border-b">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Send In-App Broadcast Notice</h3>
              <p className="text-slate-500 text-[10px] mt-0.5">Dispatches real-time popups and notification alerts to all users instantly.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Announcements Title</label>
              <input
                type="text"
                required
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-jolas-green-primary focus:outline-hidden"
                placeholder="e.g. Scheduled System Security Update on 18th July"
                id="broad-title-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Notice Bulletin Message</label>
              <textarea
                rows={4}
                required
                value={bMsg}
                onChange={(e) => setBMsg(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-jolas-green-primary focus:outline-hidden"
                placeholder="Compose announcement details with precise guidelines..."
                id="broad-msg-input"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              id="broad-submit-btn"
            >
              <Send size={14} />
              <span>Broadcast System Announcement</span>
            </button>
          </form>
        )}

        {/* CATEGORIES Builder */}
        {activeSubTab === 'categories' && (
          <div className="space-y-5">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider pb-2 border-b">Savings Categories Manager</h3>

            <form onSubmit={handleAddCategorySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end p-4 bg-slate-50 rounded-2xl border">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">New Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:outline-hidden focus:border-jolas-green-primary bg-white"
                  placeholder="e.g. Farming Capital"
                  id="cat-builder-name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Emoji Icon Badge</label>
                <select
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:outline-hidden bg-white"
                  id="cat-builder-icon"
                >
                  <option value="🌾">🌾 Agriculture / Farming</option>
                  <option value="💻">💻 Technology / Gadgets</option>
                  <option value="🏠">🏠 House Rent</option>
                  <option value="🚗">🚗 Vehicles</option>
                  <option value="🎓">🎓 Academic Tuition</option>
                  <option value="⭐">⭐ Custom goal</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
                id="cat-builder-submit"
              >
                <Plus size={14} />
                <span>Create Category</span>
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {categoriesList.map(cat => (
                <div key={cat.id} className="p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-2.5 shadow-2xs">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-semibold text-slate-700">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
