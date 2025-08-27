const express = require("express");
const connectDB = require("./db");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jobRoutes = require("./routes/jobRoutes");
const User = require("./models/User");

dotenv.config();
connectDB();

const app = express();

// ✅ CORS setup (allow frontend domain)
app.use(
  cors({
    origin: "https://jobhunt-pro-client.vercel.app/",       // your Vercel frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Serve frontend if needed
app.use(express.static("public"));

// ✅ Health check
app.get("/", (req, res) => {
  res.send("JobHunt Pro API is running");
});

// ====================== AUTH ROUTES ======================

// ✅ Register Route
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password required");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // Generate token on successful register
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ✅ Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password required");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid credentials");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ✅ Token Verification Route
app.get("/api/auth/verify-token", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ valid: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ valid: true });
  } catch (err) {
    return res
      .status(401)
      .json({ valid: false, message: "Invalid or expired token" });
  }
});

// ====================== JOB ROUTES ======================
app.use("/api/jobs", jobRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});