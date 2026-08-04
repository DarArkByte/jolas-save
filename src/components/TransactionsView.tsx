import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, FileText, Download, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  onViewReceipt: (tx: Transaction) => void;
  userProfile?: any;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onViewReceipt, userProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Deposit' | 'Withdrawal' | 'Pending'>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Oldest' | 'AmountAsc' | 'AmountDesc'>('Newest');

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.goalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'All') return matchesSearch;
    if (filterType === 'Deposit') return matchesSearch && tx.type === 'Deposit';
    if (filterType === 'Withdrawal') return matchesSearch && tx.type === 'Withdrawal';
    if (filterType === 'Pending') return matchesSearch && tx.status === 'Pending';
    return matchesSearch;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'Newest') return b.id.localeCompare(a.id); // Assuming generated ID order matches time
    if (sortBy === 'Oldest') return a.id.localeCompare(b.id);
    if (sortBy === 'AmountDesc') return b.amount - a.amount;
    if (sortBy === 'AmountAsc') return a.amount - b.amount;
    return 0;
  });

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const handleExportStatement = (format: 'PDF' | 'CSV') => {
    if (format === 'CSV') {
      const headers = ['Transaction ID', 'Receipt Number', 'Goal Name', 'Amount (NGN)', 'Date', 'Time', 'Payment Method', 'Balance After (NGN)', 'Type', 'Status', 'Customer Name'];
      const rows = sortedTransactions.map(tx => [
        tx.transactionId,
        tx.receiptNumber,
        tx.goalName,
        tx.amount,
        tx.date,
        tx.time,
        tx.paymentMethod,
        tx.balanceAfter,
        tx.type,
        tx.status,
        tx.customerName
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `jolas_save_statement_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  return (
    <div className="print:hidden space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Transaction Activities</h2>
          <p className="text-slate-500 text-xs mt-0.5">Filter, search, audit, and retrieve digital receipts</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExportStatement('CSV')}
            className="px-3.5 py-2 border border-slate-200 text-slate-650 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            id="export-csv-stmt"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => handleExportStatement('PDF')}
            className="px-3.5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            id="export-pdf-stmt"
          >
            <FileText size={14} />
            <span>Print PDF Statement</span>
          </button>
        </div>
      </div>

      {/* Search & Sort Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-emerald-500 focus:outline-hidden text-slate-800"
            placeholder="Search by goal name or transaction ref..."
            id="tx-search-input"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:outline-hidden bg-white cursor-pointer"
            id="tx-sort-select"
          >
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
            <option value="AmountDesc">Amount: High to Low</option>
            <option value="AmountAsc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['All', 'Deposit', 'Withdrawal', 'Pending'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              filterType === type
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            id={`filter-tx-chip-${type}`}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Transaction List Cards */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-xs overflow-hidden">
        {sortedTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {sortedTransactions.map(tx => (
              <div
                key={tx.id}
                onClick={() => onViewReceipt(tx)}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-all cursor-pointer relative group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                    tx.type === 'Deposit'
                      ? 'bg-emerald-100 text-emerald-700'
                      : tx.type === 'Withdrawal'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {tx.type === 'Deposit' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{tx.goalName}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                      <span>Ref: {tx.transactionId}</span>
                      <span>•</span>
                      <span>{tx.date} • {tx.time}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold font-mono block ${
                    tx.type === 'Deposit'
                      ? 'text-emerald-600'
                      : tx.type === 'Withdrawal'
                        ? 'text-rose-600'
                        : 'text-indigo-600'
                  }`}>
                    {tx.type === 'Deposit' ? '+' : '-'}{formatMoney(tx.amount)}
                  </span>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      tx.status === 'Successful' || tx.status === 'Approved' || tx.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : tx.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 font-bold'
                          : 'bg-rose-50 text-rose-700'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FileText size={24} />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No transactions found</h4>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
      
      {/* PRINT-ONLY STATEMENT LAYOUT */}
      <div className="hidden print:block space-y-8 bg-white p-8 text-black text-xs">
        <div className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-2xl font-black text-[#0B6E4F] tracking-tight">JOLAS SAVE</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Official Statement of Account</p>
          </div>
          <div className="text-right space-y-1">
            <p className="font-bold">WhatsApp Support: +234 803 736 7585</p>
            <p className="text-[10px] text-slate-400">Statement Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Information Block */}
        <div className="grid grid-cols-2 gap-8 border-b pb-6 text-[10px]">
          <div>
            <h3 className="font-bold text-[#0B6E4F] uppercase tracking-wider mb-2">Account Owner</h3>
            <p className="text-slate-800 font-bold">FullName: {userProfile?.fullName || 'N/A'}</p>
            <p>Email: {userProfile?.email || 'N/A'}</p>
            <p>Phone: {userProfile?.phoneNumber || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-bold text-[#0B6E4F] uppercase tracking-wider mb-2">Statement Overview</h3>
            <p className="text-slate-800 font-bold">Total Operations Evaluated: {sortedTransactions.length}</p>
            <p>Verification Audit Status: KYC Certified</p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#0B6E4F] uppercase tracking-wider text-xs">Ledger Transactions Logs</h3>
          <table className="w-full border-collapse border text-[9px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="border p-2 text-left">Date &amp; Time</th>
                <th className="border p-2 text-left">Transaction ID</th>
                <th className="border p-2 text-left">Savings Goal</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-right">Amount (₦)</th>
                <th className="border p-2 text-right">Balance After (₦)</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map(tx => (
                <tr key={tx.id}>
                  <td className="border p-2 font-mono">{tx.date} {tx.time}</td>
                  <td className="border p-2 font-mono text-[8px]">{tx.transactionId}</td>
                  <td className="border p-2 font-bold">{tx.goalName}</td>
                  <td className="border p-2">{tx.type}</td>
                  <td className={`border p-2 text-right font-bold ${tx.type === 'Deposit' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {tx.type === 'Deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </td>
                  <td className="border p-2 text-right font-mono">₦{tx.balanceAfter.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-16 border-t text-center text-slate-400 text-[8px] tracking-widest uppercase">
          JOLAS SAVE Vault Operations • Digitally Verified Compliance Audit Log
        </div>
      </div>
    </div>
  );
};
