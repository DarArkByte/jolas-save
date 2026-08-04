import React, { useState } from 'react';
import { Mail, Lock, Phone, User, MapPin, Briefcase, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, UserRole } from '../types';
import { JolasLogo } from './JolasLogo';
import { InforgeBaaS } from '../lib/inforge';
import { NIGERIAN_BANKS } from '../constants/nigerianBanks';

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", 
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", 
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT (Abuja)"
];

interface AuthFlowProps {
  onAuthSuccess: (profile: UserProfile, role: 'Customer' | 'Admin' | 'Super Admin') => void;
  onBackToMarketing: () => void;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthSuccess, onBackToMarketing }) => {
  const [screen, setScreen] = useState<'login' | 'register' | 'register_part2' | 'otp' | 'forgot' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(59);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    dob: '',
    gender: 'Male',
    address: '',
    state: 'Lagos',
    lga: '',
    occupation: '',
    nextOfKinName: '',
    nextOfKinRelationship: 'Brother',
    nextOfKinPhone: '',
    bankName: 'GTBank',
    accountNumber: '',
    accountName: '',
    bvn: '',
    nin: '',
    referredBy: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validatePart1 = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Full Name is required';
    if (!formData.username.trim()) tempErrors.username = 'Username is required';
    if (!formData.email.includes('@')) tempErrors.email = 'Enter a valid email address';
    if (formData.phoneNumber.length < 10) tempErrors.phoneNumber = 'Enter a valid phone number';
    if (formData.password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validatePart2 = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.dob) tempErrors.dob = 'Date of birth is required';
    if (!formData.gender) tempErrors.gender = 'Gender is required';
    if (!formData.address.trim()) tempErrors.address = 'Residential address is required';
    if (!formData.state) tempErrors.state = 'State is required';
    if (!formData.lga.trim()) tempErrors.lga = 'LGA is required';
    if (!formData.occupation.trim()) tempErrors.occupation = 'Occupation is required';
    if (!formData.nextOfKinName.trim()) tempErrors.nextOfKinName = 'Next of Kin name is required';
    if (!formData.nextOfKinPhone.trim()) tempErrors.nextOfKinPhone = 'Next of Kin phone number is required';
    if (!formData.bankName) tempErrors.bankName = 'Bank name is required';
    if (formData.accountNumber.length !== 10) tempErrors.accountNumber = 'Account number must be 10 digits';
    if (!formData.accountName.trim()) tempErrors.accountName = 'Account name is required';
    if (!formData.agreeToTerms) tempErrors.agreeToTerms = 'You must agree to the Terms of Service';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegisterNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePart1()) {
      setScreen('register_part2');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePart2()) return;

    // Prepare complete profile
    const userProfile: UserProfile = {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      dob: formData.dob,
      gender: formData.gender,
      address: formData.address,
      state: formData.state,
      lga: formData.lga,
      occupation: formData.occupation,
      passportPhoto: formData.passportPhoto,
      nextOfKin: {
        name: formData.nextOfKinName,
        relationship: formData.nextOfKinRelationship,
        phoneNumber: formData.nextOfKinPhone
      },
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      bvn: formData.bvn,
      nin: formData.nin,
      referralCode: 'JOLAS-' + formData.username.toUpperCase(),
      referredBy: formData.referredBy || undefined,
      isKycVerified: true,
      kycStatus: 'Verified',
      twoFactorEnabled: false,
      status: 'Active'
    };

    // Register with Inforge auth service & MySQL database
    const regResult = await InforgeBaaS.auth.register(userProfile, formData.password, UserRole.CUSTOMER);
    if (regResult.success && regResult.user) {
      onAuthSuccess(regResult.user, 'Customer');
    } else {
      setErrors({ agreeToTerms: regResult.error || 'Failed to complete registration. Please try logging in directly.' });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};
    if (!formData.email) tempErrors.email = 'Username or email is required';
    if (!formData.password) tempErrors.password = 'Password is required';
    
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    // Call Inforge Authentication API (now async, awaits MySQL response)
    const res = await InforgeBaaS.auth.login(formData.email, formData.password);
    if (res.success && res.user) {
      const userRole = res.user.role;
      let onAuthRole: 'Customer' | 'Admin' | 'Super Admin' = 'Customer';
      if (userRole === UserRole.ADMIN) onAuthRole = 'Admin';
      else if (userRole === UserRole.SUPER_ADMIN) onAuthRole = 'Super Admin';
      
      onAuthSuccess(res.user, onAuthRole);
    } else {
      setErrors({ email: res.error || 'Authentication rejected. Verify your Jolas security credentials.' });
    }
  };

  const startOtpCountdown = () => {
    setOtpTimer(59);
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otpCode];
    newOtp[index] = val.slice(-1);
    setOtpCode(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpCode.join('');
    if (enteredCode.length < 4) {
      setErrors({ otp: 'Please enter any complete 4-digit code (e.g., 1234)' });
      return;
    }

    // Prepare complete profile
    const userProfile: UserProfile = {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      dob: formData.dob,
      gender: formData.gender,
      address: formData.address,
      state: formData.state,
      lga: formData.lga,
      occupation: formData.occupation,
      passportPhoto: formData.passportPhoto,
      nextOfKin: {
        name: formData.nextOfKinName,
        relationship: formData.nextOfKinRelationship,
        phoneNumber: formData.nextOfKinPhone
      },
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      bvn: formData.bvn,
      nin: formData.nin,
      referralCode: 'JOLAS-' + formData.username.toUpperCase(),
      referredBy: formData.referredBy || undefined,
      isKycVerified: true,
      kycStatus: 'Verified',
      twoFactorEnabled: false,
      status: 'Active'
    };

    // Register with Inforge auth service & MySQL database
    const regResult = await InforgeBaaS.auth.register(userProfile, formData.password, UserRole.CUSTOMER);
    if (regResult.success && regResult.user) {
      onAuthSuccess(regResult.user, 'Customer');
    } else {
      setErrors({ otp: regResult.error || 'Failed to complete registration. Please try logging in directly.' });
    }
  };

  return (
    <div className="min-h-screen bg-jolas-bg flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Back to marketing */}
      <button 
        onClick={onBackToMarketing}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs transition-all"
        id="back-home-btn"
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-2">
        <JolasLogo variant="full" size={100} showTagline={true} />
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-[20px] shadow-xl border border-jolas-border">
          
          {/* LOGIN SCREEN */}
          {screen === 'login' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">Welcome Back</h2>
              <p className="text-slate-500 text-sm text-center mt-1">Access your secure savings dashboard</p>



              <form onSubmit={handleLoginSubmit} className="space-y-4 mt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email / Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail size={16} />
                    </span>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="e.g. chinazajohn@gmail.com"
                      id="login-email"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="••••••••"
                      id="login-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input type="checkbox" className="rounded-sm accent-jolas-green-primary" defaultChecked />
                    <span>Remember Me</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setScreen('forgot')} 
                    className="text-jolas-green-primary hover:underline font-semibold"
                    id="forgot-pwd-btn"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-semibold py-3.5 rounded-[14px] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
                  id="login-submit-btn"
                >
                  <span>Secure Login</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                <span>New to JOLAS SAVE? </span>
                <button 
                  onClick={() => { setErrors({}); setScreen('register'); }} 
                  className="text-jolas-green-primary font-bold hover:underline"
                  id="goto-register"
                >
                  Create Secure Account
                </button>
              </div>
            </motion.div>
          )}

          {/* REGISTER PART 1 */}
          {screen === 'register' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">Create Secure Account</h2>
              <p className="text-slate-500 text-sm text-center mt-1">Step 1 of 2: Basic credentials</p>

              <form onSubmit={handleRegisterNext} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10 w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="e.g. Chinaza John"
                      id="reg-fullname"
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="chinazajohn"
                      id="reg-username"
                    />
                    {errors.username && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.username}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="08031234567"
                      id="reg-phone"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phoneNumber}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="chinazajohn@gmail.com"
                      id="reg-email"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="••••••••"
                      id="reg-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="••••••••"
                      id="reg-confirmpassword"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-semibold py-3.5 rounded-[14px] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
                  id="reg-next-btn"
                >
                  <span>Continue to Step 2</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                <span>Already have an account? </span>
                <button 
                  onClick={() => { setErrors({}); setScreen('login'); }} 
                  className="text-jolas-green-primary font-bold hover:underline"
                  id="reg-goto-login"
                >
                  Secure Log In
                </button>
              </div>
            </motion.div>
          )}

          {/* REGISTER PART 2 */}
          {screen === 'register_part2' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setScreen('register')} 
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
                  id="reg-back-part1"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">KYC &amp; Banking Details</h2>
              </div>
              <p className="text-slate-500 text-xs mb-6">Step 2 of 2: Security compliance verification</p>

              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      id="reg-dob"
                    />
                    {errors.dob && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.dob}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      id="reg-gender"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.gender}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Residential Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <MapPin size={16} />
                    </span>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="pl-10 w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="e.g. Block B2, Chevron Drive, Lekki"
                      id="reg-address"
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      id="reg-state"
                    >
                      <option value="">Select State</option>
                      {NIGERIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">LGA</label>
                    <input
                      type="text"
                      name="lga"
                      value={formData.lga}
                      onChange={handleInputChange}
                      className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="e.g. Eti-Osa"
                      id="reg-lga"
                    />
                    {errors.lga && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.lga}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Occupation</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Briefcase size={16} />
                    </span>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="pl-10 w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="Software Engineer"
                      id="reg-occupation"
                    />
                  </div>
                  {errors.occupation && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.occupation}</p>}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-[14px] border border-slate-150 space-y-3">
                  <span className="block text-xs font-bold text-slate-700 tracking-wide uppercase">Next of Kin Details</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="nextOfKinName"
                        value={formData.nextOfKinName}
                        onChange={handleInputChange}
                        className="w-full rounded-[14px] border border-slate-200 p-2 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                        placeholder="Obinna John"
                        id="reg-nok-name"
                      />
                      {errors.nextOfKinName && <p className="text-red-500 text-[10px] font-semibold">{errors.nextOfKinName}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Relationship</label>
                      <input
                        type="text"
                        name="nextOfKinRelationship"
                        value={formData.nextOfKinRelationship}
                        onChange={handleInputChange}
                        className="w-full rounded-[14px] border border-slate-200 p-2 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                        placeholder="Brother"
                        id="reg-nok-rel"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="nextOfKinPhone"
                      value={formData.nextOfKinPhone}
                      onChange={handleInputChange}
                      className="w-full rounded-[14px] border border-slate-200 p-2 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                      placeholder="08039876543"
                      id="reg-nok-phone"
                    />
                    {errors.nextOfKinPhone && <p className="text-red-500 text-[10px] font-semibold">{errors.nextOfKinPhone}</p>}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-[14px] border border-slate-150 space-y-3">
                  <span className="block text-xs font-bold text-slate-700 tracking-wide uppercase">Settlement Bank Account</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Bank Name</label>
                      <select
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="w-full rounded-[14px] border border-slate-200 p-2 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                        id="reg-bank-name"
                      >
                        <option value="">Select Bank</option>
                        {NIGERIAN_BANKS.map(b => (
                          <option key={b.code} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                      {errors.bankName && <p className="text-red-500 text-[10px] font-semibold">{errors.bankName}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        className="w-full rounded-[14px] border border-slate-200 p-2 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                        placeholder="10-digit number"
                        id="reg-bank-accnum"
                      />
                      {errors.accountNumber && <p className="text-red-500 text-[10px] font-semibold">{errors.accountNumber}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Account Name</label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      className="w-full rounded-[14px] border border-slate-200 p-2 text-xs focus:outline-hidden focus:border-jolas-green-primary"
                      placeholder="Chinaza John"
                      id="reg-bank-accname"
                    />
                    {errors.accountName && <p className="text-red-500 text-[10px] font-semibold">{errors.accountName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">BVN <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      name="bvn"
                      value={formData.bvn}
                      onChange={handleInputChange}
                      className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden font-mono"
                      placeholder="11-digit BVN"
                      id="reg-bvn"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">NIN <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      name="nin"
                      value={formData.nin}
                      onChange={handleInputChange}
                      className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden font-mono"
                      placeholder="11-digit NIN"
                      id="reg-nin"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Referral Code <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleInputChange}
                    className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden font-mono"
                    placeholder="e.g. JOLAS-CHINAZA"
                    id="reg-referredby"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-0.5 rounded-sm accent-jolas-green-primary"
                      id="reg-agree"
                    />
                    <span>
                      I agree to the JOLAS SAVE Terms of Service, Privacy Policy, and understand a monthly ₦1,000 fee applies.
                    </span>
                  </label>
                  {errors.agreeToTerms && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.agreeToTerms}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-semibold py-3.5 rounded-[14px] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-4 cursor-pointer"
                  id="reg-submit-btn"
                >
                  <ShieldCheck size={18} />
                  <span>Complete Registration</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* OTP VERIFICATION */}
          {screen === 'otp' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="w-16 h-16 bg-jolas-green-primary/10 text-jolas-green-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Enter OTP Code</h2>
              <p className="text-slate-500 text-sm mt-1 mb-6">
                We sent a secure One-Time Password to <strong className="text-slate-700">{formData.phoneNumber || 'your phone number'}</strong>
              </p>

              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div className="flex justify-center gap-4">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          const prevInput = document.getElementById(`otp-input-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-14 h-14 rounded-[14px] border-2 border-slate-200 text-center text-xl font-bold text-slate-800 focus:border-jolas-green-primary focus:outline-hidden"
                    />
                  ))}
                </div>
                {errors.otp && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.otp}</p>}

                <div className="text-xs text-slate-500">
                  {otpTimer > 0 ? (
                    <span>Resend OTP in <strong className="text-slate-700">{otpTimer}s</strong></span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={startOtpCountdown} 
                      className="text-jolas-green-primary font-bold hover:underline"
                    >
                      Resend Code Now
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setScreen('login')}
                    className="w-full py-3 border border-slate-200 text-slate-600 rounded-[14px] font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-semibold py-3 rounded-[14px] shadow-md transition-all text-sm cursor-pointer"
                  >
                    Verify &amp; Enter
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* FORGOT PASSWORD */}
          {screen === 'forgot' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">Reset Secure Key</h2>
              <p className="text-slate-500 text-sm text-center mt-1 mb-6">
                Enter your registered email below to receive an OTP verification link
              </p>

              <form onSubmit={(e) => { e.preventDefault(); setScreen('reset'); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Registered Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      className="pl-10 w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                      placeholder="e.g. chinazajohn@gmail.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-semibold py-3.5 rounded-[14px] shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span>Send Recovery Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScreen('login')}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold text-center mt-2"
                >
                  Back to Log In
                </button>
              </form>
            </motion.div>
          )}

          {/* RESET PASSWORD */}
          {screen === 'reset' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">Setup New Password</h2>
              <p className="text-slate-500 text-sm text-center mt-1 mb-6">Choose a strong, non-reused password</p>

              <form onSubmit={(e) => { e.preventDefault(); alert("Password reset successful! Please login."); setScreen('login'); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-[14px] border border-slate-200 p-3 text-sm focus:border-jolas-green-primary focus:outline-hidden"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-jolas-green-primary hover:bg-jolas-green-dark text-white font-semibold py-3.5 rounded-[14px] shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span>Update Password</span>
                </button>
              </form>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
