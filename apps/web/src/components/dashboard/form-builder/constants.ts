import type { FieldType } from '@osforms/types';

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  icon: string; // lucide icon name
  description: string;
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  { type: 'text', label: 'Short Text', icon: 'Type', description: 'Single line text input' },
  { type: 'email', label: 'Email', icon: 'Mail', description: 'Email address input' },
  { type: 'textarea', label: 'Long Text', icon: 'AlignLeft', description: 'Multi-line text area' },
  { type: 'number', label: 'Number', icon: 'Hash', description: 'Numeric input' },
  { type: 'tel', label: 'Phone', icon: 'Phone', description: 'Phone number input' },
  { type: 'url', label: 'URL', icon: 'Link', description: 'Website URL input' },
  { type: 'select', label: 'Dropdown', icon: 'ChevronDown', description: 'Single select dropdown' },
  { type: 'radio', label: 'Multiple Choice', icon: 'CircleDot', description: 'Select one from a list' },
  { type: 'checkbox', label: 'Checkboxes', icon: 'CheckSquare', description: 'Select multiple options' },
  { type: 'rating', label: 'Rating', icon: 'Star', description: 'Star rating input' },
  { type: 'scale', label: 'Scale', icon: 'BarChart2', description: 'Numeric scale (e.g. NPS)' },
  { type: 'statement', label: 'Statement', icon: 'MessageSquare', description: 'Display-only text block' },
];

export const FIELD_TYPE_DEFAULTS: Record<FieldType, Partial<import('@osforms/types').FormField>> = {
  text: { required: false },
  email: { required: false },
  textarea: { required: false, config: { rows: 4 } },
  number: { required: false },
  tel: { required: false },
  url: { required: false },
  select: {
    required: false,
    options: [
      { id: crypto.randomUUID(), label: 'Option 1', value: 'option_1' },
      { id: crypto.randomUUID(), label: 'Option 2', value: 'option_2' },
    ],
  },
  radio: {
    required: false,
    options: [
      { id: crypto.randomUUID(), label: 'Option 1', value: 'option_1' },
      { id: crypto.randomUUID(), label: 'Option 2', value: 'option_2' },
    ],
    config: { autoAdvance: true },
  },
  checkbox: {
    required: false,
    options: [
      { id: crypto.randomUUID(), label: 'Option 1', value: 'option_1' },
      { id: crypto.randomUUID(), label: 'Option 2', value: 'option_2' },
    ],
  },
  rating: { required: false, config: { maxRating: 5, ratingIcon: 'star', autoAdvance: true } },
  scale: {
    required: false,
    config: { scaleMin: 1, scaleMax: 10, scaleLowLabel: 'Not likely', scaleHighLabel: 'Very likely', autoAdvance: true },
  },
  statement: { required: false },
  date: { required: false },
  file: { required: false },
  divider: { required: false },
};
