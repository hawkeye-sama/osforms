import mongoose, { Document, Model, Schema } from "mongoose";

export interface IIntegrationLog extends Document {
  _id: mongoose.Types.ObjectId;
  integrationId: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId;
  status: "success" | "failed";
  message: string;
  createdAt: Date;
}

const integrationLogSchema = new Schema<IIntegrationLog>(
  {
    integrationId: { type: Schema.Types.ObjectId, ref: "Integration", required: true, index: true },
    submissionId: { type: Schema.Types.ObjectId, ref: "Submission", required: true, index: true },
    status: { type: String, enum: ["success", "failed"], required: true },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

const IntegrationLog: Model<IIntegrationLog> = mongoose.models.IntegrationLog ||
  mongoose.model<IIntegrationLog>("IntegrationLog", integrationLogSchema);
export default IntegrationLog;
