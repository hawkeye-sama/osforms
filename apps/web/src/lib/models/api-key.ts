import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Read-only API key for pulling submissions server-to-server.
 * Only the SHA-256 hash is stored — the plaintext key is shown once at creation.
 */
export interface IApiKey extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  prefix: string; // First chars of the key, for display (e.g. "osf_live_AbCd")
  keyHash: string;
  formIds: mongoose.Types.ObjectId[]; // Forms this key may read
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    prefix: { type: String, required: true },
    keyHash: { type: String, required: true, unique: true },
    formIds: [{ type: Schema.Types.ObjectId, ref: 'Form' }],
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ApiKey: Model<IApiKey> =
  mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', apiKeySchema);
export default ApiKey;
