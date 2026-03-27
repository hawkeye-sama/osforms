'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { FormField } from '@osforms/types';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { FieldCard } from './FieldCard';

interface FieldListProps {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (fields: FormField[]) => void;
  onAddFirst: () => void;
}

export function FieldList({
  fields,
  selectedId,
  onSelect,
  onReorder,
  onAddFirst,
}: FieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    onReorder(arrayMove(fields, oldIndex, newIndex));
  }

  if (fields.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="bg-secondary border-border flex h-16 w-16 items-center justify-center rounded-full border">
          <Plus className="text-muted-foreground h-7 w-7" />
        </div>
        <div>
          <p className="text-foreground font-semibold">No fields yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Click a field type on the left to add your first question.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onAddFirst}>
          <Plus className="mr-2 h-4 w-4" />
          Add first field
        </Button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 p-4">
          {fields.map((field, index) => (
            <FieldCard
              key={field.id}
              field={field}
              index={index}
              isSelected={field.id === selectedId}
              onSelect={() => onSelect(field.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
