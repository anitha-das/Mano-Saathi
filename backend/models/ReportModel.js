import { Schema, model, Types } from "mongoose";

const reportSchema = new Schema(
  {
    reporter: { type: Types.ObjectId, ref: "user", required: [true, "Reporter ID is required"] },
    targetType: { type: String, enum: ["POST", "COMMENT", "REPLY"], required: [true, "Target type is required"] },
    post: { type: Types.ObjectId, ref: "forumPost", required: [true, "Post ID is required"] },
    commentId: { type: Types.ObjectId },
    replyId: { type: Types.ObjectId },
    reason: { type: String, required: [true, "Reason is required"] },
    status: { type: String, enum: ["PENDING", "REVIEWED", "DISMISSED"], default: "PENDING" },
    adminNote: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//create report model
export const ReportModel = model("report", reportSchema);
