import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { QuoteModel } from "../models/QuoteModel.js";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";
const { sign } = jwt;
export const commonApp = exp.Router();
config();

//Route for register
commonApp.post("/users", upload.single("profileImageUrl"), async (req, res, next) => {
  let cloudinaryResult;
  try {
    const allowedRoles = ["STUDENT", "COUNSELOR"];
    const newUser = req.body;

    // Validate role
    if (!allowedRoles.includes(newUser.role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check duplicate email
    const existingUser = await UserModel.findOne({ email: newUser.email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (newUser.role === "COUNSELOR") {
      newUser.counselorProfile = {
        qualifications: newUser.qualifications,
        certifications: newUser.certifications,
        yearsOfExperience: newUser.yearsOfExperience || 0,
        expertise: newUser.expertise ? String(newUser.expertise).split(",").map((item) => item.trim()) : [],
        availabilityStatus: "OFFLINE",
        isVerified: true,
        bio: newUser.bio,
      };
      delete newUser.qualifications;
      delete newUser.certifications;
      delete newUser.yearsOfExperience;
      delete newUser.expertise;
      delete newUser.bio;
    }

    // Upload image if provided
    if (req.file) {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      newUser.profileImageUrl = cloudinaryResult?.secure_url;
    }

    // Hash password
    newUser.password = await hash(newUser.password, 12);

    // Save user
    const newUserDoc = new UserModel(newUser);
    await newUserDoc.save();

    res.status(201).json({ message: "User created" });
  } catch (err) {
    // Cleanup Cloudinary upload safely
    if (cloudinaryResult?.public_id) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
    }

    // Handle duplicate key error from Mongo
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Pass other errors to Express error handler
    next(err);
  }
});

//Route for login (STUDENT, COUNSELOR AND ADMIN)
commonApp.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email: email });

  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }

  if (user.isUserActive === false) {
    return res.status(403).json({ message: "Your account is blocked" });
  }

  const isMatched = await compare(password, user.password);

  if (!isMatched) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const signedToken = sign(
    {
      id: user._id,
      email: email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" },
  );

  res.cookie("token", signedToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  let userObj = user.toObject();
  delete userObj.password;

  res.status(200).json({ message: "Login successful", payload: userObj });
});

//Route for Logout
commonApp.get("/logout", (req, res) => {
  //delete token from cookie storage
  res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "lax" });
  //send res
  res.status(200).json({ message: "Logout successful" });
});

//Page refresh
commonApp.get("/check-auth", verifyToken("STUDENT", "COUNSELOR", "ADMIN"), (req, res) => {
  res.status(200).json({ message: "authenticated", payload: req.user });
});

//Change password
commonApp.put("/password", verifyToken("STUDENT", "COUNSELOR", "ADMIN"), async (req, res) => {
  //Get current and new password from request body
  const { currentPassword, newPassword } = req.body;
  // No change if both are same
  if (currentPassword === newPassword) {
    return res.status(400).json({ message: "Current password and New password shouldn't be the same" });
  }
  //Get user from db
  const user = await UserModel.findById(req.user.id);
  //Check if both matches
  const isMatched = await compare(currentPassword, user.password);
  if (!isMatched) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }
  // Hash the new updated password
  const hashedPassword = await hash(newPassword, 12);
  // Replace old password with new hashed password
  user.password = hashedPassword;
  // Save
  await user.save();
  // Send response
  res.status(200).json({ message: "Password updated successfully" });
});

//Daily quote
commonApp.get("/daily-quote", async (req, res) => {
  const quotes = await QuoteModel.find({ isQuoteActive: true });

  if (quotes.length === 0) {
    return res.status(200).json({ message: "quote", payload: { quote: "Small daily efforts create meaningful growth.", category: "Mind Balance" } });
  }

  const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const quote = quotes[dayNumber % quotes.length];

  res.status(200).json({ message: "quote", payload: quote });
});
