import { Schema, model, Types } from "mongoose";

const chatRequestSchema = new Schema(
  {
    student: { type: Types.ObjectId, ref: "user", required: [true, "Student ID is required"] },
    counselor: { type: Types.ObjectId, ref: "user", required: [true, "Counselor ID is required"] },
    message: { type: String },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//create chat request model
export const ChatRequestModel = model("chatRequest", chatRequestSchema);
