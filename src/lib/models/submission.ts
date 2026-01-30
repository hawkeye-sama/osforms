import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISubmission extends Document {
  _id: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  data: Record<string, unknown>;
  metadata: {
    ip: string;
    userAgent: string;
    origin: string;
  };
  createdAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    metadata: {
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
      origin: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Index for querying recent submissions
submissionSchema.index({ formId: 1, createdAt: -1 });
// Index for user monthly submission queries
submissionSchema.index({ userId: 1, createdAt: -1 });

const Submission: Model<ISubmission> = mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", submissionSchema);
export default Submission;
