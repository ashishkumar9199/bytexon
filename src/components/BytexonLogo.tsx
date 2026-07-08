import React from 'react';

interface BytexonLogoProps {
  showText?: boolean;
  theme?: 'light' | 'dark'; // 'light' is for light backgrounds, 'dark' is for dark backgrounds
  height?: number | string;
  className?: string;
}

export default function BytexonLogo({
  showText = true,
  theme = 'light',
  height = 32,
  className = '',
}: BytexonLogoProps) {
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const subtitleColor = theme === 'light' ? 'text-slate-400' : 'text-slate-500';
  const gradientId = theme === 'light' ? 'bxPremiumGradLight' : 'bxPremiumGradDark';

  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`} style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      {/* Redesigned Sleek, High-End Monogram Icon */}
      <svg
        viewBox="0 0 100 100"
        className="h-full aspect-square"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
            <stop offset="50%" stopColor="#a855f7" /> {/* Purple */}
            <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
          </linearGradient>
        </defs>
        
        {/* Soft elegant shadow-backing */}
        <circle cx="50" cy="50" r="46" fill="currentColor" className={theme === 'light' ? 'text-slate-50' : 'text-slate-900/40'} />
        
        {/* Apple-style ultra-precise geometric BX monogram */}
        <path
          d="M32 25C32 25 48 25 54 25C65 25 72 30 72 39C72 45 67 50 60 51.5C68 53.5 74 59 74 67C74 76 66 81 53 81L32 81V25ZM44 35V47H53C58 47 61 45 61 41C61 37 58 35 53 35H44ZM44 56V71H54C59 71 63 69 63 63.5C63 58 59 56 54 56H44Z"
          fill={`url(#${gradientId})`}
        />
        
        {/* Sleek architectural dynamic overlay slash for "X" style */}
        <path
          d="M56 81L80 43H88L64 81H56ZM82 81L70 62L76 53L94 81H82ZM68 47L58 32H67L73 41L68 47Z"
          fill={`url(#${gradientId})`}
          className="mix-blend-multiply opacity-90"
        />
      </svg>

      {/* Elegant, clean corporate wordmark */}
      {showText && (
        <div className="flex flex-col justify-center text-left leading-none">
          <span className={`text-base font-bold tracking-tight ${textColor} font-sans`}>
            BYTEXON
          </span>
          <span className={`text-[8px] font-medium tracking-[0.25em] ${subtitleColor} font-sans uppercase mt-1`}>
            Digital Architecture
          </span>
        </div>
      )}
    </div>
  );
}
