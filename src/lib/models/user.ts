import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;

  // Onboarding profile
  onboardingComplete: boolean;
  fullName: string;
  website: string;
  company: string;
  role: 'developer' | 'agency' | 'startup' | 'other';

  // Monthly submission tracking
  monthlySubmissionCount: number;
  monthlySubmissionLimit: number;
  currentBillingMonth: string; // "2026-01" format (UTC)

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },

    onboardingComplete: { type: Boolean, default: false },
    fullName: { type: String, default: '' },
    website: { type: String, default: '' },
    company: { type: String, default: '' },
    role: {
      type: String,
      enum: ['developer', 'agency', 'startup', 'other'],
      default: 'developer',
    },

    // Monthly submission tracking
    monthlySubmissionCount: { type: Number, default: 0 },
    monthlySubmissionLimit: { type: Number, default: 100 },
    currentBillingMonth: { type: String, default: '' },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
