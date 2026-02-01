import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEmailVerification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  email: string;
  code: string; // 6-digit OTP
  createdAt: Date;
  expiresAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      length: 6,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
emailVerificationSchema.index({ email: 1 });
emailVerificationSchema.index({ expiresAt: 1 });

const EmailVerification: Model<IEmailVerification> =
  mongoose.models.EmailVerification ||
  mongoose.model<IEmailVerification>(
    'EmailVerification',
    emailVerificationSchema
  );

export default EmailVerification;
