const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, role, password, image } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const finalPassword = password || crypto.randomBytes(8).toString("hex");

    const user = await User.create({
      name,
      email,
      role,
      password: finalPassword,
      image: image || "",
    });

    try {
      await sendEmail({
        email: user.email,
        subject: "Your New Account Credentials",
        message: `Hello ${user.name},\n\nYour account has been created. You can login with the following password: ${finalPassword}\n\nPlease update your password after logging in.\n`,
      });
    } catch (emailError) {
      console.error("Email could not be sent:", emailError);
      // Decide if you want to fail the whole request or just log the error
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      image: user.image,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    if (req.body.hasOwnProperty("image")) {
      user.image = req.body.image;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      image: updatedUser.image,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User has been ${user.isActive ? "activated" : "deactivated"}.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
