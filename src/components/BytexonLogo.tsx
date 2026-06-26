import React from 'react';

interface BytexonLogoProps {
  showText?: boolean;
  theme?: 'light' | 'dark'; // 'light' is for light backgrounds (text is dark), 'dark' is for dark backgrounds (text is light/white)
  height?: number | string;
  className?: string;
}

export default function BytexonLogo({
  showText = true,
  theme = 'light',
  height = 40,
  className = '',
}: BytexonLogoProps) {
  // Determine text color based on the theme
  const textColor = theme === 'light' ? '#0f172a' : '#ffffff';
  const subtitleColor = theme === 'light' ? '#64748b' : '#94a3b8';

  return (
    <svg
      viewBox={showText ? "0 0 520 120" : "0 0 120 120"}
      height={height}
      className={`inline-block ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Futuristic primary blue to cyan gradient for the logo mark */}
        <linearGradient id="bxGradient" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Glow and shadow filter for tech elements */}
        <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* --- GRAPHIC ICON ("BX" MONOGRAM) --- */}
      <g transform="translate(5, 5)">
        {/* Network Nodes / Dots & Connections above the BX */}
        <g stroke="#06b6d4" strokeWidth="1" opacity="0.8">
          <line x1="50" y1="35" x2="65" y2="15" />
          <line x1="65" y1="15" x2="85" y2="15" />
          <line x1="85" y1="15" x2="100" y2="30" />
          <line x1="65" y1="15" x2="75" y2="35" />
          <line x1="40" y1="42" x2="50" y2="35" />
        </g>
        
        {/* Network Node Dots */}
        <circle cx="50" cy="35" r="2.5" fill="#06b6d4" />
        <circle cx="65" cy="15" r="3.5" fill="#22d3ee" className="animate-pulse" filter="url(#glow)" />
        <circle cx="85" cy="15" r="4" fill="#06b6d4" />
        <circle cx="100" cy="30" r="3" fill="#10b981" />
        <circle cx="75" cy="35" r="2" fill="#22d3ee" />
        <circle cx="40" cy="42" r="2" fill="#2563eb" />

        {/* Stylized "B" */}
        <path
          d="M 18,30 L 48,30 C 58,30 62,36 62,43 C 62,48 58,52 50,54 C 59,56 64,61 64,69 C 64,77 58,84 46,84 L 18,84 Z M 30,42 L 30,50 L 44,50 C 48,50 50,48 50,46 C 50,44 48,42 44,42 Z M 30,58 L 30,72 L 46,72 C 50,72 52,70 52,65 C 52,60 50,58 46,58 Z"
          fill="url(#bxGradient)"
          className="transition-all duration-300 hover:opacity-90"
        />

        {/* Tech Cutout slashes for futuristic "B" look */}
        <path d="M 15,25 L 32,25 L 26,89 L 15,89 Z" fill="#ffffff" opacity="0.1" />
        <path d="M 28,53 L 65,53 L 65,55 L 28,55 Z" fill="#ffffff" opacity="0.15" />

        {/* Stylized "X" */}
        {/* Left-to-Right Slash */}
        <path
          d="M 45,84 L 85,32 L 98,32 L 58,84 Z"
          fill="url(#bxGradient)"
        />
        {/* Right-to-Left Slash (with tech gap in the middle) */}
        <path
          d="M 85,84 L 70,64 L 78,54 L 98,84 Z"
          fill="url(#bxGradient)"
        />
        <path
          d="M 64,48 L 52,32 L 65,32 L 72,42 Z"
          fill="url(#bxGradient)"
        />
      </g>

      {/* --- COMPANY WORDMARK & SUBTITLE --- */}
      {showText && (
        <g transform="translate(135, 0)">
          {/* "BYTEXON" Stylized Wordmark */}
          <g fill={textColor}>
            {/* B */}
            <path d="M 15,35 L 35,35 C 42,35 45,38 45,43 C 45,46 43,49 38,50 C 44,51 47,54 47,60 C 47,65 42,69 34,69 L 15,69 Z M 23,43 L 23,48 L 33,48 C 36,48 37,47 37,45 C 37,44 36,43 33,43 Z M 23,55 L 23,61 L 34,61 C 37,61 38,60 38,58 C 38,56 37,55 34,55 Z" />
            {/* Y */}
            <path d="M 52,35 L 63,51 L 63,69 L 71,69 L 71,51 L 82,35 L 73,35 L 67,45 L 61,35 Z" />
            {/* T */}
            <path d="M 86,35 L 114,35 L 114,42 L 104,42 L 104,69 L 96,69 L 96,42 L 86,42 Z" />
            {/* E */}
            <path d="M 120,35 L 144,35 L 144,42 L 128,42 L 128,48 L 141,48 L 141,55 L 128,55 L 128,62 L 145,62 L 145,69 L 120,69 Z" />
            
            {/* X (with digital connection particles) */}
            <g>
              <path d="M 151,35 L 163,52 L 150,69 L 159,69 L 168,56 L 177,69 L 186,69 L 173,52 L 185,35 L 176,35 L 168,47 L 160,35 Z" fill="#06b6d4" filter="url(#glow)" />
              {/* Micro particles bursting from X */}
              <circle cx="186" cy="32" r="1.5" fill="#22d3ee" />
              <circle cx="191" cy="27" r="2.5" fill="#06b6d4" />
              <circle cx="196" cy="24" r="1.5" fill="#10b981" />
              <circle cx="188" cy="21" r="1" fill="#22d3ee" />
            </g>

            {/* O */}
            <path d="M 210,33 C 221,33 229,41 229,52 C 229,63 221,71 210,71 C 199,71 191,63 191,52 C 191,41 199,33 210,33 Z M 210,41 C 204,41 199,46 199,52 C 199,58 204,63 210,63 C 216,63 221,58 221,52 C 221,46 216,41 210,41 Z" />
            {/* N */}
            <path d="M 235,35 L 243,35 L 259,57 L 259,35 L 267,35 L 267,69 L 259,69 L 243,47 L 243,69 L 235,69 Z" />
          </g>

          {/* Subtitle text "TECHNOLOGY • INNOVATION • SOFTWARE" */}
          <text
            x="16"
            y="90"
            fill={subtitleColor}
            fontSize="10"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="bold"
            letterSpacing="6.5"
            opacity="0.85"
          >
            TECHNOLOGY • INNOVATION • SOFTWARE
          </text>
        </g>
      )}
    </svg>
  );
}
