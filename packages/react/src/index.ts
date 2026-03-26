// Main component
export { OSForm } from './OSForm'
export type { OSFormProps } from './OSForm'

// Hooks (for advanced usage)
export { useFormSchema } from './hooks/useFormSchema'
export { useFormState } from './hooks/useFormState'
export type { FormState, FormStateActions } from './hooks/useFormState'

// Renderers (for custom layouts)
export { ConversationalRenderer } from './renderers/ConversationalRenderer'
export { ClassicRenderer } from './renderers/ClassicRenderer'

// Types re-exported for convenience
export type {
  FormSchema,
  FormField,
  FormMode,
  FormTheme,
  FieldType,
  FieldOption,
  FieldValidation,
  FieldConfig,
  ConditionalLogic,
  WelcomeScreen,
  ThankYouScreen,
} from '@osforms/types'
