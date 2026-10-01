import React from 'react';

interface LumoraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const LumoraLogo: React.FC<LumoraLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base font-bold tracking-[0.14em]',
    md: 'text-xl font-bold tracking-[0.18em]',
    lg: 'text-2xl font-bold tracking-[0.2em]',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Abstract Orbit & Light Emblem */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        {/* Soft background aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6D5DFB] via-[#B8A7FF] to-[#69E1D4] opacity-80 blur-[2px] transition-transform duration-500 group-hover:scale-110" />
        
        {/* Crisp vector geometry of light node & intersecting memory orbits */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full drop-shadow-[0_2px_6px_rgba(59,38,126,0.3)]"
        >
          {/* Outer orbital ring */}
          <ellipse
            cx="16"
            cy="16"
            rx="12"
            ry="6"
            transform="rotate(-25 16 16)"
            stroke="white"
            strokeWidth="1.8"
            strokeOpacity="0.85"
            strokeDasharray="1.5 2.5"
          />
          {/* Inner inclined ring */}
          <ellipse
            cx="16"
            cy="16"
            rx="9"
            ry="4.5"
            transform="rotate(40 16 16)"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />
          {/* Luminous memory core */}
          <circle cx="16" cy="16" r="3.2" fill="white" />
          <circle cx="16" cy="16" r="5" fill="white" fillOpacity="0.3" />
          {/* Satellite memory node */}
          <circle cx="23" cy="12" r="1.6" fill="#8DDCFF" />
          <circle cx="9" cy="19" r="1.2" fill="#F4A7D8" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span
          className={`font-display text-[#171522] uppercase transition-colors group-hover:text-[#3B267E] ${textSizes[size]}`}
          style={{ letterSpacing: '0.16em' }}
        >
          Lumora
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-wider text-[#665F78] uppercase font-medium">
            Every moment, illuminated
          </span>
        )}
      </div>
    </div>
  );
};
