import mongoose, { Document, Model, Schema } from 'mongoose';
import type { FormSchema } from '@osforms/types';

export interface IForm extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  slug: string; // nanoid, used in endpoint URL

  // Settings
  allowedOrigins: string[];
  redirectUrl: string;
  honeypotField: string;
  recaptchaSecret: string;

  // Limits
  rateLimit: number; // requests per minute per IP

  active: boolean;

  // Form builder schema — null for headless forms (no builder used)
  formSchema: FormSchema | null;

  createdAt: Date;
  updatedAt: Date;
}

const formSchema = new Schema<IForm>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },

    allowedOrigins: { type: [String], default: [] },
    redirectUrl: { type: String, default: '' },
    honeypotField: { type: String, default: '' },
    recaptchaSecret: { type: String, default: '' },

    rateLimit: { type: Number, default: 10 },

    active: { type: Boolean, default: true },

    // Stores the FormSchema JSON when user uses the form builder.
    // null means headless — form accepts any submission shape.
    formSchema: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

const Form: Model<IForm> =
  mongoose.models.Form || mongoose.model<IForm>('Form', formSchema);
export default Form;
