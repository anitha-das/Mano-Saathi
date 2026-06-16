import { Schema, model, Types } from "mongoose";

const meditationSessionSchema = new Schema(
  {
    student: { type: Types.ObjectId, ref: "user", required: [true, "Student ID is required"] },
    sessionType: {
      type: String,
      enum: ["DEEP_BREATHING", "FOCUS_MEDITATION", "ANXIETY_RELIEF", "RELAXATION"],
      required: [true, "Session type is required"],
    },
    durationInMinutes: { type: Number, required: [true, "Duration is required"] },
    completedAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//create meditation session model
export const MeditationModel = model("meditationSession", meditationSessionSchema);
