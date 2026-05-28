const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} = require("../controllers/user.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

// Get all users - Accessible by admin and co-admin
router.get("/", protect, authorize("admin", "co-admin"), getAllUsers);

// Routes accessible only by admin
router.post("/", protect, authorize("admin"), createUser);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);
router.patch(
  "/:id/toggle-status",
  protect,
  authorize("admin"),
  toggleUserStatus,
);

module.exports = router;
