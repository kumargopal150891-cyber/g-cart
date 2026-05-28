const fs = require("fs");
const path = require("path");

// 1. Define the required folder structure
const folders = [
  "src",
  "src/config",
  "src/controllers",
  "src/middlewares",
  "src/models",
];

// 2. Create folders if they don't exist
folders.forEach((folder) => {
  const dirPath = path.join(__dirname, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created folder: ${folder}`);
  }
});

// 3. Map of loose files to move from root to their proper destination
const filesToMove = {
  "db.js": "src/config/db.js",
  "User.js": "src/models/User.js",
  "auth.controller.js": "src/controllers/auth.controller.js",
  "auth.middleware.js": "src/middlewares/auth.middleware.js",
  "role.middleware.js": "src/middlewares/role.middleware.js",
};

// 4. Move files
for (const [oldName, newPath] of Object.entries(filesToMove)) {
  const oldFullPath = path.join(__dirname, oldName);
  const newFullPath = path.join(__dirname, newPath);

  if (fs.existsSync(oldFullPath)) {
    fs.renameSync(oldFullPath, newFullPath);
    console.log(`Moved ${oldName} to ${newPath}`);
  }
}

console.log("Folder structure fixed successfully!");
