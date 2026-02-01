'use client';

import { useEffect, useId, useState } from 'react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

export interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement | null>; // Container ref
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export const AnimatedBeam = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false, // branch direction
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = 'gray',
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = '#ffaa40',
  gradientStopColor = '#9c40ff',
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) => {
  const id = useId();
  const [path, setPath] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Calculate the gradient coordinates based on the connectivity direction
  const gradientCoordinates = reverse
    ? {
        x1: '0%',
        x2: '100%',
        y1: '0%',
        y2: '0%',
      }
    : {
        x1: '100%',
        x2: '0%',
        y1: '0%',
        y2: '0%',
      };

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        const controlY = startY + curvature;
        const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`;
        setPath(d);
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updatePath();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updatePath();

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  // Create variants for the gradient animation to ensure a smooth flow that traverses the whole path
  const gradientVariants = {
    animate: {
      x1: reverse ? ['100%', '-100%'] : ['-100%', '100%'],
      x2: reverse ? ['200%', '0%'] : ['0%', '200%'],
      y1: ['0%', '0%'],
      y2: ['0%', '0%'],
    },
  };

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'pointer-events-none absolute top-0 left-0 stroke-2',
        className
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={path}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={path}
        stroke={`url(#${id})`}
        strokeWidth={pathWidth}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          variants={gradientVariants}
          animate="animate"
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="50%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStartColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
};
