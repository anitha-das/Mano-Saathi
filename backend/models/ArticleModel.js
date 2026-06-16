import { Schema, model, Types } from "mongoose";

const articleSchema = new Schema(
  {
    counselor: { type: Types.ObjectId, ref: "user", required: [true, "Counselor ID is required"] },
    title: { type: String, required: [true, "Title is required"] },
    category: { type: String, required: [true, "Category is required"] },
    content: { type: String, required: [true, "Content is required"] },
    isArticleActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//create article model
export const ArticleModel = model("article", articleSchema);
