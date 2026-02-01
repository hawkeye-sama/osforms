import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-white/5 animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
