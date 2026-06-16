import { Schema, model, Types } from "mongoose";

const notificationSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "user", required: [true, "User ID is required"] },
    title: { type: String, required: [true, "Title is required"] },
    message: { type: String, required: [true, "Message is required"] },
    type: {
      type: String,
      enum: ["COUNSELOR_REPLY", "COMMUNITY_ALERT", "MEDITATION_REMINDER", "DAILY_QUOTE", "REPORT_UPDATE", "CHAT_REQUEST"],
      default: "COMMUNITY_ALERT",
    },
    actionPath: { type: String },
    isRead: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//create notification model
export const NotificationModel = model("notification", notificationSchema);
