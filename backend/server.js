import exp from "express";
import { config } from "dotenv";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { commonApp } from "./APIs/commonAPI.js";
import { studentApp } from "./APIs/StudentAPI.js";
import { counselorApp } from "./APIs/CounselorAPI.js";
import { adminApp } from "./APIs/AdminAPI.js";
import { forumApp } from "./APIs/ForumAPI.js";
import { meditationApp } from "./APIs/MeditationAPI.js";
import { notificationApp } from "./APIs/NotificationAPI.js";
import { aiSaathiApp } from "./APIs/AiSaathiAPI.js";
config();

//create express app
const app = exp();

//enable cors
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:5173","https://mano-saathi-eight.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

//add cookie parser middeleware
app.use(cookieParser());
//body parser middleware
app.use(exp.json());

//path level middlewares
app.use("/auth", commonApp);
app.use("/student-api", studentApp);
app.use("/counselor-api", counselorApp);
app.use("/admin-api", adminApp);
app.use("/forum-api", forumApp);
app.use("/meditation-api", meditationApp);
app.use("/notification-api", notificationApp);
app.use("/ai-saathi-api", aiSaathiApp);

//connect to db
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log("DB server connected");
    //assign port
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`server listening on ${port}..`));
  } catch (err) {
    console.log("err in db connect", err);
  }
};

connectDB();

//to handle invalid path
app.use((req, res, next) => {
  console.log(req.url);
  res.status(404).json({ message: `path ${req.url} is invalid` });
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.log("error is ", err);
  console.log("Full error:", JSON.stringify(err, null, 2));
  //ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  //CastError
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }

  if (err.status) {
    return res.status(err.status).json({ message: "error occurred", error: err.message });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //send server side error
  res.status(500).json({ message: "error occurred", error: "Server side error" });
});
