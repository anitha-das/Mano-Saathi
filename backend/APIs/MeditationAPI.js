import exp from "express";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { MeditationModel } from "../models/MeditationModel.js";
import { UserModel } from "../models/UserModel.js";
export const meditationApp = exp.Router();

const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (firstDate, secondDate) => firstDate?.getTime() === secondDate?.getTime();

//Complete meditation session
meditationApp.post("/sessions", verifyToken("STUDENT"), async (req, res) => {
  const { sessionType, durationInMinutes } = req.body;

  const sessionDoc = new MeditationModel({ student: req.user.id, sessionType, durationInMinutes });
  await sessionDoc.save();

  const user = await UserModel.findById(req.user.id).select("-password");
  const today = getStartOfDay(new Date());
  const lastSessionDate = user.meditationStats?.lastSessionDate ? getStartOfDay(user.meditationStats.lastSessionDate) : null;
  const yesterday = getStartOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

  user.meditationStats.totalSessions = (user.meditationStats.totalSessions || 0) + 1;

  if (!lastSessionDate) {
    user.meditationStats.currentStreak = 1;
  } else if (isSameDay(lastSessionDate, today)) {
    user.meditationStats.currentStreak = user.meditationStats.currentStreak || 1;
  } else if (isSameDay(lastSessionDate, yesterday)) {
    user.meditationStats.currentStreak = (user.meditationStats.currentStreak || 0) + 1;
  } else {
    user.meditationStats.currentStreak = 1;
  }

  user.meditationStats.lastSessionDate = today;

  if ((user.meditationStats.currentStreak || 0) > (user.meditationStats.longestStreak || 0)) {
    user.meditationStats.longestStreak = user.meditationStats.currentStreak;
  }

  await user.save();

  res.status(201).json({ message: "Meditation session completed", payload: { session: sessionDoc, stats: user.meditationStats } });
});

//Read own meditation history
meditationApp.get("/sessions", verifyToken("STUDENT"), async (req, res) => {
  const sessions = await MeditationModel.find({ student: req.user.id }).sort({ completedAt: -1 });

  res.status(200).json({ message: "sessions", payload: sessions });
});

//Read own meditation stats
meditationApp.get("/stats", verifyToken("STUDENT"), async (req, res) => {
  const user = await UserModel.findById(req.user.id).select("meditationStats");

  res.status(200).json({ message: "stats", payload: user.meditationStats });
});
