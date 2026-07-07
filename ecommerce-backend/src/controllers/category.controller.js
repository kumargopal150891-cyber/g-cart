const Category = require("../models/Category");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).populate(
      "parent_id",
      "name slug",
    );
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, parent_id, slug } = req.body;

    const category = await Category.create({
      name,
      parent_id: parent_id || null,
      slug,
    });

    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create category", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id, slug } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name;
    if (parent_id !== undefined) category.parent_id = parent_id || null;
    if (slug) category.slug = slug;

    const updatedCategory = await category.save();
    res.json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update category", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Remove parent reference from any children of this category
    await Category.updateMany({ parent_id: id }, { parent_id: null });
    await category.deleteOne();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete category", error: error.message });
  }
};
