import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // e.g. 'rgba(129, 140, 248, 0.25)'
  maxTilt?: number; // default 10 degrees
  key?: React.Key;
}

export default function Interactive3DCard({ 
  children, 
  className = '', 
  glowColor = 'rgba(99, 102, 241, 0.35)',
  maxTilt = 8
}: Interactive3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse positions normalized to -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs to drive rotation
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), { stiffness: 180, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), { stiffness: 180, damping: 20 });

  // Shine/Glare coordinates
  const glareLeft = useSpring(useTransform(x, [-0.5, 0.5], ['0%', '100%']), { stiffness: 180, damping: 20 });
  const glareTop = useSpring(useTransform(y, [-0.5, 0.5], ['0%', '100%']), { stiffness: 180, damping: 20 });
  const glareOpacity = useSpring(0, { stiffness: 180, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative offset from card center (-0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
    glareOpacity.set(0.65);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1200,
        rotateX,
        rotateY,
      }}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Ambient Glare Overlap layer */}
      <motion.div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(255,255,255,0) 70%)`,
          left: glareLeft,
          top: glareTop,
          translateX: '-200px',
          translateY: '-200px',
          opacity: glareOpacity,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          zIndex: 4,
        }}
        className="pointer-events-none"
      />
      
      {/* Content wrapper with actual depth translate */}
      <div 
        style={{ 
          transform: 'translateZ(20px)', 
          transformStyle: 'preserve-3d' 
        }}
        className="w-full h-full"
      >
        {children}
      </div>
    </motion.div>
  );
}
