'use client';

import {
  AlignLeft,
  BarChart2,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Hash,
  Link,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Star,
  Type,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { FIELD_TYPES, type FieldTypeMeta } from './constants';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Type,
  Mail,
  AlignLeft,
  Hash,
  Phone,
  Link,
  ChevronDown,
  CircleDot,
  CheckSquare,
  Star,
  BarChart2,
  MessageSquare,
};

interface FieldPaletteProps {
  onAdd: (type: FieldTypeMeta['type']) => void;
}

export function FieldPalette({ onAdd }: FieldPaletteProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b px-4 py-3">
        <p className="text-foreground text-xs font-semibold tracking-wider uppercase">
          Add Field
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {FIELD_TYPES.map((meta) => {
            const Icon = ICON_MAP[meta.icon];
            return (
              <button
                key={meta.type}
                type="button"
                onClick={() => onAdd(meta.type)}
                className={cn(
                  'hover:bg-secondary group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors'
                )}
              >
                <div className="bg-card border-border flex h-7 w-7 shrink-0 items-center justify-center rounded border">
                  {Icon && (
                    <Icon className="text-muted-foreground h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium">
                    {meta.label}
                  </p>
                </div>
                <Plus className="text-muted-foreground ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
