import mongoose, { Model, Schema } from 'mongoose';

/**
 * Fixed-window rate limit counter shared across serverless instances.
 * `_id` is `${key}:${windowStart}`; Mongo's TTL monitor drops expired windows.
 */
export interface IRateLimitCounter {
  _id: string;
  count: number;
  expiresAt: Date;
}

const rateLimitCounterSchema = new Schema<IRateLimitCounter>(
  {
    _id: { type: String, required: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);

rateLimitCounterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimitCounter: Model<IRateLimitCounter> =
  mongoose.models.RateLimitCounter ||
  mongoose.model<IRateLimitCounter>('RateLimitCounter', rateLimitCounterSchema);
export default RateLimitCounter;
