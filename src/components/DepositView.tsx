import React, { useState } from 'react';
import { 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  ArrowLeft, 
  Upload, 
  Clock, 
  Ban, 
  CheckCircle, 
  FileText, 
  Info,
  ExternalLink,
  QrCode,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavingsGoal, DepositRequest, DepositRequestStatus } from '../types';
import { CustomProgressBar, Receipt } from './UIComponents';

interface DepositViewProps {
  goals: SavingsGoal[];
  depositRequests: DepositRequest[];
  onCreateDepositRequest: (req: DepositRequest) => void;
  onUpdateDepositRequestStatus: (reqId: string, status: DepositRequestStatus, proofUrl?: string, notes?: string) => void;
  userProfile: any;
  onViewReceipt: (tx: any) => void;
  onNavigateToGoals?: () => void;
}

// Modular payment architecture configuration for future expansion
// This interface defines how automated gateways can be plugged in later
interface PaymentGatewayConfig {
  id: string;
  name: string;
  isEnabled: boolean;
  apiKeyEnvVar: string;
}

export const DepositView: React.FC<DepositViewProps> = ({
  goals,
  depositRequests,
  onCreateDepositRequest,
  onUpdateDepositRequestStatus,
  userProfile,
  onViewReceipt,
  onNavigateToGoals
}) => {
  const userGoals = goals.filter(g => g.username === userProfile.username);
  const [goalId, setGoalId] = useState('');
  const [amount, setAmount] = useState('50000');
  const [currentStep, setCurrentStep] = useState<'form' | 'instructions'>('form');
  const [activeRequest, setActiveRequest] = useState<DepositRequest | null>(null);
  const [uploadingProofId, setUploadingProofId] = useState<string | null>(null);
  const [simulatedProof, setSimulatedProof] = useState<string>('');
  const [customerNote, setCustomerNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Future-proofing: Configuration for modular payment architecture (Paystack, Flutterwave, etc.)
  const paymentGateways: PaymentGatewayConfig[] = [
    { id: 'paystack', name: 'Paystack Automated Checkout', isEnabled: false, apiKeyEnvVar: 'PAYSTACK_SECRET_KEY' },
    { id: 'flutterwave', name: 'Flutterwave Card/USSD API', isEnabled: false, apiKeyEnvVar: 'FLUTTERWAVE_SECRET_KEY' },
    { id: 'moniepoint', name: 'Moniepoint Virtual Accounts', isEnabled: false, apiKeyEnvVar: 'MONIEPOINT_API_KEY' }
  ];

  const selectedGoal = goals.find(g => g.id === goalId);
  const progress = selectedGoal ? (selectedGoal.amountSaved / selectedGoal.targetAmount) * 100 : 0;

  // Format Nigerian Naira
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(val);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId) {
      setErrorMsg('Please select a savings goal first');
      return;
    }
    const cleanAmount = Number(amount);
    // Client-side duplicate check
    const existingPending = depositRequests.find(r => 
      (r.customerUsername === userProfile.username || r.customerId === userProfile.username) &&
      r.goalId === goalId &&
      (r.status === 'Pending' || r.status === DepositRequestStatus.PENDING || r.status === DepositRequestStatus.WAITING_WHATSAPP)
    );
    if (existingPending) {
      setErrorMsg(`You already have an active pending deposit request (${existingPending.id}) for this goal. Please wait for Admin confirmation or process that ticket.`);
      return;
    }

    setErrorMsg('');

    // Generate Request ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const requestId = `JS-2026-${randomNum}`;

    const newRequest: DepositRequest = {
      id: requestId,
      customerId: userProfile.username,
      customerName: userProfile.fullName,
      customerPhone: userProfile.phoneNumber,
      customerUsername: userProfile.username,
      goalId: goalId,
      goalName: selectedGoal?.name || 'Custom Goal',
      amount: cleanAmount,
      createdAt: `${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`,
      status: DepositRequestStatus.PENDING,
      auditLog: [
        {
          action: 'Deposit Request Submitted',
          actor: userProfile.fullName,
          timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    onCreateDepositRequest(newRequest);
    setActiveRequest(newRequest);
    setCurrentStep('instructions');
  };

  // Helper to build WhatsApp Message Link
  const getWhatsAppLink = (req: DepositRequest) => {
    const message = `Hello JOLAS SAVE Team,

I would like to make a savings deposit.

Deposit Request ID:
${req.id}

Customer Name:
${req.customerName}

Username:
${req.customerUsername || userProfile.username}

Registered Phone:
${req.customerPhone}

Savings Goal:
${req.goalName}

Deposit Amount:
₦${req.amount.toLocaleString()}

----------------------------------------
INSTRUCTION FOR PAYMENT:
After making payment to our account, I will send my payment receipt together with this Deposit Request ID (${req.id}) to this WhatsApp support chat for verification.
----------------------------------------

Please send me the approved bank account details for payment.

Thank you.`;

    return `https://wa.me/2348037367585?text=${encodeURIComponent(message)}`;
  };

  const handleContinueToWhatsApp = () => {
    if (!activeRequest) return;
    
    // Open WhatsApp in a new window/tab
    window.open(getWhatsAppLink(activeRequest), '_blank');

    // Update status to Waiting for WhatsApp Contact
    onUpdateDepositRequestStatus(activeRequest.id, DepositRequestStatus.WAITING_WHATSAPP);
    
    // Auto progress to next logical status simulation
    const updated = {
      ...activeRequest,
      status: DepositRequestStatus.WAITING_WHATSAPP
    };
    setActiveRequest(updated);
  };

  const handleSimulatePaymentSent = () => {
    if (!activeRequest) return;
    onUpdateDepositRequestStatus(activeRequest.id, DepositRequestStatus.AWAITING_TRANSFER);
    setActiveRequest(prev => prev ? { ...prev, status: DepositRequestStatus.AWAITING_TRANSFER } : null);
  };

  const handleUploadProof = (reqId: string) => {
    setUploadingProofId(reqId);
    setSimulatedProof('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300'); // prefilled high fidelity sample bank transfer receipt image
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingProofId) return;

    onUpdateDepositRequestStatus(
      uploadingProofId, 
      DepositRequestStatus.AWAITING_VERIFICATION, 
      simulatedProof, 
      customerNote || 'Sent bank transfer payment proof'
    );

    setUploadingProofId(null);
    setSimulatedProof('');
    setCustomerNote('');
    
    if (activeRequest && activeRequest.id === uploadingProofId) {
      setActiveRequest(prev => prev ? { 
        ...prev, 
        status: DepositRequestStatus.AWAITING_VERIFICATION,
        proofOfPaymentUrl: simulatedProof,
        notes: customerNote
      } : null);
    }
  };

  // Filter requests to show only current user's requests
  const userRequests = depositRequests.filter(req => 
    (req.customerId && req.customerId === userProfile.username) ||
    (req.customerUsername && req.customerUsername === userProfile.username)
  );

  // Status Badge styling helper
  const getStatusBadge = (status: DepositRequestStatus) => {
    switch (status) {
      case DepositRequestStatus.DRAFT:
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case DepositRequestStatus.WAITING_WHATSAPP:
        return 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse';
      case DepositRequestStatus.AWAITING_TRANSFER:
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case DepositRequestStatus.AWAITING_VERIFICATION:
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case DepositRequestStatus.VERIFIED:
        return 'bg-jolas-green-primary/5 text-jolas-green-primary border-jolas-green-primary/10';
      case DepositRequestStatus.CREDITED:
        return 'bg-jolas-green-primary text-white border-transparent';
      case DepositRequestStatus.REJECTED:
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case DepositRequestStatus.CANCELLED:
        return 'bg-slate-150 text-slate-500 border-transparent';
      default:
        return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-2xl mx-auto">
      
      {/* Dynamic Header Banner */}
      <div className="bg-amber-50/60 border border-amber-150/50 p-4.5 rounded-2xl flex items-start gap-3">
        <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed font-medium">
          <strong>Deposits are manually verified for your security.</strong> Your savings balance will be updated securely after your payment has been confirmed by our financial desk.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'form' ? (
          <motion.div 
            key="deposit-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Make Secure Deposit</h2>
              <p className="text-slate-500 text-xs mt-0.5">Initialize a manual bank transfer request secured via WhatsApp support</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Form / Empty State */}
              {userGoals.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs md:col-span-2 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield size={28} className="text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">No Goals Found</h3>
                  <p className="text-slate-455 text-xs max-w-xs mx-auto leading-relaxed">You have no active savings goals yet. You must create a savings goal first before making a deposit.</p>
                  <button 
                    type="button"
                    onClick={onNavigateToGoals}
                    className="px-6 py-3 bg-jolas-green-primary hover:bg-jolas-green-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                    id="no-goals-deposit-btn"
                  >
                    Create Savings Goal
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateRequest} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 md:col-span-2">
                  {/* Select Goal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Select Savings Goal</label>
                    <select
                      value={goalId}
                      onChange={(e) => setGoalId(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      id="dep-select-goal"
                    >
                      <option value="">-- Choose savings goal --</option>
                      {userGoals.map(goal => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name} (Target: {formatMoney(goal.targetAmount)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Goal progress preview */}
                  {selectedGoal && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150/40 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Available Balance in Goal:</span>
                        <span className="text-jolas-green-primary font-bold font-mono">{formatMoney(selectedGoal.amountSaved)}</span>
                      </div>
                      <CustomProgressBar percentage={progress} />
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                        <span>{Math.round(progress)}% Complete</span>
                        <span>Remaining: {formatMoney(selectedGoal.targetAmount - selectedGoal.amountSaved)}</span>
                      </div>
                    </div>
                  )}

                  {/* Deposit Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Deposit Amount (₦)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm focus:border-jolas-green-primary focus:outline-hidden font-bold text-slate-800"
                      placeholder="e.g. 50000"
                      id="dep-amount-input"
                    />
                  </div>

                  {errorMsg && <p className="text-rose-500 text-xs font-semibold">{errorMsg}</p>}

                  <button
                    type="submit"
                    className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-bold py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                    id="request-instructions-btn"
                  >
                    <span>Request Deposit Instructions</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className="flex justify-center items-center gap-1.5 text-[10px] text-slate-400 font-semibold pt-1">
                    <Shield size={12} className="text-jolas-green-primary" />
                    <span>Verified Safe and Manual Settlement Vault</span>
                  </div>
                </form>
              )}

              {/* Right Column: Information Flow Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-slate-850 uppercase tracking-wider border-b pb-2">How Deposits Work</h3>
                
                <ol className="space-y-3.5">
                  {[
                    { step: 1, text: 'Request deposit instructions.' },
                    { step: 2, text: 'Chat with JOLAS SAVE on WhatsApp.' },
                    { step: 3, text: 'Receive the official payment account.' },
                    { step: 4, text: 'Transfer your money.' },
                    { step: 5, text: 'Send your payment receipt.' },
                    { step: 6, text: 'Your payment will be verified.' },
                    { step: 7, text: 'Your savings balance will be updated after approval.' }
                  ].map(item => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-jolas-green-primary/5 border border-jolas-green-primary/10 text-jolas-green-primary rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <span className="text-[11px] text-slate-600 leading-normal font-medium">{item.text}</span>
                    </li>
                  ))}
                </ol>

                {/* Security Notice */}
                <div className="p-3 bg-amber-50/75 border border-amber-200/60 rounded-2xl flex items-start gap-2 text-[10px] text-amber-800 leading-relaxed font-semibold">
                  <Shield size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    For your security, all deposits are manually verified before they are credited to your savings account.
                  </p>
                </div>

                {/* Official Support Line */}
                <div className="pt-3 border-t border-slate-100 space-y-1">
                  <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Official Channel</span>
                  <a 
                    href="https://wa.me/2348037367585"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-jolas-green-primary font-extrabold hover:underline"
                  >
                    <span>WhatsApp: +234 803 736 7585</span>
                  </a>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* STEP 2: SHOW GENERATED INSTRUCTIONS & WHATSAPP REDIRECT */
          <motion.div 
            key="deposit-instructions"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentStep('form')}
                className="p-1.5 hover:bg-slate-150 rounded-full text-slate-500 transition-colors"
                id="back-to-deposit-form-btn"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">Deposit Request Generated</h2>
                <p className="text-slate-500 text-[10px]">Your deposit instruction ticket is ready for verification</p>
              </div>
            </div>

            {activeRequest && (
              <div className="space-y-5">
                <div className="p-4 bg-jolas-green-primary/5/50 border border-jolas-green-primary/10 rounded-2xl flex flex-col items-center text-center space-y-1.5">
                  <span className="text-[10px] text-jolas-green-primary font-extrabold uppercase tracking-widest font-mono">Unique Request ID</span>
                  <h3 className="text-xl font-mono font-extrabold text-jolas-green-primary tracking-wider">
                    {activeRequest.id}
                  </h3>
                  <div className="text-xs text-slate-600 font-medium pt-1">
                    Amount: <strong className="text-slate-800 text-sm font-mono">{formatMoney(activeRequest.amount)}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Goal: <strong className="text-slate-700">{activeRequest.goalName}</strong>
                  </div>
                </div>

                {/* Pre-filled Message Preview */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-600">WhatsApp Message Preview</span>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150/40 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed select-all">
                    Hello JOLAS SAVE Team,

I would like to make a savings deposit.

<strong>Deposit Request ID:</strong>
{activeRequest.id}

<strong>Customer Name:</strong>
{activeRequest.customerName}

<strong>Username:</strong>
{activeRequest.customerUsername || userProfile.username}

<strong>Registered Phone:</strong>
{activeRequest.customerPhone}

<strong>Savings Goal:</strong>
{activeRequest.goalName}

<strong>Deposit Amount:</strong>
₦{activeRequest.amount.toLocaleString()}

Please send me the approved bank account details for payment.

Thank you.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleContinueToWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-bold py-3.5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="continue-to-whatsapp-btn"
                  >
                    <Phone size={16} />
                    <span>Continue to WhatsApp</span>
                  </button>

                  <div className="text-center">
                    <span className="text-[11px] text-slate-400">Or did you already make the transfer?</span>
                    <button
                      onClick={handleSimulatePaymentSent}
                      className="text-[11px] font-bold text-jolas-green-primary hover:underline block mx-auto mt-1"
                      id="simulate-transfer-sent-btn"
                    >
                      Simulate "Bank Transfer Done" {"\u2192"} Upload Proof of Payment
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border text-xs text-slate-600 leading-relaxed space-y-2">
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Info size={14} className="text-jolas-green-primary" />
                    <span>Next Steps</span>
                  </h4>
                  <p>1. Tap the green <strong>Continue to WhatsApp</strong> button to request bank accounts from our agents.</p>
                  <p>2. Complete the bank transfer and send the receipt back on WhatsApp or upload it below.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP SIMULATION MODAL FOR UPLOADING PAYMENT PROOF */}
      <AnimatePresence>
        {uploadingProofId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-sm text-slate-800">Submit Payment Evidence</h3>
                <button 
                  onClick={() => { setUploadingProofId(null); setSimulatedProof(''); }} 
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                  id="close-upload-modal"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center space-y-2">
                  {simulatedProof ? (
                    <div className="space-y-2">
                      <div className="w-20 h-20 bg-jolas-green-primary/10 text-jolas-green-primary rounded-lg flex items-center justify-center mx-auto text-xs font-bold uppercase font-mono border border-jolas-green-primary/20">
                        Receipt.jpg
                      </div>
                      <span className="text-[10px] text-jolas-green-primary font-semibold block">Simulated Transfer Evidence Selected ✅</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-slate-400" />
                      <div>
                        <span className="block text-xs font-bold text-slate-700">Drag &amp; drop transfer receipt</span>
                        <span className="text-[9px] text-slate-400">PDF, JPG, PNG up to 5MB</span>
                      </div>
                    </>
                  )}
                  <button 
                    type="button"
                    onClick={() => setSimulatedProof('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300')}
                    className="mt-2 text-[10px] font-bold text-jolas-green-primary hover:underline bg-white border px-3 py-1.5 rounded-lg"
                    id="simulate-file-btn"
                  >
                    Select Simulated Receipt Image
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Audit Notes / Comments</label>
                  <textarea
                    rows={2}
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                    placeholder="e.g. Paid from Chinaza John's GTBank account to Jolas Save Zenith"
                    id="proof-note-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!simulatedProof}
                  className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                  id="submit-proof-btn"
                >
                  Upload &amp; Notify Support
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RECENT DEPOSIT REQUESTS HISTORIC LOG SECTION */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Your Deposit Tickets</h3>
            <p className="text-[10px] text-slate-400">Track and manage your deposit verification history</p>
          </div>
          <span className="text-[10px] bg-slate-50 border px-2.5 py-1 rounded-full text-slate-600 font-bold font-mono">
            {userRequests.length} Total
          </span>
        </div>

        {userRequests.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {userRequests.map(req => (
              <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded-sm">
                      {req.id}
                    </span>
                    <strong className="text-slate-800 text-xs font-mono">{formatMoney(req.amount)}</strong>
                  </div>
                  {/* Deposit Timeline */}
                  <div className="flex items-center gap-1 mt-1.5 text-[9px] font-semibold text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-emerald-600 font-bold">Submitted ✓</span>
                    <span className="text-slate-300">→</span>
                    <span className={req.status === 'Pending' || req.status === DepositRequestStatus.PENDING ? 'text-amber-600 font-extrabold animate-pulse' : 'text-slate-400'}>
                      {req.status === 'Pending' || req.status === DepositRequestStatus.PENDING ? 'Pending Confirmation ⏳' : 'Confirmed'}
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className={req.status === 'Credited' || req.status === DepositRequestStatus.CREDITED ? 'text-emerald-600 font-extrabold' : req.status === 'Rejected' || req.status === 'Declined' || req.status === DepositRequestStatus.REJECTED ? 'text-rose-600 font-extrabold' : 'text-slate-400'}>
                      {req.status === 'Credited' || req.status === DepositRequestStatus.CREDITED ? 'Credited ✓' : req.status === 'Rejected' || req.status === 'Declined' || req.status === DepositRequestStatus.REJECTED ? 'Rejected ✕' : 'Credited'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>

                  {/* Context Actions depending on Status */}
                  {req.status === DepositRequestStatus.DRAFT && (
                    <button
                      onClick={() => { setActiveRequest(req); setCurrentStep('instructions'); }}
                      className="px-2.5 py-1 bg-jolas-green-primary/5 hover:bg-jolas-green-primary/10 text-jolas-green-primary rounded-lg text-[10px] font-bold"
                      id={`actions-draft-${req.id}`}
                    >
                      Complete Request
                    </button>
                  )}

                  {req.status === DepositRequestStatus.WAITING_WHATSAPP && (
                    <button
                      onClick={() => { setActiveRequest(req); setCurrentStep('instructions'); }}
                      className="px-2.5 py-1 bg-jolas-green-primary/5 hover:bg-jolas-green-primary/10 text-jolas-green-primary rounded-lg text-[10px] font-bold"
                      id={`actions-whatsapp-${req.id}`}
                    >
                      View Link
                    </button>
                  )}

                  {req.status === DepositRequestStatus.AWAITING_TRANSFER && (
                    <button
                      onClick={() => handleUploadProof(req.id)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      id={`actions-upload-${req.id}`}
                    >
                      <Upload size={10} />
                      <span>Upload Receipt</span>
                    </button>
                  )}

                  {req.status === DepositRequestStatus.CREDITED && (
                    <button
                      onClick={() => {
                        // Generate a pseudo transaction object to pass to the Receipt viewer
                        const tx: any = {
                          id: req.id,
                          receiptNumber: req.receiptNumber || 'RCPT_MANUAL_' + req.id.split('-')[2],
                          transactionId: 'TXN_' + req.id.split('-')[2] + '194',
                          goalName: req.goalName,
                          amount: req.amount,
                          date: req.createdAt.split(' - ')[0],
                          time: req.createdAt.split(' - ')[1] || '12:00 PM',
                          paymentMethod: 'Manual Bank Transfer',
                          balanceAfter: req.amount, // simulated
                          type: 'Deposit',
                          status: 'Successful',
                          customerName: req.customerName,
                          approvedBy: req.approvedBy || 'Admin'
                        };
                        onViewReceipt(tx);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border rounded-lg text-[10px] font-bold flex items-center gap-1"
                      id={`actions-receipt-${req.id}`}
                    >
                      <FileText size={10} />
                      <span>View Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-1">
            <p className="text-slate-400 text-xs">No deposit requests created yet.</p>
            <p className="text-[10px] text-slate-400 leading-normal">Your manual savings request tickets will show up here.</p>
          </div>
        )}
      </div>

    </div>
  );
};
