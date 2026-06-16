import { Schema, model } from "mongoose";

const quoteSchema = new Schema(
  {
    quote: { type: String, required: [true, "Quote is required"] },
    category: { type: String, default: "Mind Balance" },
    isQuoteActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//create quote model
export const QuoteModel = model("quote", quoteSchema);
