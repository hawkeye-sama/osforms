import mongoose, { Document, Model, Schema } from 'mongoose';

export type NotificationType =
  | 'integration_failure'
  | 'system'
  | 'warning'
  | 'submission';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: {
    formId?: string;
    formName?: string;
    submissionId?: string;
    failedIntegrations?: Array<{
      name: string;
      type: string;
      error: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['integration_failure', 'system', 'warning', 'submission'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
