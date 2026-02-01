import { cn } from '@/lib/utils';

function Skeleton({
  className,
  variant = 'dark',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'dark' | 'light';
}) {
  return (
    <div
      className={cn(
        variant === 'dark' ? 'bg-white/5' : 'bg-black/5',
        'animate-pulse rounded-md',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
