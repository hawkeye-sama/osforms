'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlignLeft,
  BarChart2,
  CheckSquare,
  ChevronDown,
  CircleDot,
  GripVertical,
  Hash,
  Link,
  Mail,
  MessageSquare,
  Phone,
  Star,
  Type,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { FormField } from '@osforms/types';

const FIELD_ICONS: Record<string, React.FC<{ className?: string }>> = {
  text: Type, email: Mail, textarea: AlignLeft, number: Hash,
  tel: Phone, url: Link, select: ChevronDown, radio: CircleDot,
  checkbox: CheckSquare, rating: Star, scale: BarChart2, statement: MessageSquare,
};

const FIELD_LABELS: Record<string, string> = {
  text: 'Short Text', email: 'Email', textarea: 'Long Text', number: 'Number',
  tel: 'Phone', url: 'URL', select: 'Dropdown', radio: 'Multiple Choice',
  checkbox: 'Checkboxes', rating: 'Rating', scale: 'Scale', statement: 'Statement',
};

interface FieldCardProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function FieldCard({ field, index, isSelected, onSelect }: FieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const Icon = FIELD_ICONS[field.type] ?? Type;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      className={cn(
        'bg-card border-border group flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all',
        isSelected && 'border-foreground/40 ring-foreground/10 ring-2',
        isDragging && 'opacity-50',
        !isSelected && 'hover:border-border hover:bg-secondary/50'
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="text-muted-foreground/40 hover:text-muted-foreground shrink-0 cursor-grab touch-none active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Number badge */}
      <span className="text-muted-foreground bg-secondary flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium">
        {index + 1}
      </span>

      {/* Icon */}
      <Icon className="text-muted-foreground h-4 w-4 shrink-0" />

      {/* Label */}
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', isSelected ? 'text-foreground' : 'text-foreground/80')}>
          {field.label || <span className="text-muted-foreground italic">Untitled {FIELD_LABELS[field.type]}</span>}
        </p>
        <p className="text-muted-foreground text-xs">{FIELD_LABELS[field.type]}</p>
      </div>

      {/* Required dot */}
      {field.required && (
        <span className="text-muted-foreground shrink-0 text-xs">*</span>
      )}
    </div>
  );
}
