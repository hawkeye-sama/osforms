import mongoose, { Document, Model, Schema } from 'mongoose';

export type IntegrationType = 'EMAIL' | 'WEBHOOK' | 'GOOGLE_SHEETS';

export interface IIntegration extends Document {
  _id: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  type: IntegrationType;
  name: string;
  configEncrypted: string; // AES-256-GCM encrypted JSON
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const integrationSchema = new Schema<IIntegration>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['EMAIL', 'WEBHOOK', 'GOOGLE_SHEETS'],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    configEncrypted: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Integration: Model<IIntegration> =
  mongoose.models.Integration ||
  mongoose.model<IIntegration>('Integration', integrationSchema);
export default Integration;
