// Submission metadata — extended with source tracking for embed/platform tracking

export type SubmissionSource =
  | 'api'
  | 'react'
  | 'embed'
  | 'webflow'
  | 'wordpress'
  | 'custom';

export interface SubmissionMetadata {
  ip: string;
  userAgent: string;
  origin: string;
  source?: SubmissionSource | string; // string to allow custom values
}
