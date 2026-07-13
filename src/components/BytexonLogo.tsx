import React from 'react';
import { motion } from 'motion/react';

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
  // Theme styling declarations
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const subtitleColor = theme === 'light' ? 'text-slate-400' : 'text-slate-500';
  
  // Custom HEX colors to match the premium branding exactly
  const primaryNavy = '#132B4F';
  const cyanTeal = '#00C2E8';
  const darkBgText = '#ffffff';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover="hover"
      className={`flex items-center space-x-3 select-none ${className}`} 
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {/* Precision Engineered High-Fidelity SVG Brandmark */}
      <motion.div
        variants={{
          hover: { scale: 1.05, rotate: 2 }
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
        className="h-full aspect-square relative shrink-0"
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Smooth Cyan to Deep Blue Linear Gradient matching the image */}
            <linearGradient id="bytexonIconGradient" x1="20" y1="20" x2="90" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" /> {/* Glowing Cyan */}
              <stop offset="45%" stopColor="#00A2D3" /> {/* Medium Electric Blue */}
              <stop offset="100%" stopColor="#0B4C8C" /> {/* High-End Corporate Navy */}
            </linearGradient>

            {/* Radial glow for nodes */}
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#00E5FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0B4C8C" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* BACKGROUND STRUCTURE LINES */}
          {/* Inner networking/diagonal cords connecting the elements */}
          <path
            d="M 62 34 L 72 36
               M 62 66 L 72 64
               M 62 34 L 74 46
               M 62 66 L 74 54
               M 42 34 L 62 34
               M 42 34 L 32 51.32
               M 42 34 L 52 51.32
               M 42 66 L 62 66
               M 42 66 L 32 48.68
               M 42 66 L 52 48.68
               M 32 16.68 L 14 16.68
               M 22 34 L 10 34
               M 22 66 L 10 66
               M 32 83.32 L 14 83.32"
            stroke="url(#bytexonIconGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />

          {/* THE DOUBLE HEXAGONS */}
          {/* Top Hexagon Path */}
          <path
            d="M 32 16.68 
               L 52 16.68 
               L 62 34 
               L 52 51.32 
               L 32 51.32 
               L 22 34 
               Z"
            stroke="url(#bytexonIconGradient)"
            strokeWidth="4.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Bottom Hexagon Path */}
          <path
            d="M 32 48.68 
               L 52 48.68 
               L 62 66 
               L 52 83.32 
               L 32 83.32 
               L 22 66 
               Z"
            stroke="url(#bytexonIconGradient)"
            strokeWidth="4.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* THE STYLIZED 'X' NETWORK (Arm Crossing) */}
          {/* Main descending diagonal */}
          <path
            d="M 72 36 L 96 64"
            stroke="url(#bytexonIconGradient)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Main ascending diagonal */}
          <path
            d="M 72 64 L 96 36"
            stroke="url(#bytexonIconGradient)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* SCATTERED PIXEL BLOCKS (Floating data squares) */}
          <rect x="4" y="24" width="4" height="4" rx="1" fill="#00E5FF" />
          <rect x="10" y="28" width="3.5" height="3.5" rx="0.5" fill="#00A2D3" />
          <rect x="6" y="38" width="5" height="5" rx="1.2" fill="#00E5FF" />
          <rect x="12" y="44" width="4" height="4" rx="1" fill="#0B4C8C" />
          <rect x="8" y="50" width="3.5" height="3.5" rx="0.5" fill="#00E5FF" />
          <rect x="4" y="56" width="5" height="5" rx="1.2" fill="#00A2D3" />
          <rect x="10" y="60" width="3" height="3" rx="0.5" fill="#0B4C8C" />
          <rect x="6" y="70" width="4" height="4" rx="1" fill="#00E5FF" />

          {/* GLOWING CENTER NODES & ENDPOINTS */}
          {/* Top Hexagon Center Node */}
          <circle cx="42" cy="34" r="5" fill="url(#bytexonIconGradient)" />
          <circle cx="42" cy="34" r="2.5" fill="#ffffff" />

          {/* Bottom Hexagon Center Node */}
          <circle cx="42" cy="66" r="5" fill="url(#bytexonIconGradient)" />
          <circle cx="42" cy="66" r="2.5" fill="#ffffff" />

          {/* 'X' Center Intersection Node with Bright Flash */}
          <circle cx="84" cy="50" r="7.5" fill="url(#bytexonIconGradient)" />
          <circle cx="84" cy="50" r="3.5" fill="#ffffff" />

          {/* 'X' Terminal Arm Nodes */}
          <circle cx="72" cy="36" r="4.5" fill="url(#bytexonIconGradient)" />
          <circle cx="96" cy="36" r="4.5" fill="url(#bytexonIconGradient)" />
          <circle cx="72" cy="64" r="4.5" fill="url(#bytexonIconGradient)" />
          <circle cx="96" cy="64" r="4.5" fill="url(#bytexonIconGradient)" />
        </svg>

        {/* Ambient pulse flare on 'X' center */}
        <motion.span 
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute bottom-[44%] right-[10%] w-3 h-3 rounded-full bg-cyan-300 blur-[2px] pointer-events-none"
        />
      </motion.div>

      {/* Corporate Wordmark styled EXACTLY as in the provided image */}
      {showText && (
        <div className="flex flex-col justify-center text-left leading-none">
          <motion.div 
            variants={{
              hover: { x: 3 }
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className={`text-base sm:text-lg font-black tracking-wider font-sans flex items-center h-5`}
            style={{ color: theme === 'light' ? primaryNavy : darkBgText }}
          >
            <span>BYTE</span>
            <span style={{ color: cyanTeal }}>X</span>
            <span>ON</span>
          </motion.div>
          
          <span 
            className={`text-[8px] font-bold tracking-[0.22em] font-sans uppercase mt-1 shrink-0`}
            style={{ color: theme === 'light' ? '#7E8F9A' : '#94A3B8' }}
          >
            DIGITAL SOLUTIONS
          </span>
        </div>
      )}
    </motion.div>
  );
}
