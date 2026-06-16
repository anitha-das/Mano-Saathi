import exp from "express";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { ForumPostModel } from "../models/ForumPostModel.js";
import { ReportModel } from "../models/ReportModel.js";
import { QuoteModel } from "../models/QuoteModel.js";
import { NotificationModel } from "../models/NotificationModel.js";

export const adminApp = exp.Router();

adminApp.get("/users", verifyToken("ADMIN"), async (req, res) => {
  const users = await UserModel.find({ role: { $ne: "ADMIN" } }).select("-password");

  res.status(200).json({ message: "users", payload: users });
});

adminApp.patch("/users", verifyToken("ADMIN"), async (req, res) => {
  const { userId, isUserActive } = req.body;

  const user = await UserModel.findOneAndUpdate(
    { _id: userId, role: { $ne: "ADMIN" } },
    { $set: { isUserActive } },
    { new: true },
  ).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ message: "User status updated", payload: user });
});

adminApp.get("/counselors", verifyToken("ADMIN"), async (req, res) => {
  const counselors = await UserModel.find({ role: "COUNSELOR" }).select("-password");

  res.status(200).json({ message: "counselors", payload: counselors });
});

adminApp.patch("/counselors", verifyToken("ADMIN"), async (req, res) => {
  const { counselorId, isVerified } = req.body;

  const counselor = await UserModel.findOneAndUpdate(
    { _id: counselorId, role: "COUNSELOR" },
    { $set: { "counselorProfile.isVerified": isVerified } },
    { new: true },
  ).select("-password");

  if (!counselor) {
    return res.status(404).json({ message: "Counselor not found" });
  }

  res.status(200).json({ message: "Counselor verification updated", payload: counselor });
});

adminApp.get("/articles", verifyToken("ADMIN"), async (req, res) => {
  const articles = await ArticleModel.find().populate("counselor", "firstName lastName email role profileImageUrl isUserActive counselorProfile");

  res.status(200).json({ message: "articles", payload: articles });
});

adminApp.put("/articles", verifyToken("ADMIN"), async (req, res) => {
  const { articleId, title, category, content } = req.body;

  const article = await ArticleModel.findByIdAndUpdate(articleId, { $set: { title, category, content } }, { new: true })
    .populate("counselor", "firstName lastName email role profileImageUrl isUserActive counselorProfile");

  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }

  res.status(200).json({ message: "Article updated", payload: article });
});

adminApp.patch("/articles", verifyToken("ADMIN"), async (req, res) => {
  const { articleId, isArticleActive } = req.body;

  const article = await ArticleModel.findByIdAndUpdate(articleId, { $set: { isArticleActive } }, { new: true })
    .populate("counselor", "firstName lastName email role profileImageUrl isUserActive counselorProfile");

  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }

  res.status(200).json({ message: "Article status updated", payload: article });
});

adminApp.get("/posts", verifyToken("ADMIN"), async (req, res) => {
  const posts = await ForumPostModel.find()
    .populate("student", "firstName lastName email role isUserActive")
    .populate("comments.user", "firstName lastName email role")
    .populate("comments.replies.user", "firstName lastName email role");

  res.status(200).json({ message: "posts", payload: posts });
});

adminApp.patch("/posts", verifyToken("ADMIN"), async (req, res) => {
  const { postId, isPostActive } = req.body;

  const post = await ForumPostModel.findByIdAndUpdate(postId, { $set: { isPostActive } }, { new: true });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.status(200).json({ message: "Post status updated", payload: post });
});

adminApp.get("/reports", verifyToken("ADMIN"), async (req, res) => {
  const reports = await ReportModel.find()
    .populate("reporter", "firstName lastName email role")
    .populate("post", "feeling content isPostActive");

  res.status(200).json({ message: "reports", payload: reports });
});

adminApp.patch("/reports", verifyToken("ADMIN"), async (req, res) => {
  const { reportId, status, adminNote } = req.body;

  const report = await ReportModel.findByIdAndUpdate(reportId, { $set: { status, adminNote } }, { new: true });

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  res.status(200).json({ message: "Report updated", payload: report });
});

adminApp.post("/quotes", verifyToken("ADMIN"), async (req, res) => {
  const quoteDoc = new QuoteModel(req.body);
  await quoteDoc.save();

  res.status(201).json({ message: "Quote created", payload: quoteDoc });
});

adminApp.get("/quotes", verifyToken("ADMIN"), async (req, res) => {
  const quotes = await QuoteModel.find();

  res.status(200).json({ message: "quotes", payload: quotes });
});

adminApp.put("/quotes", verifyToken("ADMIN"), async (req, res) => {
  const { quoteId, quote, category } = req.body;

  const quoteDoc = await QuoteModel.findByIdAndUpdate(quoteId, { $set: { quote, category } }, { new: true });

  if (!quoteDoc) {
    return res.status(404).json({ message: "Quote not found" });
  }

  res.status(200).json({ message: "Quote updated", payload: quoteDoc });
});

adminApp.patch("/quotes", verifyToken("ADMIN"), async (req, res) => {
  const { quoteId, isQuoteActive } = req.body;

  const quoteDoc = await QuoteModel.findByIdAndUpdate(quoteId, { $set: { isQuoteActive } }, { new: true });

  if (!quoteDoc) {
    return res.status(404).json({ message: "Quote not found" });
  }

  res.status(200).json({ message: "Quote status updated", payload: quoteDoc });
});

adminApp.get("/activity", verifyToken("ADMIN"), async (req, res) => {
  const students = await UserModel.countDocuments({ role: "STUDENT" });
  const counselors = await UserModel.countDocuments({ role: "COUNSELOR" });
  const pendingReports = await ReportModel.countDocuments({ status: "PENDING" });
  const activePosts = await ForumPostModel.countDocuments({ isPostActive: true });
  const articles = await ArticleModel.countDocuments({ isArticleActive: true });
  const notifications = await NotificationModel.countDocuments();

  res.status(200).json({ message: "activity", payload: { students, counselors, pendingReports, activePosts, articles, notifications } });
});
