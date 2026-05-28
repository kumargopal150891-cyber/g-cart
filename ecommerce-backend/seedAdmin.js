require("dotenv").config();
const connectDB = require("./src/config/db");
const User = require("./src/models/User");

const seedAdmin = async () => {
  // Connect to the database
  await connectDB();

  try {
    const adminEmail = "kumar.gopal.abes@gmail.com";
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log("Admin user already exists in the database.");
      process.exit(0);
    }

    // Create the admin user
    await User.create({
      name: "admin",
      email: adminEmail,
      password: "123456", // Use this password to log in initially (you can change it later)
      role: "admin",
    });

    console.log("Admin user successfully created! Password is: 123456");
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin user:", error.message);
    process.exit(1);
  }
};

seedAdmin();
