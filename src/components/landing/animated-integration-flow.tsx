'use client';

import React, { forwardRef, useRef } from 'react';
import {
  FileText,
  Globe,
  Layout,
  Mail,
  MessageSquare,
  Send,
  Slack,
  Table,
  Webhook as WebhookIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/components/ui/animated-beam';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'border-border z-10 flex size-16 items-center justify-center rounded-full border-2 bg-white p-4 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] md:size-24 dark:bg-zinc-900',
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = 'Circle';

export function AnimatedIntegrationFlow({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);
  const div8Ref = useRef<HTMLDivElement>(null);
  const div9Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden p-10',
        className
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-5xl flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center gap-6 md:gap-12">
          <Circle ref={div1Ref}>
            <Globe className="size-8 text-blue-500 md:size-10" />
          </Circle>
          <Circle ref={div2Ref}>
            <Layout className="size-8 text-green-500 md:size-10" />
          </Circle>
          <Circle ref={div3Ref}>
            <MessageSquare className="size-8 text-purple-500 md:size-10" />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle
            ref={div4Ref}
            className="glow-pulse size-24 border-white/20 bg-zinc-950 md:size-32"
          >
            <span className="text-xl font-black tracking-tighter text-white md:text-4xl">
              OSF
            </span>
          </Circle>
        </div>
        <div className="flex flex-col justify-center gap-6 md:gap-8">
          <Circle ref={div5Ref}>
            <Mail className="size-8 text-red-500 md:size-10" />
          </Circle>
          <Circle ref={div6Ref}>
            <Table className="size-8 text-green-600 md:size-10" />
          </Circle>
          <Circle ref={div7Ref}>
            <Slack className="size-8 text-orange-500 md:size-10" />
          </Circle>
          <Circle ref={div8Ref}>
            <MessageSquare className="size-8 text-indigo-500 md:size-10" />
          </Circle>
          <Circle ref={div9Ref}>
            <WebhookIcon className="size-8 text-pink-500 md:size-10" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-20}
        endYOffset={-20}
        pathColor="white"
        pathOpacity={0.1}
        gradientStartColor="#ffffff"
        gradientStopColor="#999999"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
        pathColor="white"
        pathOpacity={0.1}
        gradientStartColor="#ffffff"
        gradientStopColor="#999999"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={20}
        endYOffset={20}
        pathColor="white"
        pathOpacity={0.1}
        gradientStartColor="#ffffff"
        gradientStopColor="#999999"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div5Ref}
        curvature={-40}
        startYOffset={-20}
        pathColor="white"
        pathOpacity={0.1}
        gradientStartColor="#ffffff"
        gradientStopColor="#999999"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div6Ref}
        curvature={-20}
        startYOffset={-10}
        pathColor="white"
        pathOpacity={0.1}
        gradientStartColor="#ffffff"
        gradientStopColor="#999999"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div7Ref}
        pathColor="white"
        pathOpacity={0.1}
        gradientStartColor="#ffffff"
        gradientStopColor="#999999"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div8Ref}
        curvature={20}
        startYOffset={10}
        pathColor="white"
        pathOpacity={0.1}
        gradientStartColor="#ffffff"
        gradientStopColor="#999999"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div9Ref}
        curvature={40}
        startYOffset={20}
        pathColor="white"
        pathOpacity={0.1}
        gradientStartColor="#ffffff"
        gradientStopColor="#999999"
      />
    </div>
  );
}
