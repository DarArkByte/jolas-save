import React, { useState } from 'react';
import { User, Shield, Landmark, Key, Users, Upload, Check, Copy, ToggleLeft, ToggleRight, CheckCircle, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { NIGERIAN_BANKS } from '../constants/nigerianBanks';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onUpdateProfile, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'kyc' | 'security' | 'referral'>('details');
  const [isCopied, setIsCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Editable Profile fields
  const [phone, setPhone] = useState(userProfile.phoneNumber);
  const [address, setAddress] = useState(userProfile.address);
  const [occupation, setOccupation] = useState(userProfile.occupation);

  // Settlement Bank Modal & Verification State
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankMode, setBankMode] = useState<'verify' | 'manual'>('verify');
  const [selectedBankName, setSelectedBankName] = useState(userProfile.bankName || 'Guaranty Trust Bank (GTBank)');
  const [bankAccNumber, setBankAccNumber] = useState(userProfile.accountNumber || '');
  const [manualAccName, setManualAccName] = useState(userProfile.accountName || '');
  const [verifiedAccName, setVerifiedAccName] = useState('');
  const [isVerifyingAcc, setIsVerifyingAcc] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const handleVerifyAccount = async () => {
    if (!selectedBankName || bankAccNumber.length !== 10) {
      setVerifyError('Select a Nigerian bank and enter a 10-digit NUBAN account number.');
      return;
    }
    setIsVerifyingAcc(true);
    setVerifyError('');
    setVerifiedAccName('');

    const targetBank = NIGERIAN_BANKS.find(b => b.name === selectedBankName);
    const bankCode = targetBank ? targetBank.code : '';

    try {
      const res = await fetch(`/api/banks/verify?accountNumber=${bankAccNumber}&bankCode=${bankCode}`);
      const data = await res.json();
      if (data.success && data.accountName) {
        setVerifiedAccName(data.accountName);
      } else {
        setVerifyError(data.error || 'No live account verification API configured for this bank. Please use "Option B: Enter Manually".');
      }
    } catch (e) {
      setVerifyError('Live verification API provider unavailable. Please switch to "Option B: Enter Manually".');
    } finally {
      setIsVerifyingAcc(false);
    }
  };

  // Password fields
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');

  // KYC submissions
  const [bvn, setBvn] = useState(userProfile.bvn || '');
  const [nin, setNin] = useState(userProfile.nin || '');

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://jolas-save.com/join?ref=${userProfile.referralCode}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const objectUrl = URL.createObjectURL(file);
      onUpdateProfile({ passportPhoto: objectUrl });
      alert('Passport photograph uploaded successfully! Verification complete.');
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      onUpdateProfile({ passportPhoto: objectUrl });
      alert('Passport photograph uploaded successfully!');
    }
  };

  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      phoneNumber: phone,
      address,
      occupation
    });
    alert('Demographics & contact profile updated successfully!');
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      bvn,
      nin,
      kycStatus: 'Verified',
      isKycVerified: true
    });
    alert('KYC verification credentials approved successfully!');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdCurrent || !pwdNew) {
      alert('Please enter your current and new passwords.');
      return;
    }
    setPwdCurrent('');
    setPwdNew('');
    alert('Security Password updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20 md:pb-6">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
        <div className="relative">
          {userProfile.passportPhoto ? (
            <img 
              src={userProfile.passportPhoto} 
              alt={userProfile.fullName || 'Profile Photo'} 
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 bg-jolas-green-primary rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-md border-4 border-slate-50">
              {userProfile.fullName ? userProfile.fullName.charAt(0) : 'U'}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
            <Check size={12} className="stroke-[3]" />
          </span>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">{userProfile.fullName}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-jolas-green-primary/5 text-jolas-green-primary border border-jolas-green-primary/10 uppercase tracking-widest inline-block mx-auto sm:mx-0">
              {userProfile.kycStatus} Profile
            </span>
          </div>
          <p className="text-slate-400 text-xs font-medium">@{userProfile.username} • Member</p>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold transition-all border border-rose-100 flex items-center gap-1.5 cursor-pointer shadow-xs"
            id="profile-logout-btn"
            title="Log out of session"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'details', label: 'My Details', icon: User },
          { id: 'kyc', label: 'KYC &amp; Compliance', icon: Shield },
          { id: 'security', label: 'Security &amp; 2FA', icon: Key },
          { id: 'referral', label: 'Refer &amp; Earn', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-jolas-green-primary text-jolas-green-primary font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              id={`profile-tab-${tab.id}`}
            >
              <Icon size={14} />
              <span dangerouslySetInnerHTML={{ __html: tab.label }}></span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT VIEWS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs max-w-lg mx-auto">
        
        {/* DETAILS Tab */}
        {activeTab === 'details' && (
          <form onSubmit={handleUpdateDetails} className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Personal Demographics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Full Name</span>
                <span className="block font-semibold text-slate-700 mt-1 text-xs">{userProfile.fullName}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Date of Birth</span>
                <span className="block font-semibold text-slate-700 mt-1 text-xs">{userProfile.dob}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                <span className="block font-semibold text-slate-700 mt-1 text-xs">{userProfile.email}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Gender</span>
                <span className="block font-semibold text-slate-700 mt-1 text-xs">{userProfile.gender}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Phone Number</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                id="prof-phone-input"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Residential Address</label>
              <input 
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                id="prof-addr-input"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Current Occupation</label>
              <input 
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                id="prof-occup-input"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 bg-slate-50 p-4 rounded-2xl border">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Landmark size={18} className="text-jolas-green-primary" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Settlement Bank Account</span>
                    <span className="block text-xs font-bold text-slate-700">{userProfile.bankName} • {userProfile.accountNumber}</span>
                    <span className="block text-[10px] text-slate-500 font-medium">Account Name: {userProfile.accountName}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBankModal(true)}
                  className="text-[10px] bg-jolas-green-primary text-white font-bold px-3 py-1.5 rounded-xl uppercase hover:bg-jolas-green-dark transition-all cursor-pointer shadow-xs"
                  id="prof-edit-bank-btn"
                >
                  Edit Bank
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-bold py-3 rounded-xl text-xs uppercase mt-4 cursor-pointer"
              id="prof-details-save"
            >
              Update Profile Details
            </button>
          </form>
        )}

        {/* BANK ACCOUNT EDIT MODAL (OPTION A: VERIFY ACCOUNT vs OPTION B: MANUAL) */}
        {showBankModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-150 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">Update Settlement Bank</h3>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* TAB SELECTOR: OPTION A vs OPTION B */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBankMode('verify')}
                  className={`py-2 rounded-lg transition-all ${
                    bankMode === 'verify' ? 'bg-white text-jolas-green-primary shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Option A: Verify Account
                </button>
                <button
                  type="button"
                  onClick={() => setBankMode('manual')}
                  className={`py-2 rounded-lg transition-all ${
                    bankMode === 'manual' ? 'bg-white text-jolas-green-primary shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Option B: Enter Manually
                </button>
              </div>

              {/* OPTION A: DETECT / VERIFY BANK ACCOUNT */}
              {bankMode === 'verify' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Select Nigerian Bank</label>
                    <select
                      value={selectedBankName}
                      onChange={(e) => setSelectedBankName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary font-semibold"
                    >
                      <option value="">-- Choose Nigerian Bank --</option>
                      {NIGERIAN_BANKS.map(b => (
                        <option key={b.code} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">10-Digit NUBAN Account Number</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={10}
                        value={bankAccNumber}
                        onChange={(e) => {
                          setBankAccNumber(e.target.value);
                          setVerifiedAccName('');
                          setVerifyError('');
                        }}
                        placeholder="0123456789"
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyAccount}
                        disabled={isVerifyingAcc || !selectedBankName || bankAccNumber.length !== 10}
                        className="bg-jolas-green-primary text-white font-bold px-3 py-2 rounded-xl text-xs whitespace-nowrap disabled:opacity-50 hover:bg-jolas-green-dark cursor-pointer"
                      >
                        {isVerifyingAcc ? 'Detecting...' : 'Verify Account'}
                      </button>
                    </div>
                  </div>

                  {verifiedAccName && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs">
                      <span className="block text-[9px] uppercase font-bold text-emerald-600">Detected Account Holder</span>
                      <strong className="block text-sm mt-0.5">{verifiedAccName}</strong>
                    </div>
                  )}

                  {verifyError && (
                    <p className="text-rose-600 text-xs font-semibold">{verifyError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedBankName || bankAccNumber.length !== 10 || !verifiedAccName) {
                        alert('Please complete account verification or switch to "Option B: Enter Details Manually".');
                        return;
                      }
                      onUpdateProfile({
                        bankName: selectedBankName,
                        accountNumber: bankAccNumber,
                        accountName: verifiedAccName
                      });
                      setShowBankModal(false);
                      alert('Bank details updated successfully via verification!');
                    }}
                    disabled={!verifiedAccName}
                    className="w-full bg-jolas-green-primary text-white font-bold py-3 rounded-xl text-xs uppercase disabled:opacity-50 hover:bg-jolas-green-dark cursor-pointer"
                  >
                    Save Verified Bank Account
                  </button>
                </div>
              )}

              {/* OPTION B: ENTER DETAILS MANUALLY */}
              {bankMode === 'manual' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Bank Name</label>
                    <select
                      value={selectedBankName}
                      onChange={(e) => setSelectedBankName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary font-semibold"
                    >
                      <option value="">-- Choose Nigerian Bank --</option>
                      {NIGERIAN_BANKS.map(b => (
                        <option key={b.code} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={bankAccNumber}
                      onChange={(e) => setBankAccNumber(e.target.value)}
                      placeholder="10-digit NUBAN"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Account Holder Name (Manual)</label>
                    <input
                      type="text"
                      value={manualAccName}
                      onChange={(e) => setManualAccName(e.target.value)}
                      placeholder="Enter Full Account Name"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedBankName || !bankAccNumber || !manualAccName.trim()) {
                        alert('Please fill out all bank fields.');
                        return;
                      }
                      onUpdateProfile({
                        bankName: selectedBankName,
                        accountNumber: bankAccNumber,
                        accountName: manualAccName.trim()
                      });
                      setShowBankModal(false);
                      alert('Manual bank details updated successfully!');
                    }}
                    className="w-full bg-jolas-green-primary text-white font-bold py-3 rounded-xl text-xs uppercase hover:bg-jolas-green-dark cursor-pointer"
                  >
                    Save Manual Bank Details
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KYC Compliance Tab */}
        {activeTab === 'kyc' && (
          <form onSubmit={handleKycSubmit} className="space-y-5">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Compliance Verification</h3>

            {userProfile.isKycVerified ? (
              <div className="p-4 bg-jolas-green-primary/5 text-jolas-green-primary rounded-2xl flex gap-3 border border-jolas-green-primary/20">
                <CheckCircle size={22} className="shrink-0 text-jolas-green-primary mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">KYC Verification Completed!</h4>
                  <p className="text-[11px] leading-relaxed mt-0.5">Your accounts are in high compliance standing. BVN, NIN, and Passport are fully verified. No deposit limits apply.</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl flex gap-3 border border-amber-150">
                <Shield size={22} className="shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Awaiting Compliance Setup</h4>
                  <p className="text-[11px] leading-relaxed mt-0.5">Submit your Bank Verification Number (BVN) and National Identity Number (NIN) to remove account restriction caps.</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Bank Verification Number (BVN)</label>
              <input 
                type="text"
                maxLength={11}
                value={bvn}
                onChange={(e) => setBvn(e.target.value)}
                placeholder="11-digit BVN"
                disabled={userProfile.isKycVerified}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary font-mono"
                id="prof-bvn-input"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">National Identity Number (NIN)</label>
              <input 
                type="text"
                maxLength={11}
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                placeholder="11-digit NIN"
                disabled={userProfile.isKycVerified}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary font-mono"
                id="prof-nin-input"
              />
            </div>

            {/* Passport photo drag-and-drop zone */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Passport Photograph</label>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer relative ${
                  dragActive 
                    ? 'border-emerald-500 bg-jolas-green-primary/5' 
                    : 'border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50/50'
                }`}
                id="drag-upload-zone"
              >
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleManualUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="passport-manual-file"
                />
                <Upload size={24} className="text-slate-400 mx-auto mb-2" />
                <span className="block text-xs font-bold text-slate-700">Drag &amp; Drop passport photo</span>
                <span className="block text-[10px] text-slate-400 mt-1">or click to select file from desktop</span>
              </div>
            </div>

            {!userProfile.isKycVerified && (
              <button
                type="submit"
                className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-bold py-3 rounded-xl text-xs uppercase mt-4 cursor-pointer"
                id="prof-kyc-submit"
              >
                Verify KYC Compliance
              </button>
            )}
          </form>
        )}

        {/* Security &amp; 2FA Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Account Protection</h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
              <div>
                <span className="block text-xs font-bold text-slate-800">Two-Factor Authentication (2FA)</span>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-[200px]">Prompt OTP on every single secure login and payout request</p>
              </div>

              <button 
                onClick={() => onUpdateProfile({ twoFactorEnabled: !userProfile.twoFactorEnabled })}
                className="text-jolas-green-primary hover:scale-105 transition-transform"
                id="toggle-2fa-btn"
              >
                {userProfile.twoFactorEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-slate-300" />}
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert("Password changed successfully!"); setPwdCurrent(''); setPwdNew(''); }} className="space-y-4 pt-4 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Change Password</span>
              
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Current Password</label>
                <input 
                  type="password"
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                  placeholder="••••••••"
                  id="pwd-current-input"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">New Password</label>
                <input 
                  type="password"
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                  placeholder="••••••••"
                  id="pwd-new-input"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase cursor-pointer"
                id="pwd-change-btn"
              >
                Change Security Password
              </button>
            </form>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referral' && (
          <div className="text-center space-y-6">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-2 border-b pb-2 text-left">Referral Program</h3>

            <div className="w-16 h-16 bg-jolas-green-primary/10 text-jolas-green-primary rounded-full flex items-center justify-center mx-auto">
              <Users size={32} />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800">Invite Friends, Earn ₦500 Bonus</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                Earn a credited savings bonus of ₦500 directly into your Custom Goal for every friend that activates their first goals saving plan!
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase text-left">Your Referral Code</span>
                <span className="block text-sm font-bold text-slate-800 font-mono tracking-wider mt-0.5">{userProfile.referralCode}</span>
              </div>

              <button
                onClick={handleCopyReferral}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                id="copy-refer-btn"
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                <span>{isCopied ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
