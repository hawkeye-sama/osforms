// ─── Field Types ─────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'       // single-line text
  | 'email'      // email with format validation
  | 'number'     // numeric input
  | 'tel'        // phone number
  | 'url'        // URL with format validation
  | 'textarea'   // long-form text / paragraph
  | 'select'     // dropdown single-select
  | 'radio'      // single choice (visible option list)
  | 'checkbox'   // multiple choice (multi-select)
  | 'date'       // date picker
  | 'file'       // file upload
  | 'rating'     // star rating (1–5 by default)
  | 'scale'      // NPS-style numeric scale (e.g. 1–10)
  | 'statement'  // display-only text block, no input
  | 'divider'    // visual separator (classic / stepped mode only)

// ─── Field Option ────────────────────────────────────────────────────────────

export interface FieldOption {
  id: string       // nanoid(6)
  label: string    // display text shown to user
  value: string    // value submitted (defaults to label if not set)
}

// ─── Field Validation ────────────────────────────────────────────────────────

export interface FieldValidation {
  minLength?: number     // text, textarea
  maxLength?: number     // text, textarea
  min?: number           // number, scale, rating
  max?: number           // number, scale, rating
  pattern?: string       // regex string (text, email, tel)
  patternError?: string  // custom error shown on pattern mismatch
  fileTypes?: string[]   // file: e.g. ['image/*', '.pdf']
  maxFileSize?: number   // file: bytes (default 10MB = 10_485_760)
}

// ─── Field Config ────────────────────────────────────────────────────────────

export interface FieldConfig {
  // rating
  maxRating?: number
  ratingIcon?: 'star' | 'heart' | 'thumb'

  // scale
  scaleMin?: number
  scaleMax?: number
  scaleLowLabel?: string   // e.g. "Not likely"
  scaleHighLabel?: string  // e.g. "Very likely"

  // textarea
  rows?: number  // default: 4

  // select
  searchable?: boolean

  // checkbox / radio
  layout?: 'vertical' | 'horizontal' | 'grid'

  // conversational mode behaviour
  // auto-advance to next question after selection (default: true for radio/rating/scale)
  autoAdvance?: boolean
}

// ─── Conditional Logic ───────────────────────────────────────────────────────

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'

export interface Condition {
  fieldId: string
  operator: ConditionOperator
  value?: string | number  // not needed for is_empty / is_not_empty
}

export interface ConditionalLogic {
  action: 'show' | 'hide'
  match: 'all' | 'any'    // AND vs OR
  conditions: Condition[]
}

// ─── Form Field ──────────────────────────────────────────────────────────────

export interface FormField {
  id: string                        // nanoid(8), unique within form
  type: FieldType
  label: string                     // question text shown to user
  description?: string              // helper text below label
  placeholder?: string
  required: boolean                 // default: false
  options?: FieldOption[]           // select, radio, checkbox
  validation?: FieldValidation
  conditionalLogic?: ConditionalLogic
  config?: FieldConfig
}

// ─── Screens ─────────────────────────────────────────────────────────────────

export interface WelcomeScreen {
  enabled: boolean
  title: string
  description?: string
  buttonLabel?: string  // default: "Start"
  imageUrl?: string
}

export interface ThankYouScreen {
  enabled: boolean
  title: string         // default: "Thanks for your response!"
  description?: string
  showSubmissionId?: boolean
  redirectUrl?: string  // falls back to form.redirectUrl if not set
  redirectDelay?: number  // seconds before redirect fires (default: 3)
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface FormThemeColors {
  background?: string
  surface?: string
  primary?: string
  text?: string
  textSecondary?: string
  border?: string
  error?: string
}

export interface FormTheme {
  colors?: FormThemeColors
  fontFamily?: string
  fontSize?: 'sm' | 'md' | 'lg'
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  buttonVariant?: 'solid' | 'outline' | 'ghost'
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface FormSettings {
  showProgressBar?: boolean
  progressBarStyle?: 'bar' | 'steps' | 'percentage'
  allowBack?: boolean               // default: true
  submitLabel?: string              // default: "Submit"
  showKeyboardHints?: boolean       // show "Press Enter ↵" hint (default: true)
  autoScrollToTop?: boolean         // default: true
  animationStyle?: 'slide' | 'fade' | 'none'
  source?: string                   // passed as _source in submission metadata
}

// ─── Form Mode ───────────────────────────────────────────────────────────────

export type FormMode = 'conversational' | 'classic' | 'stepped'

// ─── Root Schema ─────────────────────────────────────────────────────────────

export interface FormSchema {
  mode: FormMode
  fields: FormField[]
  /**
   * Stepped mode only: each inner array is a group of field IDs shown on one page.
   * If omitted in stepped mode, each field gets its own page.
   */
  steps?: string[][]
  theme?: FormTheme
  settings?: FormSettings
  welcomeScreen?: WelcomeScreen
  thankYouScreen?: ThankYouScreen
}
