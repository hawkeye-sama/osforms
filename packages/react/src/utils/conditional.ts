import type { Condition, ConditionalLogic, FormField } from '@osforms/types';

function evaluateCondition(
  condition: Condition,
  answers: Record<string, unknown>
): boolean {
  const value = answers[condition.fieldId];

  switch (condition.operator) {
    case 'equals':
      return String(value ?? '') === String(condition.value ?? '');
    case 'not_equals':
      return String(value ?? '') !== String(condition.value ?? '');
    case 'contains':
      return String(value ?? '').includes(String(condition.value ?? ''));
    case 'not_contains':
      return !String(value ?? '').includes(String(condition.value ?? ''));
    case 'greater_than':
      return Number(value) > Number(condition.value);
    case 'less_than':
      return Number(value) < Number(condition.value);
    case 'is_empty':
      return value === undefined || value === null || value === '';
    case 'is_not_empty':
      return value !== undefined && value !== null && value !== '';
    default:
      return true;
  }
}

function evaluateLogic(
  logic: ConditionalLogic,
  answers: Record<string, unknown>
): boolean {
  const results = logic.conditions.map((c) => evaluateCondition(c, answers));
  const conditionMet =
    logic.match === 'all' ? results.every(Boolean) : results.some(Boolean);
  return logic.action === 'show' ? conditionMet : !conditionMet;
}

export function isFieldVisible(
  field: FormField,
  answers: Record<string, unknown>
): boolean {
  if (!field.conditionalLogic) return true;
  return evaluateLogic(field.conditionalLogic, answers);
}

export function getVisibleFields(
  fields: FormField[],
  answers: Record<string, unknown>
): FormField[] {
  return fields.filter(
    (f) => f.type !== 'divider' && isFieldVisible(f, answers)
  );
}
