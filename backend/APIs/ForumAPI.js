import exp from "express";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { ForumPostModel } from "../models/ForumPostModel.js";
import { ReportModel } from "../models/ReportModel.js";
import { NotificationModel } from "../models/NotificationModel.js";
export const forumApp = exp.Router();

//Create anonymous post
forumApp.post("/posts", verifyToken("STUDENT"), async (req, res) => {
  const { feeling, content } = req.body;

  const postDoc = new ForumPostModel({ student: req.user.id, feeling, content });
  await postDoc.save();

  res.status(201).json({ message: "Post created", payload: postDoc });
});

//Read community posts
forumApp.get("/posts", verifyToken("STUDENT", "COUNSELOR", "ADMIN"), async (req, res) => {
  const posts = await ForumPostModel.find({ isPostActive: true })
    .populate("comments.user", "firstName lastName role profileImageUrl counselorProfile")
    .populate("comments.replies.user", "firstName lastName role profileImageUrl counselorProfile");

  res.status(200).json({ message: "posts", payload: posts });
});

//Read one post
forumApp.get("/posts/:id", verifyToken("STUDENT", "COUNSELOR", "ADMIN"), async (req, res) => {
  const post = await ForumPostModel.findById(req.params.id)
    .populate("comments.user", "firstName lastName role profileImageUrl counselorProfile")
    .populate("comments.replies.user", "firstName lastName role profileImageUrl counselorProfile");

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (req.user.role !== "ADMIN" && post.isPostActive === false) {
    return res.status(403).json({ message: "Post is not available" });
  }

  res.status(200).json({ message: "post", payload: post });
});

//Add comment to post
forumApp.put("/comments", verifyToken("STUDENT", "COUNSELOR"), async (req, res) => {
  //get body from req
  const { postId, comment } = req.body;
  //check post
  const postDocument = await ForumPostModel.findOne({ _id: postId, isPostActive: true });

  //if post not found
  if (!postDocument) {
    return res.status(404).json({ message: "Post not found" });
  }

  //get user id
  const userId = req.user?.id;
  //add comment to comments array of postDocument
  postDocument.comments.push({ user: userId, comment: comment });
  //save
  await postDocument.save();

  if (String(postDocument.student) !== String(userId)) {
    const notificationDoc = new NotificationModel({
      user: postDocument.student,
      title: "New community response",
      message: "Someone responded supportively to your anonymous post",
      type: "COMMUNITY_ALERT",
      actionPath: `/student-profile/community?postId=${postDocument._id}`,
    });
    await notificationDoc.save();
  }

  //send res
  res.status(200).json({ message: "Comment added successfully", payload: postDocument });
});

//Add reply to comment
forumApp.put("/replies", verifyToken("STUDENT", "COUNSELOR"), async (req, res) => {
  const { postId, commentId, reply } = req.body;

  const postDocument = await ForumPostModel.findOne({ _id: postId, isPostActive: true });

  if (!postDocument) {
    return res.status(404).json({ message: "Post not found" });
  }

  const commentOfPost = postDocument.comments.id(commentId);

  if (!commentOfPost) {
    return res.status(404).json({ message: "Comment not found" });
  }

  commentOfPost.replies.push({ user: req.user.id, reply });
  await postDocument.save();

  res.status(200).json({ message: "Reply added successfully", payload: postDocument });
});

//Support reaction
forumApp.patch("/support", verifyToken("STUDENT", "COUNSELOR"), async (req, res) => {
  const { postId } = req.body;

  const postDocument = await ForumPostModel.findOne({ _id: postId, isPostActive: true });

  if (!postDocument) {
    return res.status(404).json({ message: "Post not found" });
  }

  const userId = req.user.id;
  const alreadySupported = postDocument.reactions.some((id) => String(id) === String(userId));

  if (alreadySupported) {
    postDocument.reactions = postDocument.reactions.filter((id) => String(id) !== String(userId));
  } else {
    postDocument.reactions.push(userId);
  }

  await postDocument.save();

  res.status(200).json({ message: alreadySupported ? "Support removed" : "Support added", payload: postDocument });
});

//Report harmful content
forumApp.post("/reports", verifyToken("STUDENT", "COUNSELOR"), async (req, res) => {
  const { targetType, post, commentId, replyId, reason } = req.body;

  const postDocument = await ForumPostModel.findById(post);

  if (!postDocument) {
    return res.status(404).json({ message: "Post not found" });
  }

  const reportDoc = new ReportModel({ reporter: req.user.id, targetType, post, commentId, replyId, reason });
  await reportDoc.save();

  res.status(201).json({ message: "Report submitted", payload: reportDoc });
});
