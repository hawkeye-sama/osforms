// Main component
export { OSForm } from './OSForm';
export type { OSFormProps } from './OSForm';

// Hooks (for advanced usage)
export { useFormSchema } from './hooks/useFormSchema';
export { useFormState } from './hooks/useFormState';
export type { FormState, FormStateActions } from './hooks/useFormState';

// Renderers (for custom layouts)
export { ClassicRenderer } from './renderers/ClassicRenderer';
export { ConversationalRenderer } from './renderers/ConversationalRenderer';

// Types re-exported for convenience
export type {
  ConditionalLogic,
  FieldConfig,
  FieldOption,
  FieldType,
  FieldValidation,
  FormField,
  FormMode,
  FormSchema,
  FormTheme,
  ThankYouScreen,
  WelcomeScreen,
} from '@osforms/types';
