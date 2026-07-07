const express = require("express");
const router = express.Router();
const {
  createCategory,
  updateCategory,
  getAllCategories,
  deleteCategory,
} = require("../controllers/category.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

// Public route (Buyers need to view categories)
router.get("/", getAllCategories);

// Protected Routes (Accessible by admin and co-admin)
router.post("/", protect, authorize("admin", "co-admin"), createCategory);
router.put("/:id", protect, authorize("admin", "co-admin"), updateCategory);
router.delete("/:id", protect, authorize("admin", "co-admin"), deleteCategory);

module.exports = router;
