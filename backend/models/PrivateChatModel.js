import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema(
  {
    sender: { type: Types.ObjectId, ref: "user", required: [true, "Sender ID required"] },
    message: { type: String, required: [true, "Message required"] },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const privateChatSchema = new Schema(
  {
    student: { type: Types.ObjectId, ref: "user", required: [true, "Student ID is required"] },
    counselor: { type: Types.ObjectId, ref: "user", required: [true, "Counselor ID is required"] },
    request: { type: Types.ObjectId, ref: "chatRequest", required: [true, "Request ID is required"] },
    messages: [{ type: messageSchema, default: [] }],
    isChatActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//create private chat model
export const PrivateChatModel = model("privateChat", privateChatSchema);
