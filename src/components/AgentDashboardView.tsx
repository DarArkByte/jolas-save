import React, { useState } from 'react';
import { 
  Users, 
  ArrowUpRight, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Upload, 
  ChevronRight, 
  ExternalLink,
  Lock,
  UserPlus,
  Zap,
  TrendingUp,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, DepositRequest, DepositRequestStatus } from '../types';
import { JolasLogoIcon } from './JolasLogo';

interface AgentDashboardViewProps {
  depositRequests: DepositRequest[];
  onVerifyDepositRequest: (reqId: string, action: 'verify' | 'credit' | 'reject', notes?: string) => void;
  usersList: UserProfile[];
  agentCanCredit: boolean; // Managed by Super Admin
  userProfile: any;
}

export const AgentDashboardView: React.FC<AgentDashboardViewProps> = ({
  depositRequests,
  onVerifyDepositRequest,
  usersList,
  agentCanCredit,
  userProfile
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'assigned' | 'deposits' | 'performance'>('assigned');
  const [searchQuery, setSearchQuery] = useState('');
  const [agentNote, setAgentNote] = useState('');
  const [activeNoteReqId, setActiveNoteReqId] = useState<string | null>(null);

  // Filter assigned customers dynamically based on SQLite relationship
  const assignedCustomers = usersList.filter(u => u.assignedAgentUsername === userProfile.username);

  // Agent performance statistics
  const verifiedCount = depositRequests.filter(
    r => r.status === DepositRequestStatus.CREDITED && r.approvedBy?.includes('Agent')
  ).length;

  const pendingCount = depositRequests.filter(
    r => r.status === DepositRequestStatus.AWAITING_VERIFICATION
  ).length;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    const message = `Hello ${name}, JOLAS SAVE Agent here. I am happy to assist you with your savings deposit instruction. Kindly let me know if you are ready to make a transfer.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {activeSubTab === 'assigned' && (
        <>
          {/* Agent Banner Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-jolas-green-primary/5 rounded-2xl">
                <JolasLogoIcon size={44} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-jolas-green-primary font-mono text-[10px] tracking-wider uppercase font-bold">
                  <Zap size={12} className="animate-pulse" />
                  <span>Authorized Agent Console</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight leading-none mt-0.5">Agent Field Office</h2>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full border flex items-center gap-1.5">
                <span>Role: <strong className="text-jolas-green-primary">Jolas Field Agent</strong></span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              </div>
              <span className="text-[8px] font-bold uppercase text-slate-500 tracking-wider">JOLAS SAVE • Field Verification</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Assigned Customers</span>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{assignedCustomers.length} Users</h3>
              <span className="text-slate-400 text-[9px] mt-2 block font-mono">Assigned by Back-office</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pending Verifications</span>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount} Tickets</h3>
              <span className="text-slate-400 text-[9px] mt-2 block font-mono">Requires attention</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Agent Permission</span>
              <div className="flex items-center gap-1.5 mt-1">
                <h3 className={`text-sm font-extrabold ${agentCanCredit ? 'text-jolas-green-primary' : 'text-slate-500'}`}>
                  {agentCanCredit ? 'CREDIT GRANTED' : 'RECOMMEND ONLY'}
                </h3>
                <span className={`w-2 h-2 rounded-full ${agentCanCredit ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              </div>
              <span className="text-slate-400 text-[9px] mt-1.5 block leading-normal italic">Controlled by Super Admin</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Your Cleared Value</span>
              <h3 className="text-2xl font-extrabold text-jolas-green-primary mt-1">{formatMoney(verifiedCount * 50000)}</h3>
              <span className="text-slate-400 text-[9px] mt-2 block font-mono">{verifiedCount} manual credits</span>
            </div>
          </div>

          {/* Restricted Module Warning for Agents */}
          <div className="p-4 bg-slate-50 border rounded-2xl flex items-start gap-3">
            <Lock size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-700">Agent Role Restrictions (RBAC Policy)</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                Agents do not have authorization to: delete customers, change membership fees, view platform system logs/revenues, or manage administrators. Attempting to access these modules will trigger an audit alert.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pb-1">
        {[
          { id: 'assigned', label: `My Customers (${assignedCustomers.length})`, icon: Users },
          { id: 'deposits', label: `Deposit Requests (${pendingCount})`, icon: ArrowUpRight },
          { id: 'performance', label: 'Performance & Commissions', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === tab.id
                  ? 'border-jolas-green-primary text-jolas-green-primary font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              id={`agent-tab-${tab.id}`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
        
        {/* TAB 1: ASSIGNED CUSTOMERS */}
        {activeSubTab === 'assigned' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Assigned Customers Portfolio</h3>
              <p className="text-[10px] text-slate-400">Directly assist and coordinate deposits via WhatsApp channels</p>
            </div>

            <div className="divide-y divide-slate-100">
              {assignedCustomers.map((user, idx) => (
                <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 border uppercase">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{user.fullName}</h4>
                      <p className="text-[10px] text-slate-400">@{user.username} &bull; {user.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getWhatsAppLink(user.phoneNumber, user.fullName)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-[#25D366] hover:bg-[#20ba56] text-white text-[10px] font-bold rounded-xl flex items-center gap-1 transition-all"
                    >
                      <MessageSquare size={12} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DEPOSIT VERIFICATION */}
        {activeSubTab === 'deposits' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Deposits Needing Verification</h3>
                <p className="text-[10px] text-slate-400">Upload payment receipts, recommend approval, or credit client goals</p>
              </div>
            </div>

            {depositRequests.length > 0 ? (
              <div className="divide-y divide-slate-150">
                {depositRequests.map(req => (
                  <div key={req.id} className="py-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-100 text-slate-700 border font-mono font-bold px-1.5 py-0.5 rounded-sm">
                            {req.id}
                          </span>
                          <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${
                            req.status === DepositRequestStatus.AWAITING_VERIFICATION 
                              ? 'bg-purple-50 text-purple-700 border-purple-100 animate-pulse'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800">
                          {formatMoney(req.amount)} &bull; Goal: <span className="text-jolas-green-primary">{req.goalName}</span>
                        </h4>

                        <p className="text-[10px] text-slate-500 font-medium">
                          Customer: <strong className="text-slate-700">{req.customerName}</strong> (@{req.customerUsername})
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {req.status === DepositRequestStatus.AWAITING_VERIFICATION && (
                          <>
                            <button
                              onClick={() => onVerifyDepositRequest(req.id, 'reject', agentNote)}
                              className="px-2.5 py-1.5 border border-red-200 text-red-600 bg-red-50/10 hover:bg-red-50 text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Reject Payment
                            </button>

                            {agentCanCredit ? (
                              <button
                                onClick={() => {
                                  onVerifyDepositRequest(req.id, 'credit', `${agentNote} (Credited by Field Agent)`);
                                  setAgentNote('');
                                  setActiveNoteReqId(null);
                                }}
                                className="px-3 py-1.5 bg-jolas-green-primary hover:bg-jolas-green-dark text-white text-[10px] font-bold rounded-lg cursor-pointer"
                              >
                                Credit Account
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  onVerifyDepositRequest(req.id, 'verify', `${agentNote} (Recommended by Field Agent)`);
                                  setAgentNote('');
                                  setActiveNoteReqId(null);
                                  alert('Recommended successfully! Admin has been notified to complete the final credit.');
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                              >
                                Recommend Approval
                              </button>
                            )}
                          </>
                        )}

                        {activeNoteReqId === req.id ? (
                          <button
                            onClick={() => { setActiveNoteReqId(null); setAgentNote(''); }}
                            className="text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                          >
                            Cancel Note
                          </button>
                        ) : (
                          <button
                            onClick={() => { setActiveNoteReqId(req.id); setAgentNote(req.notes || ''); }}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border text-slate-600 text-[10px] font-bold rounded-lg"
                          >
                            {req.notes ? 'Edit Notes' : 'Add Field Note'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Agent Notes Input area */}
                    {activeNoteReqId === req.id && (
                      <div className="p-3 bg-slate-50 border rounded-xl space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-600">Field Auditor Note</label>
                        <textarea
                          value={agentNote}
                          onChange={(e) => setAgentNote(e.target.value)}
                          rows={2}
                          placeholder="Type customer transfer confirmation details..."
                          className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* Show Evidence */}
                    {req.proofOfPaymentUrl && (
                      <div className="p-3 bg-slate-50 rounded-xl border text-xs flex justify-between items-center">
                        <span className="text-slate-600">Payment receipt uploaded by client</span>
                        <a 
                          href={req.proofOfPaymentUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-jolas-green-primary font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Review Evidence</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle size={32} className="text-jolas-green-primary mx-auto mb-2" />
                <p className="text-slate-400 text-xs">No pending manual deposits tickets.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PERFORMANCE AND HISTORY */}
        {activeSubTab === 'performance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">My Field Performance</h3>
              <p className="text-[10px] text-slate-400 font-mono">Commission-earning audit tracking</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-jolas-green-primary/5/40 rounded-2xl border border-jolas-green-primary/10 space-y-1.5">
                <span className="text-[10px] text-jolas-green-primary font-bold uppercase tracking-wider">Manual Verification Accuracy</span>
                <h4 className="text-3xl font-extrabold text-jolas-green-primary">100%</h4>
                <p className="text-[10px] text-slate-500">Every single transfer was confirmed and settled without error.</p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Field Commissions</span>
                <h4 className="text-3xl font-extrabold text-slate-800">{formatMoney(verifiedCount * 250)}</h4>
                <p className="text-[10px] text-slate-500">₦250 bonus earned per validated manual deposit request.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
