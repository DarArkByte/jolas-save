import React from 'react';

interface JolasLogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon' | 'horizontal';
  lightBackground?: boolean;
  showTagline?: boolean;
}

export const JolasLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 120, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Rich Green Gradient for the Hand/Cradle and Bag */}
        <linearGradient id="jolasGreenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#084F39" />
          <stop offset="100%" stopColor="#0B6E4F" />
        </linearGradient>

        {/* Rich Gold Gradient for the Arc and Figure */}
        <linearGradient id="jolasGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#F5C423" />
        </linearGradient>
      </defs>

      {/* Main Container Group */}
      <g>
        {/* 1. The Gold Arc / Stylized Person Arching Over */}
        {/* Gold curved arc going from top-left, sweeping right and ending near the figure head */}
        <path
          d="M 165 178 C 190 110, 290 85, 340 145"
          stroke="url(#jolasGoldGrad)"
          strokeWidth="28"
          strokeLinecap="round"
          fill="none"
        />
        {/* Gold person head/circle */}
        <circle cx="318" cy="115" r="30" fill="url(#jolasGoldGrad)" />
        {/* Gold body curve/connector arm */}
        <path
          d="M 318 145 C 300 170, 280 160, 310 185"
          stroke="url(#jolasGoldGrad)"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
          className="opacity-90"
        />

        {/* 2. The Green Hand/Cradle at the Bottom */}
        {/* Left crescent side of the hand growing up */}
        <path
          d="M 165 125 C 145 160, 140 260, 200 320 C 260 380, 390 350, 410 260 C 415 235, 410 215, 395 210 C 375 205, 365 240, 345 250 C 315 265, 240 250, 195 215 C 165 190, 168 150, 165 125 Z"
          fill="url(#jolasGreenGrad)"
        />
        
        {/* Soft overlapping visual palm curve for depth */}
        <path
          d="M 165 210 C 160 250, 210 330, 290 335 C 370 340, 400 270, 410 250 C 410 250, 370 290, 310 290 C 250 290, 190 250, 165 210 Z"
          fill="#084F39"
          opacity="0.25"
        />

        {/* 3. The Green Money Bag in the Center */}
        {/* Money bag body */}
        <path
          d="M 275 145 C 255 145, 230 180, 220 220 C 210 260, 230 300, 275 300 C 320 300, 340 260, 330 220 C 320 180, 295 145, 275 145 Z"
          fill="url(#jolasGreenGrad)"
        />
        {/* Money bag neck/ruffle at the top */}
        <path
          d="M 255 145 C 265 140, 285 140, 295 145"
          stroke="url(#jolasGreenGrad)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 250 140 C 240 125, 275 115, 275 115 C 275 115, 310 125, 300 140 Z"
          fill="url(#jolasGreenGrad)"
        />
        {/* String/tie around the neck */}
        <path
          d="M 252 148 C 265 152, 285 152, 298 148"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* 4. White Naira "₦" Symbol inside Money Bag */}
        {/* Horizontal bar 1 */}
        <rect x="254" y="210" width="42" height="6" rx="3" fill="#FFFFFF" />
        {/* Horizontal bar 2 */}
        <rect x="254" y="222" width="42" height="6" rx="3" fill="#FFFFFF" />
        {/* Main "N" shape */}
        <path
          d="M 262 198 V 242 M 262 198 L 288 242 M 288 198 V 242"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 5. The Vertical Green Growth Bar Chart Columns on the right */}
        {/* Bar 1 (Leftmost / lowest) */}
        <rect x="362" y="200" width="16" height="60" rx="4" fill="url(#jolasGreenGrad)" transform="skewY(-10)" />
        {/* Bar 2 (Middle) */}
        <rect x="388" y="195" width="16" height="85" rx="4" fill="url(#jolasGreenGrad)" transform="skewY(-10)" />
        {/* Bar 3 (Rightmost / highest) */}
        <rect x="414" y="190" width="16" height="110" rx="4" fill="url(#jolasGreenGrad)" transform="skewY(-10)" />
      </g>
    </svg>
  );
};

export const JolasLogo: React.FC<JolasLogoProps> = ({
  className = '',
  size,
  variant = 'full',
  lightBackground = true,
  showTagline = true
}) => {
  // Derive sizing based on variant
  const iconSize = size ? size : variant === 'icon' ? 44 : variant === 'horizontal' ? 36 : 140;
  const textColor = lightBackground ? 'text-slate-800' : 'text-white';
  const subtextColor = lightBackground ? 'text-slate-500' : 'text-slate-300';

  if (variant === 'icon') {
    return <JolasLogoIcon size={iconSize} className={className} />;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`} id="jolas-logo-horizontal">
        <JolasLogoIcon size={iconSize} />
        <div>
          <span className={`block font-sans font-black text-lg tracking-tight uppercase ${textColor} leading-none`}>
            JOLAS <span className="text-jolas-green-primary">SAVE</span>
          </span>
          {showTagline && (
            <span className={`block text-[8px] font-bold uppercase tracking-wider ${subtextColor} mt-0.5 font-sans`}>
              Save Today... Secure Tomorrow
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full Stack Vertical Layout (e.g. Splash, Landing, Login)
  return (
    <div className={`flex flex-col items-center text-center ${className}`} id="jolas-logo-full">
      <JolasLogoIcon size={iconSize} className="mb-2" />
      
      <h1 className="font-sans font-black tracking-tight text-3xl text-slate-800 leading-none">
        JOLAS <span className="text-jolas-green-primary">SAVE</span>
      </h1>
      
      {showTagline && (
        <div className="flex items-center gap-3 mt-2 w-full max-w-[280px] justify-center">
          <div className="h-[1px] flex-1 bg-amber-500/60" />
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Save Today... Secure Tomorrow
          </span>
          <div className="h-[1px] flex-1 bg-amber-500/60" />
        </div>
      )}
    </div>
  );
};
