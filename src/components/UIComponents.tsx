import React from 'react';
import { X, Check, AlertTriangle, Info, Download, Share2, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction } from '../types';
import { JolasLogoIcon } from './JolasLogo';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white rounded-[20px] shadow-2xl overflow-hidden border border-jolas-border max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-jolas-bg/50">
          <h3 className="font-sans font-semibold text-lg text-slate-800 tracking-tight">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-500 transition-colors"
            id="close-modal-btn"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 text-slate-700">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  backgroundColorClass?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 64,
  strokeWidth = 6,
  colorClass = 'text-jolas-green-primary',
  backgroundColorClass = 'text-slate-100'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className={backgroundColorClass}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${colorClass} transition-all duration-500 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute font-mono text-xs font-bold text-slate-800">
        {Math.round(percentage)}%
      </span>
    </div>
  );
};

export const CustomProgressBar: React.FC<{ percentage: number; colorClass?: string }> = ({ 
  percentage, 
  colorClass = 'bg-jolas-green-primary' 
}) => {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <motion.div 
        className={`h-full rounded-full ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};

export const Receipt: React.FC<{ transaction: Transaction; onClose?: () => void }> = ({ transaction, onClose }) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amount);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="bg-white p-4 rounded-[20px] border border-jolas-border shadow-xs max-w-md mx-auto">
      <div className="border-2 border-dashed border-slate-200 rounded-[14px] p-6 relative overflow-hidden bg-jolas-bg/40">
        {/* Top visual circle cuts */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-slate-200"></div>
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-slate-200"></div>
        
        {/* Header */}
        <div className="text-center pb-6 border-b-2 border-dashed border-slate-200">
          <div className="flex justify-center mb-3">
            <JolasLogoIcon size={52} />
          </div>
          <h4 className="font-sans font-bold text-slate-800 text-lg uppercase tracking-wider">Transaction Receipt</h4>
          <p className="text-jolas-green-primary font-sans font-semibold text-[10px] mt-0.5">JOLAS SAVE • Save Today... Secure Tomorrow</p>
        </div>

        {/* Amount Section */}
        <div className="text-center py-6">
          <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold block mb-1">Transaction Amount</span>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight font-sans">
            {formatMoney(transaction.amount)}
          </h2>
          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-jolas-green-primary/10 text-jolas-green-primary font-semibold border border-jolas-green-primary/20">
            {transaction.status}
          </span>
        </div>

        {/* Receipt Details */}
        <div className="space-y-3.5 text-xs pb-6 border-b-2 border-dashed border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Receipt Number</span>
            <span className="font-mono text-slate-700 font-bold">{transaction.receiptNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Transaction ID</span>
            <span className="font-mono text-slate-700 font-medium">{transaction.transactionId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Customer Name</span>
            <span className="text-slate-700 font-semibold">{transaction.customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Category/Goal</span>
            <span className="text-slate-700 font-semibold">{transaction.goalName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Date &amp; Time</span>
            <span className="text-slate-700 font-medium">{transaction.date} • {transaction.time}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Payment Method</span>
            <span className="text-slate-700 font-semibold">{transaction.paymentMethod}</span>
          </div>
          {transaction.type === 'Deposit' && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Balance After Deposit</span>
              <span className="text-slate-800 font-bold">{formatMoney(transaction.balanceAfter)}</span>
            </div>
          )}
        </div>

        {/* QR Code and Info */}
        <div className="pt-6 flex flex-col items-center justify-center text-center">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs mb-3">
            {/* Mock QR Code */}
            <svg width="84" height="84" viewBox="0 0 100 100" className="text-slate-800">
              <rect width="100" height="100" fill="white" />
              {/* Outer Position Finders */}
              <rect x="5" y="5" width="25" height="25" fill="currentColor" />
              <rect x="9" y="9" width="17" height="17" fill="white" />
              <rect x="13" y="13" width="9" height="9" fill="currentColor" />

              <rect x="70" y="5" width="25" height="25" fill="currentColor" />
              <rect x="74" y="9" width="17" height="17" fill="white" />
              <rect x="78" y="13" width="9" height="9" fill="currentColor" />

              <rect x="5" y="70" width="25" height="25" fill="currentColor" />
              <rect x="9" y="74" width="17" height="17" fill="white" />
              <rect x="13" y="78" width="9" height="9" fill="currentColor" />

              {/* Random QR block markers to look extremely authentic */}
              <rect x="40" y="10" width="5" height="15" fill="currentColor" />
              <rect x="50" y="5" width="10" height="5" fill="currentColor" />
              <rect x="45" y="25" width="15" height="5" fill="currentColor" />
              <rect x="10" y="40" width="15" height="10" fill="currentColor" />
              <rect x="20" y="55" width="5" height="5" fill="currentColor" />
              <rect x="35" y="35" width="20" height="5" fill="currentColor" />
              <rect x="65" y="45" width="5" height="20" fill="currentColor" />
              <rect x="45" y="55" width="10" height="15" fill="currentColor" />
              <rect x="75" y="75" width="15" height="15" fill="currentColor" />
              <rect x="80" y="40" width="10" height="10" fill="currentColor" />
              <rect x="60" y="75" width="10" height="5" fill="currentColor" />
              <rect x="35" y="80" width="15" height="10" fill="currentColor" />
            </svg>
          </div>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider mb-1">SECURE TRANSACTION VERIFIED</span>
          <div className="flex items-center gap-1 text-[10px] text-jolas-green-primary font-semibold">
            <Shield size={12} />
            <span>NDIC Insured • Secured with 256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button 
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-[14px] text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          id="dl-pdf-btn"
        >
          <Download size={14} />
          <span>Download PDF</span>
        </button>
        <button 
          onClick={() => alert("Receipt share link copied to clipboard!")}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-[14px] text-xs font-semibold bg-jolas-green-primary text-white hover:bg-jolas-green-dark transition-colors"
          id="share-rcpt-btn"
        >
          <Share2 size={14} />
          <span>Share Receipt</span>
        </button>
      </div>
      
      {onClose && (
        <button 
          onClick={onClose}
          className="mt-3 w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-medium text-center"
          id="close-rcpt-btn"
        >
          Close View
        </button>
      )}
    </div>
  );
};
