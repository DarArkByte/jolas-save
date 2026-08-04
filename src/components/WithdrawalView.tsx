import React, { useState } from 'react';
import { Landmark, ArrowLeft, ShieldAlert, CheckCircle2, ChevronRight, HelpCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavingsGoal, WithdrawalRequest } from '../types';

interface WithdrawalViewProps {
  goals: SavingsGoal[];
  linkedBank: { bankName: string; accountNumber: string; accountName: string };
  onWithdrawalRequest: (requestData: Partial<WithdrawalRequest>) => void;
  selectedGoalId?: string;
  withdrawalHistory: WithdrawalRequest[];
}

export const WithdrawalView: React.FC<WithdrawalViewProps> = ({
  goals,
  linkedBank,
  onWithdrawalRequest,
  selectedGoalId = '',
  withdrawalHistory
}) => {
  const [goalId, setGoalId] = useState(selectedGoalId || (goals[0]?.id || ''));
  const [amount, setAmount] = useState('100000');
  const [withdrawalType, setWithdrawalType] = useState<'Full' | 'Partial' | 'Early'>('Partial');
  const [reason, setReason] = useState('School fees payment');
  const [statusScreen, setStatusScreen] = useState(false);
  const [recentRequest, setRecentRequest] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedGoal = goals.find(g => g.id === goalId);
  const availableBalance = selectedGoal ? selectedGoal.amountSaved : 0;

  // Compute early break penalty
  const isGoalMatured = selectedGoal 
    ? new Date().getTime() >= new Date(selectedGoal.withdrawalDate).getTime() 
    : false;

  const penaltyFee = !isGoalMatured && (withdrawalType === 'Early' || withdrawalType === 'Full')
    ? Number(amount) * 0.05 // 5% early penalty break
    : 0;

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId) {
      setErrorMsg('Please select a savings goal plan');
      return;
    }
    const cleanAmount = Number(amount);
    if (!amount || cleanAmount <= 0) {
      setErrorMsg('Enter a valid amount');
      return;
    }
    if (cleanAmount > availableBalance) {
      setErrorMsg(`Insufficient funds. Your available balance is ${formatMoney(availableBalance)}`);
      return;
    }
    setErrorMsg('');

    const newRequest: Partial<WithdrawalRequest> = {
      id: 'wdr-gen-' + Math.floor(Math.random() * 90000 + 10000),
      goalId,
      goalName: selectedGoal?.name || 'Custom Goal',
      amount: cleanAmount,
      withdrawalType,
      reason,
      bankAccount: `${linkedBank.bankName} - ${linkedBank.accountNumber} (${linkedBank.accountName})`,
      date: new Date().toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      fee: penaltyFee
    };

    setRecentRequest(newRequest);
    onWithdrawalRequest(newRequest);
    setStatusScreen(true);
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-lg mx-auto">
      
      <AnimatePresence mode="wait">
        
        {/* REQUEST STATUS OUTCOME */}
        {statusScreen && recentRequest ? (
          <motion.div 
            key="status-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Request Submitted</h2>
            <p className="text-slate-500 text-xs mt-1 mb-6">
              Your withdrawal request has been submitted and is awaiting administrator verification.
            </p>

            <div className="bg-white rounded-3xl border border-slate-100 p-6 text-left shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Request Status:</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-100">
                  {recentRequest.status} Review
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Savings Goal:</span>
                  <span className="font-bold text-slate-800">{recentRequest.goalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested Payout:</span>
                  <span className="font-bold text-slate-800 font-mono">{formatMoney(recentRequest.amount)}</span>
                </div>
                {recentRequest.fee > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Early break fee (5%):</span>
                    <span className="font-mono">-{formatMoney(recentRequest.fee)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Settlement Payout:</span>
                  <span className="font-black text-emerald-600 font-mono">{formatMoney(recentRequest.amount - recentRequest.fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settlement Bank:</span>
                  <span className="font-bold text-slate-800 text-right">{recentRequest.bankAccount}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">What happens next?</span>
                <div className="flex gap-2.5 items-start text-xs text-slate-500">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                  <span>Compliance admins will audit your request and verify goal maturity rules.</span>
                </div>
                <div className="flex gap-2.5 items-start text-xs text-slate-500">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                  <span>Upon approval, the payment gateway initiates settlement to your linked bank account.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStatusScreen(false)}
              className="mt-6 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
              id="back-withdraw-form"
            >
              Back to Withdrawals
            </button>
          </motion.div>
        ) : (
          
          /* WITHDRAWAL FORM VIEW */
          <motion.div 
            key="withdrawal-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Request Withdrawal</h2>
              <p className="text-slate-500 text-xs mt-0.5">Liquidate matured plans or request early partial breaks</p>
            </div>

            <form onSubmit={handleSubmitRequest} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              
              {/* Select Goal */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Select Savings Goal Plan</label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm focus:border-emerald-500 focus:outline-hidden"
                  id="wdr-select-goal"
                >
                  <option value="">-- Choose target goal --</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name} (Saved: {formatMoney(goal.amountSaved)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Balance & Maturity Status Panel */}
              {selectedGoal && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150/40 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Available Balance in Goal:</span>
                    <strong className="text-slate-800 font-mono font-bold">{formatMoney(availableBalance)}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Safe Withdrawal Date:</span>
                    <strong className="text-slate-700 font-mono font-semibold">{selectedGoal.withdrawalDate}</strong>
                  </div>
                  
                  {isGoalMatured ? (
                    <div className="flex items-start gap-2 text-emerald-700 text-[11px] bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
                      <span>This plan has fully matured! You can perform a full or partial break without any penalty fee.</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-amber-700 text-[11px] bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <ShieldAlert size={16} className="shrink-0 text-amber-600 mt-0.5" />
                      <span>This goal plan has not matured yet. Early breaks will trigger a standard administrative fee (5% of the payout amount).</span>
                    </div>
                  )}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Amount to Withdraw (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm focus:border-emerald-500 focus:outline-hidden font-bold text-slate-800"
                  placeholder="e.g. 100000"
                  id="wdr-amount-input"
                />
              </div>

              {/* Withdrawal Types */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Withdrawal Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Partial', label: 'Partial', desc: 'Withdraw portion' },
                    { id: 'Full', label: 'Full Break', desc: 'Withdraw all' },
                    { id: 'Early', label: 'Early Break', desc: 'Break plan now' }
                  ].map(type => {
                    const isSelected = withdrawalType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setWithdrawalType(type.id as any)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50/50 font-bold text-emerald-700' 
                            : 'border-slate-150 hover:bg-slate-50/50 text-slate-600'
                        }`}
                        id={`wdr-type-${type.id}`}
                      >
                        <span className="block text-xs font-semibold">{type.label}</span>
                        <span className="block text-[9px] text-slate-400 font-normal mt-0.5">{type.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Reason for Withdrawal</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-hidden"
                  placeholder="e.g. School fees tuition installment payment"
                  id="wdr-reason-input"
                />
              </div>

              {/* Bank Account Preview */}
              <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Settlement Destination Account</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800">
                      {linkedBank.bankName} • {linkedBank.accountNumber}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Recipient: {linkedBank.accountName}</span>
                  </div>
                </div>
              </div>

              {errorMsg && <p className="text-rose-500 text-xs font-semibold">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/10 transition-all flex items-center justify-center gap-1.5 mt-4 cursor-pointer text-xs uppercase tracking-wide"
                id="wdr-submit-btn"
              >
                <span>Submit Withdrawal Request</span>
              </button>

              <div className="flex justify-center items-center gap-1.5 text-[9px] text-slate-400 font-semibold pt-1">
                <span>Compliance Note: Payout approvals typically process within 2-4 hours.</span>
              </div>
            </form>

            {/* Withdrawal Assistance */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <h3 className="font-sans font-bold text-xs text-slate-800 tracking-wider uppercase">Withdrawal Assistance</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                If you encounter any issues with maturity dates, early breaking fees, or bank transfers, please reach out directly to our support desk on WhatsApp.
              </p>
              <div className="pt-1.5">
                <a 
                  href="https://wa.me/2348037367585"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-extrabold hover:underline"
                >
                  <span>WhatsApp Help Desk: +234 803 736 7585</span>
                </a>
              </div>
            </div>

            {/* Historic Requests */}
            {withdrawalHistory.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3">
                <h3 className="font-sans font-bold text-xs text-slate-800 tracking-wider uppercase">Withdrawal Log &amp; Statuses</h3>
                <div className="divide-y divide-slate-100">
                  {withdrawalHistory.map(wdr => (
                    <div key={wdr.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{wdr.goalName}</h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{wdr.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold block text-rose-600">-{formatMoney(wdr.amount)}</span>
                        <span className={`inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          wdr.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : wdr.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                        }`}>
                          {wdr.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
