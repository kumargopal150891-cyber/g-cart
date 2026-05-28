require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

// Import Middlewares & Controllers
const { protect } = require("./src/middlewares/auth.middleware");
const { authorize } = require("./src/middlewares/role.middleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
} = require("./src/controllers/auth.controller");

// Import Routes
const userRoutes = require("./src/routes/user.routes");

// Initialize App & DB
const app = express();
connectDB();

// Global Middlewares
app.use(express.json({ limit: "10mb" })); // Increased limit for Base64 image payloads
app.use(cors()); // Allows your Angular frontend to make requests

// --- ROUTES ---

// 1. Authentication Routes (Public)
const authRouter = express.Router();
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.put("/profile", protect, updateProfile);
app.use("/api/auth", authRouter);

// User Management Routes
app.use("/api/users", userRoutes);

// 2. Admin Routes (Protected & Restricted to Admins)
const adminRouter = express.Router();
adminRouter.post("/add-product", protect, authorize("admin"), (req, res) => {
  // Logic for adding a product goes here
  res.json({ message: "Product added successfully by admin" });
});
app.use("/api/admin", adminRouter);

// 3. Shop/Buyer Routes (Public or Protected depending on action)
const shopRouter = express.Router();
shopRouter.get("/products", (req, res) => {
  // Logic to fetch products for everyone
  res.json({ message: "List of products for the frontend" });
});
app.use("/api/shop", shopRouter);

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
