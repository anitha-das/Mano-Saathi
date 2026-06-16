import { Schema, model } from "mongoose";

const counselorProfileSchema = new Schema(
  {
    qualifications: { type: String },
    certifications: { type: String },
    yearsOfExperience: { type: Number, default: 0 },
    expertise: { type: [String], default: [] },
    availabilityStatus: { type: String, enum: ["AVAILABLE", "BUSY", "OFFLINE"], default: "OFFLINE" },
    isVerified: { type: Boolean, default: true },
    bio: { type: String },
  },
  { _id: false },
);

const moodCheckInSchema = new Schema({
  mood: {
    type: String,
    enum: ["HAPPY", "CALM", "STRESSED", "LONELY", "MOTIVATED", "ANXIOUS"],
    required: [true, "Mood is required"],
  },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const meditationStatsSchema = new Schema(
  {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    lastSessionDate: { type: Date },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String },
    email: { type: String, required: [true, "Email required"], unique: [true, "Email already existed"] },
    password: { type: String, required: [true, "Password required"] },
    role: { type: String, enum: ["STUDENT", "COUNSELOR", "ADMIN"], required: [true, "Invalid role"] },
    profileImageUrl: { type: String },
    isUserActive: { type: Boolean, default: true },
    counselorProfile: { type: counselorProfileSchema },
    meditationStats: { type: meditationStatsSchema, default: () => ({}) },
    moodCheckIns: { type: [moodCheckInSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

//create model
export const UserModel = model("user", userSchema);
