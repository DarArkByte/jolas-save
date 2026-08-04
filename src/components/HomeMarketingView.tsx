import React, { useState, useEffect } from 'react';
import { 
  Target, ShieldCheck, TrendingUp, Sparkles, ChevronRight, Shield, 
  ArrowRight, Phone, Mail, Globe, Clock, ChevronDown, ChevronUp, Star,
  Menu, X, Laptop, ArrowDown, HelpCircle, FileText, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JolasLogo } from './JolasLogo';

interface HomeMarketingViewProps {
  onGetStarted: () => void;
  onAdminLogin: (role: 'Customer' | 'Agent' | 'Admin' | 'Super Admin') => void;
}

export const HomeMarketingView: React.FC<HomeMarketingViewProps> = ({
  onGetStarted,
  onAdminLogin
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sandboxExpanded, setSandboxExpanded] = useState(false);

  // Testimonial Carousel State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Calculator State
  const [calcAmount, setCalcAmount] = useState(20000);
  const [calcMonths, setCalcMonths] = useState(12);
  const [calcFrequency, setCalcFrequency] = useState<'Weekly' | 'Monthly'>('Monthly');

  // Listen to scroll to update header bg
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const testimonials = [
    {
      name: "Chioma E.",
      location: "Lagos",
      text: "Jolas Save has helped me stay consistent with my savings. Their support is amazing!",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Tunde A.",
      location: "Abuja",
      text: "The manual verification gives me confidence. My money is always secure.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Blessing N.",
      location: "Port Harcourt",
      text: "I love how easy it is to track my progress. Highly recommended!",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
    }
  ];

  const faqs = [
    {
      q: "How do I save with JOLAS SAVE?",
      a: "Simply sign up, create a savings goal with your desired target and frequency, and request a deposit. You can save weekly, monthly, or on a custom schedule."
    },
    {
      q: "How do deposits work?",
      a: "Create a deposit request on your dashboard to generate a unique Request ID. Click the redirect button to continue to our WhatsApp support, where you will receive the official secure bank details. Transfer the funds and share your receipt. Our agents will credit your dashboard immediately."
    },
    {
      q: "Can I withdraw early?",
      a: "Yes, JOLAS SAVE allows early withdrawals. However, depending on your savings plan, early withdrawals prior to your set goal date may attract a standard transaction convenience fee."
    },
    {
      q: "How long does verification take?",
      a: "Deposits are manually verified and typically approved within 5 to 30 minutes of sending your proof of payment on WhatsApp during official support hours."
    },
    {
      q: "How do I contact support?",
      a: "You can reach us directly via WhatsApp at +234 803 736 7585 or email support@jolas.com.ng. Our support hours are Monday to Saturday, 8:00 AM to 6:00 PM."
    },
    {
      q: "Is my information secure?",
      a: "Absolutely. JOLAS SAVE uses 256-bit cryptography and dynamic transaction PINs to safeguard all record logs and protect account accessibility."
    }
  ];

  const categories = [
    { name: "House Rent", icon: "🏠" },
    { name: "School Fees", icon: "📚" },
    { name: "Shop Rent", icon: "🏪" },
    { name: "Business Capital", icon: "💼" },
    { name: "Land Purchase", icon: "🌍" },
    { name: "Building Project", icon: "🏗️" },
    { name: "Vehicle Purchase", icon: "🚘" },
    { name: "Medical Bills", icon: "🏥" },
    { name: "Wedding", icon: "💍" },
    { name: "Travel", icon: "✈️" },
    { name: "Emergency Fund", icon: "🚨" },
    { name: "Children's Education", icon: "🧑‍🎓" },
    { name: "Custom Goal", icon: "🎯" }
  ];

  const totalDeposited = calcFrequency === 'Weekly' 
    ? calcAmount * Math.floor(calcMonths * 4.33) 
    : calcAmount * calcMonths;
  const yieldInterest = totalDeposited * (0.10 * (calcMonths / 12));
  const totalPayout = totalDeposited + yieldInterest;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1B1B1B] font-sans antialiased overflow-x-hidden relative">
      
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 w-full z-45 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3.5' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <JolasLogo variant="horizontal" size={32} showTagline={false} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-bold text-[#1B1B1B]/80">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#0B6E4F] transition-colors cursor-pointer">Home</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-[#0B6E4F] transition-colors cursor-pointer">About</button>
            <button onClick={() => scrollToSection('plans')} className="hover:text-[#0B6E4F] transition-colors cursor-pointer">Savings Plans</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#0B6E4F] transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection('faqs')} className="hover:text-[#0B6E4F] transition-colors cursor-pointer">FAQs</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-[#0B6E4F] transition-colors cursor-pointer">Contact</button>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="px-5 py-2 border border-[#0B6E4F] text-[#0B6E4F] font-bold text-xs rounded-xl hover:bg-[#0B6E4F]/5 transition-all cursor-pointer"
            >
              Login
            </button>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2.5 bg-[#0B6E4F] hover:bg-[#084F39] text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Hamburger Menu Icon */}
          <button className="md:hidden text-[#1B1B1B] cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-4 shadow-lg"
            >
              <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} className="text-left py-1 text-sm font-semibold hover:text-[#0B6E4F]">Home</button>
              <button onClick={() => scrollToSection('about')} className="text-left py-1 text-sm font-semibold hover:text-[#0B6E4F]">About</button>
              <button onClick={() => scrollToSection('plans')} className="text-left py-1 text-sm font-semibold hover:text-[#0B6E4F]">Savings Plans</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left py-1 text-sm font-semibold hover:text-[#0B6E4F]">How It Works</button>
              <button onClick={() => scrollToSection('faqs')} className="text-left py-1 text-sm font-semibold hover:text-[#0B6E4F]">FAQs</button>
              <button onClick={() => scrollToSection('contact')} className="text-left py-1 text-sm font-semibold hover:text-[#0B6E4F]">Contact</button>
              
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={onGetStarted}
                  className="w-full py-2.5 border border-[#0B6E4F] text-[#0B6E4F] font-bold text-xs rounded-xl text-center"
                >
                  Login
                </button>
                <button 
                  onClick={onGetStarted}
                  className="w-full py-2.5 bg-[#0B6E4F] text-white font-bold text-xs rounded-xl text-center"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side Info */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-[#1B1B1B]">
              Build Your Future<br />
              <span className="text-[#0B6E4F]">One Deposit at a Time.</span>
            </h1>
            <p className="text-[#1B1B1B]/70 text-sm sm:text-base leading-relaxed max-w-xl">
              Save securely for rent, school fees, business, emergencies, travel, weddings, and more. Track your progress, receive digital receipts, and achieve your financial goals with confidence.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onGetStarted}
              className="px-7 py-3.5 bg-[#0B6E4F] hover:bg-[#084F39] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              Start Saving →
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="px-7 py-3.5 border border-[#1B1B1B]/20 hover:border-[#1B1B1B]/55 text-[#1B1B1B] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              How It Works ⚙️
            </button>
          </div>

          {/* Quick trust badges */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1B1B1B]/10 max-w-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1B1B1B]/80">
              <ShieldCheck size={16} className="text-[#0B6E4F]" />
              <span>Secure Savings</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1B1B1B]/80">
              <CheckCircle2 size={16} className="text-[#0B6E4F]" />
              <span>Manual Deposit Verification</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1B1B1B]/80">
              <FileText size={16} className="text-[#0B6E4F]" />
              <span>Transparent Records</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1B1B1B]/80">
              <Phone size={16} className="text-[#0B6E4F]" />
              <span>WhatsApp Support</span>
            </div>
          </div>

          {/* WhatsApp Direct link */}
          <div className="pt-2">
            <a 
              href="https://wa.me/2348037367585" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>WhatsApp: +234 803 736 7585</span>
            </a>
          </div>
        </div>

        {/* Right Side Phone Mockup & Floating Cards */}
        <div className="lg:col-span-6 flex justify-center items-center relative py-10 w-full">
          
          {/* Decorative radial glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#0B6E4F]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Premium Mobile Frame */}
          <div className="w-[280px] h-[560px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 relative z-10 flex flex-col justify-between overflow-hidden">
            {/* Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20 flex justify-center items-center">
              <div className="w-3 h-3 bg-slate-900 rounded-full mr-2"></div>
              <div className="w-10 h-1 bg-slate-900 rounded-full"></div>
            </div>

            {/* Simulated UI App Body */}
            <div className="bg-[#0B0F19] flex-1 rounded-[38px] overflow-hidden p-4 flex flex-col space-y-4 pt-8 text-left">
              {/* Header inside mockup */}
              <div className="flex justify-between items-center text-white">
                <div>
                  <span className="text-[9px] text-slate-400 block">Good Morning,</span>
                  <span className="text-[12px] font-extrabold">John Doe</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">🧑</div>
              </div>

              {/* Balance Card */}
              <div className="bg-[#0B6E4F] p-4 rounded-2xl text-white space-y-1 shadow-md">
                <span className="text-[8px] uppercase tracking-wider text-white/70 font-bold block">Total Savings Balance</span>
                <span className="text-xl font-black block font-mono">₦245,600.00</span>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[8px] text-white/80 font-bold">
                  <div>
                    <span className="block text-white/50 text-[7px]">Total Goals</span>
                    <span>8 Goals</span>
                  </div>
                  <div>
                    <span className="block text-white/50 text-[7px]">Active Plans</span>
                    <span>5 Plans</span>
                  </div>
                </div>
              </div>

              {/* Savings Progress widget */}
              <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl text-white space-y-1">
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span>Savings Progress</span>
                  <span className="text-[#D4AF37]">75% Completed</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-[#0B6E4F] rounded-full"></div>
                </div>
              </div>

              {/* Recent Transactions lists */}
              <div className="space-y-2 flex-1">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Recent Activity</span>
                <div className="space-y-1.5 text-[9px]">
                  <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded-xl border border-slate-800/40 text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">📥</span>
                      <div>
                        <span className="block font-bold">Deposit Credited</span>
                        <span className="text-[7px] text-slate-400">House Rent Goal</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">+₦50,000</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded-xl border border-slate-800/40 text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">⏳</span>
                      <div>
                        <span className="block font-bold">Deposit Request</span>
                        <span className="text-[7px] text-slate-400">School Fees</span>
                      </div>
                    </div>
                    <span className="font-bold text-yellow-400">₦25,000</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded-xl border border-slate-800/40 text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-500">📤</span>
                      <div>
                        <span className="block font-bold">Withdrawal Approved</span>
                        <span className="text-[7px] text-slate-400">Business Capital</span>
                      </div>
                    </div>
                    <span className="font-bold text-rose-450">-₦30,000</span>
                  </div>
                </div>
              </div>

              {/* Bottom mockup nav */}
              <div className="pt-2 border-t border-slate-850 flex justify-around text-slate-500 text-[8px]">
                <div className="flex flex-col items-center text-[#0B6E4F]"><span className="text-[10px]">🏠</span><span>Home</span></div>
                <div className="flex flex-col items-center"><span className="text-[10px]">🎯</span><span>Goals</span></div>
                <div className="flex flex-col items-center"><span className="text-[10px]">📥</span><span>Deposit</span></div>
                <div className="flex flex-col items-center"><span className="text-[10px]">👤</span><span>Profile</span></div>
              </div>

            </div>
          </div>

          {/* FLOATING STATUS CARDS */}
          {/* Card 1: Deposit Successful */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-12 left-[-15px] sm:left-[20px] bg-white p-3.5 rounded-2xl shadow-xl border border-emerald-500/10 flex items-center gap-2.5 z-20 max-w-[170px] text-left"
          >
            <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">✔️</div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400">Deposit Success</span>
              <span className="block text-xs font-black text-slate-800">₦50,000</span>
              <span className="block text-[7px] text-slate-400">Today, 10:30 AM</span>
            </div>
          </motion.div>

          {/* Card 2: Goal 75% Completed */}
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute bottom-24 left-[-10px] sm:left-[35px] bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 z-20 max-w-[170px] text-left"
          >
            <div className="w-7 h-7 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center text-xs font-bold">🏠</div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400">Goal 75% Done</span>
              <span className="block text-[10px] font-bold text-slate-800 leading-tight">House Rent</span>
              <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div className="w-3/4 h-full bg-[#0B6E4F] rounded-full"></div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Digital Receipt */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
            className="absolute top-20 right-[-10px] sm:right-[30px] bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 z-20 max-w-[170px] text-left"
          >
            <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xs">📄</div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400">Receipt Issued</span>
              <span className="block text-[9px] font-bold text-slate-800">#JS-000145</span>
              <span className="block text-[7px] text-[#0B6E4F] font-bold hover:underline cursor-pointer">View Receipt</span>
            </div>
          </motion.div>

          {/* Card 4: Withdrawal Approved */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
            className="absolute bottom-28 right-[-10px] sm:right-[40px] bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 z-20 max-w-[170px] text-left"
          >
            <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">✔️</div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400">Withdrawal Approved</span>
              <span className="block text-xs font-black text-slate-800">₦30,000</span>
              <span className="block text-[7px] text-slate-400">2 days ago</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* STATISTICS STRIP */}
      <section className="bg-[#0B6E4F] py-8 text-white px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-around items-center gap-8 text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black block tracking-tight">25,000+</span>
            <span className="text-xs uppercase font-semibold text-white/80 tracking-wider">Active Savers</span>
          </div>
          <div className="h-px w-20 md:h-12 md:w-px bg-white/20"></div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black block tracking-tight">120,000+</span>
            <span className="text-xs uppercase font-semibold text-white/80 tracking-wider">Savings Goals Created</span>
          </div>
          <div className="h-px w-20 md:h-12 md:w-px bg-white/20"></div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black block tracking-tight">₦2.5B+</span>
            <span className="text-xs uppercase font-semibold text-white/80 tracking-wider">Verified Deposits</span>
          </div>
        </div>
      </section>

      {/* SAVINGS CATEGORIES SECTION */}
      <section id="plans" className="py-20 px-6 max-w-7xl mx-auto text-center space-y-12">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#0B6E4F] font-extrabold">Save Towards What Matters Most</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1B1B1B]">Flexible Savings Goals</h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Categories Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((c, i) => (
            <div 
              key={i} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md hover:border-[#0B6E4F] hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{c.icon}</span>
              <span className="text-xs font-bold text-slate-700 block tracking-tight group-hover:text-[#0B6E4F]">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SAVINGS CALCULATOR SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto bg-slate-900 text-white rounded-[32px] my-10 border border-slate-800 shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B6E4F]/10 rounded-full blur-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Sliders Left */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold">Jolas Savings Planner</span>
              <h2 className="text-3xl font-black tracking-tight text-white leading-tight">Calculate Your Savings Grow</h2>
              <p className="text-slate-400 text-xs max-w-md">
                Slide the controls below to preview how much you can accumulate with our average 10% APY savings engine.
              </p>
            </div>

            <div className="space-y-6">
              {/* Frequency Toggle */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Savings Frequency</span>
                <div className="flex gap-2">
                  {['Weekly', 'Monthly'].map(f => (
                    <button
                      key={f}
                      onClick={() => setCalcFrequency(f as any)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        calcFrequency === f 
                          ? 'bg-[#0B6E4F] text-white shadow-md' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-450 uppercase tracking-wider">Deposit Amount</span>
                  <span className="text-emerald-400 text-sm font-mono">₦{calcAmount.toLocaleString()} / {calcFrequency === 'Weekly' ? 'week' : 'month'}</span>
                </div>
                <input 
                  type="range"
                  min="2000"
                  max="200000"
                  step="2000"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>₦2,000</span>
                  <span>₦200,000</span>
                </div>
              </div>

              {/* Duration Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-450 uppercase tracking-wider">Savings Duration</span>
                  <span className="text-emerald-400 text-sm font-mono">{calcMonths} Months</span>
                </div>
                <input 
                  type="range"
                  min="3"
                  max="36"
                  step="3"
                  value={calcMonths}
                  onChange={(e) => setCalcMonths(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>3 Months</span>
                  <span>36 Months (3 Years)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary Box Right */}
          <div className="lg:col-span-5 bg-slate-950/60 p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between shadow-inner">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-3 flex items-center gap-1.5">
              <span>📅 Projected Growth Summary</span>
            </h3>

            <div className="space-y-4 font-semibold text-xs text-slate-400">
              <div className="flex justify-between items-center">
                <span>Total Accumulated Deposits:</span>
                <span className="text-white font-mono font-black text-sm">₦{totalDeposited.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>Estimated Interest Yield (10% APY):</span>
                <span className="font-mono font-black text-sm">+₦{Math.floor(yieldInterest).toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-850"></div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white text-sm font-bold">Total Maturity Payout:</span>
                <span className="text-[#D4AF37] font-mono font-black text-lg">₦{Math.floor(totalPayout).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-3 bg-[#0B6E4F] hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer text-center"
            >
              Start This Savings Goal
            </button>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Steps Left */}
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-2 text-left">
              <span className="text-xs uppercase tracking-widest text-[#0B6E4F] font-extrabold">Workflow System</span>
              <h2 className="text-3xl font-black tracking-tight text-[#1B1B1B]">Simple Steps to Start Saving</h2>
            </div>

            {/* 4 Steps Columns Connected */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-left relative">
              
              {[
                { step: "1", title: "Create Account", desc: "Register and complete your secure user profile details.", icon: "🧑‍💻" },
                { step: "2", title: "Create Savings Goal", desc: "Set your target amount, frequency, and savings duration.", icon: "🎯" },
                { step: "3", title: "Request Deposit", desc: "Generate a Deposit ID on your console and continue to WhatsApp.", icon: "📲" },
                { step: "4", title: "Get Credited", desc: "Agents verify proof of payment on WhatsApp and credit your dashboard.", icon: "✔️" }
              ].map((s, idx) => (
                <div key={idx} className="space-y-3 relative group">
                  <div className="w-10 h-10 bg-[#0B6E4F]/10 border border-[#0B6E4F]/20 text-[#0B6E4F] font-black rounded-full flex items-center justify-center text-sm shadow-xs group-hover:bg-[#0B6E4F] group-hover:text-white transition-colors">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 leading-tight pt-1">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}

            </div>
          </div>

          {/* Checklist Right */}
          <div className="lg:col-span-4 bg-[#F8F6F0]/60 p-8 rounded-3xl border border-slate-100 space-y-6 text-left">
            <h3 className="text-lg font-black text-slate-800">Why Choose JOLAS SAVE?</h3>
            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              {[
                "Goal-Based Savings Targets",
                "Multiple Custom Savings Plans",
                "Secure Ledger Record Keeping",
                "Instant Digital Verification Receipts",
                "Savings Progress Tracking Widgets",
                "Real-Time Dashboard Logs",
                "Fast WhatsApp Support Channel",
                "Admin & Agent Verified Safekeeping",
                "Downloadable PDF/CSV Statements",
                "Transparent Auditable Transactions"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#0B6E4F] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* HOW DEPOSITS WORK GRAPH */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center space-y-12">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#0B6E4F] font-extrabold">Detailed Flow</span>
          <h2 className="text-3xl font-black tracking-tight text-[#1B1B1B]">How Deposits Are Processed</h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Deposit Sequence diagram */}
        <div className="flex flex-wrap justify-center items-center gap-4 max-w-5xl mx-auto">
          {[
            { label: "Create Deposit Request", icon: "📝" },
            { label: "Continue to WhatsApp", icon: "💬" },
            { label: "Receive Official Account Details", icon: "🏦" },
            { label: "Transfer Money", icon: "💸" },
            { label: "Send Receipt", icon: "📨" },
            { label: "Admin/Agent Verifies", icon: "🛡️" },
            { label: "Savings Credited", icon: "📥" },
            { label: "Receipt Generated", icon: "📄" }
          ].map((flow, idx) => (
            <React.Fragment key={idx}>
              <div className="bg-white px-4 py-3.5 rounded-2xl border border-slate-100 shadow-2xs text-xs font-bold text-slate-700 flex items-center gap-2">
                <span>{flow.icon}</span>
                <span>{flow.label}</span>
              </div>
              {idx < 7 && <span className="text-[#0B6E4F] font-black text-sm hidden md:inline">→</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="max-w-2xl mx-auto p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-semibold leading-relaxed">
          💡 <strong>Notice:</strong> All deposits are verified manually by dedicated Jolas field agents prior to crediting, ensuring absolute security against malicious claims.
        </div>
      </section>

      {/* DASHBOARD PREVIEW SLIDER */}
      <section className="py-20 bg-white border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-4 text-left space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Your Savings,<br />
              <span className="text-[#0B6E4F]">At Your Fingertips</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Track your progress, manage multiple active goals, view statements, and stay updated with compliance reports anytime, anywhere.
            </p>
            <div className="flex gap-3 pt-2">
              <span className="px-4 py-2 border border-slate-200 hover:border-slate-400 rounded-xl text-xs font-bold transition-all cursor-default">🤖 Google Play Store</span>
              <span className="px-4 py-2 border border-slate-200 hover:border-slate-400 rounded-xl text-xs font-bold transition-all cursor-default">🍏 Apple App Store</span>
            </div>
          </div>

          {/* Previews screenshots inline list */}
          <div className="lg:col-span-8 flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {[
              { title: "Dashboard", desc: "Overview of your secure wealth", icon: "📊" },
              { title: "Goal Details", desc: "Monitor specific savings plan yields", icon: "🎯" },
              { title: "Deposit Request", desc: "Fast ID receipt logs dispatch", icon: "📲" },
              { title: "Transactions", desc: "PDF statements exports", icon: "📄" },
              { title: "Notifications", desc: "Bulletins of credits & approvals", icon: "🔔" }
            ].map((p, i) => (
              <div key={i} className="min-w-[190px] bg-[#F8F6F0] p-5 rounded-2xl border border-slate-200/50 shadow-2xs hover:border-[#0B6E4F] transition-all text-left space-y-2">
                <span className="text-2xl bg-white w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200/40 shadow-2xs">{p.icon}</span>
                <h3 className="font-bold text-xs text-slate-800 pt-1 leading-tight">{p.title}</h3>
                <p className="text-[10px] text-slate-450 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-12">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#0B6E4F] font-extrabold">What Our Savers Say</span>
          <h2 className="text-3xl font-black tracking-tight text-[#1B1B1B]">Success Stories</h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Carousel View */}
        <div className="relative max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100/50 text-left space-y-4">
          <div className="flex gap-1 text-[#D4AF37]">
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
          </div>

          <p className="text-slate-600 text-sm leading-relaxed italic">
            "{testimonials[currentTestimonial].text}"
          </p>

          <div className="flex items-center gap-3.5 pt-3">
            <img 
              src={testimonials[currentTestimonial].image} 
              alt={testimonials[currentTestimonial].name}
              className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-2xs"
            />
            <div>
              <span className="block font-bold text-sm text-slate-800 leading-tight">{testimonials[currentTestimonial].name}</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">{testimonials[currentTestimonial].location}</span>
            </div>
          </div>

          {/* Carousel Arrows */}
          <div className="absolute right-6 bottom-6 flex items-center gap-2">
            <button 
              onClick={prevTestimonial}
              className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextTestimonial}
              className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* FAQS */}
      <section id="faqs" className="py-20 bg-white border-y border-slate-100 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#0B6E4F] font-extrabold">Help & FAQ</span>
            <h2 className="text-3xl font-black tracking-tight text-[#1B1B1B]">Frequently Asked Questions</h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-2 rounded-full"></div>
          </div>

          {/* Accordion List */}
          <div className="space-y-3.5 text-left">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-slate-50 transition-colors font-bold text-sm text-slate-800 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {activeFaq === i ? <ChevronUp size={16} className="text-[#0B6E4F]" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5 pt-1 border-t border-slate-100"
                    >
                      <p className="text-xs text-slate-450 leading-relaxed pt-2">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#0B6E4F] via-[#09573E] to-[#0B6E4F] p-8 sm:p-12 rounded-[32px] text-white text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20 text-3xl">
            🏦
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">Start Building Your Financial Future Today</h2>
            <p className="text-white/80 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              Create your first savings goal in minutes and begin your journey toward secure financial stability.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button 
              onClick={onGetStarted}
              className="px-6 py-3.5 bg-white text-[#0B6E4F] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Create Free Account
            </button>
            <a 
              href="https://wa.me/2348037367585" 
              target="_blank" 
              rel="noreferrer" 
              className="px-6 py-3.5 bg-[#D4AF37] hover:bg-[#b08e26] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] inline-flex items-center gap-2"
            >
              <span>Contact Us on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Left cards */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#0B6E4F] font-extrabold">Contact Us</span>
            <h2 className="text-3xl font-black tracking-tight text-slate-800">We're Here to Help</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Reach out to us for support or any compliance-related inquiries. Our customer care desk is active during official support hours.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-2xs">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg">💬</span>
              <div>
                <span className="block text-[10px] text-slate-450 uppercase font-bold tracking-wider">Official WhatsApp</span>
                <a href="https://wa.me/2348037367585" target="_blank" rel="noreferrer" className="block text-sm font-extrabold text-[#0B6E4F] hover:underline">+234 803 736 7585</a>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-2xs">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg">📧</span>
              <div>
                <span className="block text-[10px] text-slate-450 uppercase font-bold tracking-wider">Email Address</span>
                <span className="block text-sm font-extrabold text-slate-700">support@jolas.com.ng</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-2xs">
              <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg">🕒</span>
              <div>
                <span className="block text-[10px] text-slate-450 uppercase font-bold tracking-wider">Support Hours</span>
                <span className="block text-sm font-extrabold text-slate-700">Monday–Saturday: 8:00 AM–6:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form right */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl text-left">
          <h3 className="text-lg font-black text-slate-800 mb-6">Send Us a Direct Message</h3>
          
          <form className="space-y-4 text-xs font-semibold" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-450 mb-1">Full Name</label>
                <input type="text" className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-[#0B6E4F] focus:outline-hidden" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-slate-450 mb-1">Email Address</label>
                <input type="email" className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-[#0B6E4F] focus:outline-hidden" placeholder="Your email address" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-450 mb-1">Phone Number</label>
                <input type="tel" className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-[#0B6E4F] focus:outline-hidden" placeholder="Your phone number" />
              </div>
              <div>
                <label className="block text-slate-450 mb-1">Subject</label>
                <input type="text" className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-[#0B6E4F] focus:outline-hidden" placeholder="How can we help?" />
              </div>
            </div>

            <div>
              <label className="block text-slate-450 mb-1">Message</label>
              <textarea className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-[#0B6E4F] focus:outline-hidden min-h-[110px]" placeholder="Type your message details here..."></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#0B6E4F] hover:bg-[#084F39] text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer text-center text-xs uppercase tracking-wider"
            >
              Send Message 🚀
            </button>
          </form>
        </div>

      </section>

      {/* MARKETING FOOTER */}
      <footer className="w-full border-t border-slate-150 bg-slate-900 text-slate-300 px-6 py-16 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          <div className="lg:col-span-4 space-y-4">
            <JolasLogo variant="horizontal" size={32} showTagline={false} />
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Jolas Save is Nigeria's trusted goal-based wealth safekeeping utility. Save Today... Secure Tomorrow.
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-slate-450 uppercase font-bold block tracking-wider">Official WhatsApp</span>
              <a href="https://wa.me/2348037367585" target="_blank" rel="noreferrer" className="text-sm font-extrabold text-[#D4AF37] hover:underline">+234 803 736 7585</a>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3.5 text-xs font-semibold text-slate-400">
            <h4 className="text-white text-xs font-bold tracking-wider uppercase">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-left hover:text-white transition-colors cursor-pointer">Home</button>
              <button onClick={() => scrollToSection('about')} className="text-left hover:text-white transition-colors cursor-pointer">About Us</button>
              <button onClick={() => scrollToSection('plans')} className="text-left hover:text-white transition-colors cursor-pointer">Savings Plans</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left hover:text-white transition-colors cursor-pointer">How It Works</button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3.5 text-xs font-semibold text-slate-400">
            <h4 className="text-white text-xs font-bold tracking-wider uppercase">Savings Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => scrollToSection('plans')} className="text-left hover:text-white transition-colors cursor-pointer">House Rent</button>
              <button onClick={() => scrollToSection('plans')} className="text-left hover:text-white transition-colors cursor-pointer">School Fees</button>
              <button onClick={() => scrollToSection('plans')} className="text-left hover:text-white transition-colors cursor-pointer">Business Capital</button>
              <button onClick={() => scrollToSection('plans')} className="text-left hover:text-white transition-colors cursor-pointer">Emergency Fund</button>
              <button onClick={() => scrollToSection('plans')} className="text-left hover:text-white transition-colors cursor-pointer">Land Purchase</button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4 text-xs">
            <h4 className="text-white text-xs font-bold tracking-wider uppercase">Regulatory & Terms</h4>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Jolas Save maintains deposit safekeeping and operations in compliance with central regulatory guidelines. All reserves are secured.
            </p>
            <div className="flex flex-col gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider text-left">
              <button 
                onClick={() => alert("Jolas Save Privacy Policy:\n\nWe encrypt all user records with 256-bit cryptography. We do not sell or share customer data with third parties. Your details are strictly used to audit manual bank deposit verifications.")} 
                className="hover:text-white transition-colors text-left cursor-pointer text-[10px] font-bold uppercase tracking-wider"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => alert("Jolas Save Terms & Conditions:\n\n1. All deposits must match your verified name.\n2. Manual transfers require WhatsApp confirmation.\n3. Early withdrawals are subject to verification.")} 
                className="hover:text-white transition-colors text-left cursor-pointer text-[10px] font-bold uppercase tracking-wider"
              >
                Terms & Conditions
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500 uppercase tracking-widest">
          © 2026 JOLAS SAVE. All rights reserved. Save Today... Secure Tomorrow.
        </div>
      </footer>



    </div>
  );
};
