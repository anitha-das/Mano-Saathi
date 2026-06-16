import { Schema, model, Types } from "mongoose";

const replySchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "user", required: [true, "User ID required"] },
    reply: { type: String, required: [true, "Enter a reply"] },
    isReplyActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const commentSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "user", required: [true, "User ID required"] },
    comment: { type: String, required: [true, "Enter a comment"] },
    replies: [{ type: replySchema, default: [] }],
    isCommentActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const forumPostSchema = new Schema(
  {
    student: { type: Types.ObjectId, ref: "user", required: [true, "Student ID is required"] },
    feeling: { type: String, required: [true, "Feeling is required"] },
    content: { type: String, required: [true, "Content is required"] },
    comments: [{ type: commentSchema, default: [] }],
    reactions: [{ type: Types.ObjectId, ref: "user", default: [] }],
    isPostActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//create forum post model
export const ForumPostModel = model("forumPost", forumPostSchema);
