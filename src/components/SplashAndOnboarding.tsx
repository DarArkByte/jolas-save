import React, { useState } from 'react';
import { ShieldCheck, Target, TrendingUp, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JolasLogo } from './JolasLogo';

interface SplashAndOnboardingProps {
  onComplete: () => void;
}

export const SplashAndOnboarding: React.FC<SplashAndOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'splash' | 'onboarding'>('splash');
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'Save Today... Secure Tomorrow',
      description: 'Create targeted goals with automated or flexible saving plans, custom-designed to bring your dreams to reality.',
      icon: Target,
      color: 'bg-emerald-50 text-emerald-600',
      badge: '🎯 Automated Goals'
    },
    {
      title: 'Guaranteed 256-Bit Financial Safety',
      description: 'Your security is our absolute highest priority. Double-layer identity checks, full encryption, and NDIC insured capital partners.',
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-600',
      badge: '🔒 Premium Security'
    },
    {
      title: 'Instant Settlement & Digital Receipts',
      description: 'Receive real-time automated statements, print PDF receipt cards, and enjoy frictionless settlement transfers.',
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
      badge: '⚡ Real-time Settlement'
    }
  ];

  const handleNextSlide = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  React.useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('onboarding');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* Splash Launcher Screen */}
        {step === 'splash' && (
          <motion.div 
            key="splash-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <JolasLogo variant="full" size={160} showTagline={true} />
            </motion.div>
            
            <div className="mt-10 flex justify-center items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2.5 h-2.5 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        {/* Onboarding Carousel Slider */}
        {step === 'onboarding' && (
          <motion.div 
            key="onboarding-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white rounded-[36px] shadow-2xl border border-slate-100/80 p-8 mx-4 flex flex-col justify-between min-h-[580px] relative overflow-hidden"
          >
            {/* Top Indicator */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-emerald-600 tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">
                {slides[activeSlide].badge}
              </span>
              <button 
                onClick={onComplete}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-wider"
                id="skip-onboarding-btn"
              >
                Skip
              </button>
            </div>

            {/* Slide Body */}
            <div className="flex-1 flex flex-col justify-center my-6">
              <div className="flex justify-center mb-6">
                <div className={`w-24 h-24 rounded-[32px] ${slides[activeSlide].color} flex items-center justify-center shadow-inner`}>
                  {React.createElement(slides[activeSlide].icon, { size: 44, className: 'stroke-[2]' })}
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight text-center leading-tight">
                {slides[activeSlide].title}
              </h2>
              
              <p className="text-slate-500 text-sm text-center mt-3 leading-relaxed">
                {slides[activeSlide].description}
              </p>
            </div>

            {/* Footer Control Actions */}
            <div>
              {/* Dots indicator */}
              <div className="flex justify-center gap-1.5 mb-8">
                {slides.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200'}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/10 active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
                id="onboard-next-btn"
              >
                <span>{activeSlide === slides.length - 1 ? 'Get Secured Now' : 'Continue'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
