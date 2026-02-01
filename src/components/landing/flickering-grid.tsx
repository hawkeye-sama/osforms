'use client';

import { motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  maxOpacity?: number;
  className?: string;
}

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = 'rgb(255, 255, 255)',
  maxOpacity = 0.3,
  className = '',
}: FlickeringGridProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { cols, rows } = useMemo(() => {
    const cols = Math.ceil(dimensions.width / (squareSize + gridGap));
    const rows = Math.ceil(dimensions.height / (squareSize + gridGap));
    return { cols, rows };
  }, [dimensions, squareSize, gridGap]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        width="100%"
        height="100%"
        className="opacity-20"
        style={{
          maskImage:
            'radial-gradient(circle at center, black, transparent 80%)',
        }}
      >
        {Array.from({ length: Math.min(cols * rows, 500) }).map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          return (
            <FlickeringSquare
              key={i}
              x={col * (squareSize + gridGap)}
              y={row * (squareSize + gridGap)}
              size={squareSize}
              color={color}
              maxOpacity={maxOpacity}
              flickerChance={flickerChance}
            />
          );
        })}
      </svg>
    </div>
  );
}

function FlickeringSquare({
  x,
  y,
  size,
  color,
  maxOpacity,
  flickerChance,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  maxOpacity: number;
  flickerChance: number;
}) {
  return (
    <motion.rect
      x={x}
      y={y}
      width={size}
      height={size}
      fill={color}
      initial={{ opacity: Math.random() * maxOpacity }}
      animate={{
        opacity: [
          Math.random() * maxOpacity,
          Math.random() > flickerChance ? Math.random() * maxOpacity : 0,
          Math.random() * maxOpacity,
        ],
      }}
      transition={{
        duration: 2 + Math.random() * 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
