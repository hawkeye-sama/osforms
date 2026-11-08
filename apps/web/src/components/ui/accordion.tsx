'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

import { cn } from '@/lib/utils';

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function AccordionItem({
  question,
  answer,
  isOpen,
  onClick,
}: AccordionItemProps) {
  const panelId = useId();

  return (
    <div className="border-border/50 border-b last:border-0">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between py-6 text-left transition-all"
      >
        <span className="text-foreground text-lg font-medium">{question}</span>
        <ChevronDown
          className={cn(
            'text-muted-foreground h-5 w-5 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {/* The answer is always in the DOM (so crawlers and AI answer engines can
          read it); it's collapsed visually with a grid-rows transition. */}
      <div
        id={panelId}
        role="region"
        inert={!isOpen}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="text-muted-foreground pb-6 text-base leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full">
      {items.map((item, i) => (
        <AccordionItem
          key={item.question}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === i}
          onClick={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}
