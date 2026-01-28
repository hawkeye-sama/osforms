import mongoose, { Schema, Document, Model } from "mongoose";

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
  submissionCount: number;
  submissionLimit: number;

  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const formSchema = new Schema<IForm>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },

    allowedOrigins: { type: [String], default: [] },
    redirectUrl: { type: String, default: "" },
    honeypotField: { type: String, default: "" },
    recaptchaSecret: { type: String, default: "" },

    rateLimit: { type: Number, default: 10 },
    submissionCount: { type: Number, default: 0 },
    submissionLimit: { type: Number, default: 200 },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Form: Model<IForm> = mongoose.models.Form || mongoose.model<IForm>("Form", formSchema);
export default Form;
