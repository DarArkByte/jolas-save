import React, { useState } from 'react';
import { ShieldCheck, Calendar, CreditCard, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { MembershipLog } from '../types';

interface MembershipViewProps {
  logs: MembershipLog[];
  onPayMembership: (month: string, amount: number) => void;
}

export const MembershipView: React.FC<MembershipViewProps> = ({ logs, onPayMembership }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const handlePayFee = (month: string, amount: number) => {
    setLoading(month);
    setTimeout(() => {
      onPayMembership(month, amount);
      setLoading(null);
      alert(`Membership fee of ${formatMoney(amount)} for ${month} paid successfully!`);
    }, 1200);
  };

  const dueLogs = logs.filter(l => l.status === 'Due' || l.status === 'Overdue');
  const paidLogs = logs.filter(l => l.status === 'Paid');

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Monthly Membership</h2>
        <p className="text-slate-500 text-xs mt-0.5">Maintain your active premium account status and secure backup guarantees</p>
      </div>

      {/* Membership State Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">Premium Status</span>
            <div className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Verified Account</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-xs font-semibold block uppercase">Membership Fee</span>
            <h2 className="text-3xl font-bold font-sans mt-0.5">₦1,000 <span className="text-sm text-slate-400 font-normal">/ month</span></h2>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            Standard flat rate covers card processor settlement clearances, automated SMS/email alerts, and continuous multi-device backups.
          </p>
        </div>
      </div>

      {/* Due Dues Section */}
      {dueLogs.length > 0 && (
        <div className="space-y-3">
          <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">Unpaid Dues ({dueLogs.length})</span>
          <div className="space-y-2">
            {dueLogs.map(log => (
              <div 
                key={log.month}
                className="bg-white p-4 rounded-2xl border border-red-100 bg-red-50/20 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{log.month} Membership Fee</h4>
                  <p className="text-[10px] text-red-600 font-medium mt-0.5 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>Due Date: {log.dueDate} ({log.status})</span>
                  </p>
                </div>

                <button
                  onClick={() => handlePayFee(log.month, log.amount)}
                  disabled={loading !== null}
                  className="px-4 py-2 bg-jolas-green-primary hover:bg-jolas-green-dark text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  id={`pay-member-btn-${log.month.replace(' ', '')}`}
                >
                  {loading === log.month ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <CreditCard size={12} />
                  )}
                  <span>Pay {formatMoney(log.amount)}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid Dues Logs */}
      <div className="space-y-3">
        <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">Receipt Ledger</span>
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-xs divide-y divide-slate-50 overflow-hidden">
          {paidLogs.map(log => (
            <div key={log.month} className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-jolas-green-primary/5 text-jolas-green-primary flex items-center justify-center">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{log.month} Clearance</h4>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Cleared on: {log.paidDate}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 block font-mono">{formatMoney(log.amount)}</span>
                <span className="text-[9px] font-extrabold text-jolas-green-primary uppercase tracking-widest bg-jolas-green-primary/5 px-2 py-0.5 rounded-full border border-jolas-green-primary/10 mt-1 inline-block">
                  Paid
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
