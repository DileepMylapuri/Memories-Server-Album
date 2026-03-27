const express = require("express");
const { upload } = require("../middleware/upload");
const auth = require("../middleware/auth");
const Memory = require('../Models/Memory');
const Category = require("../Models/Category");

const router = express.Router();

router.get("/stats", auth, async (req, res) => {
  const categories = await Category.countDocuments({ user: req.userId });
  const memories = await Memory.find({ user: req.userId });

  const photos = memories.filter(m => m.type === "image").length;
  const videos = memories.filter(m => m.type === "video").length;

  res.json({
    categories,
    totalFiles: memories.length,
    photos,
    videos
  });
});

router.post("/memory", auth, (req, res, next) => {
  upload.array("files", 20)(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary error:", err.message || err);
      return res.status(500).json({ message: err.message || "File upload failed" });
    }
    next();
  });
}, async (req, res) => {
    try {
      const { title, date } = req.body;

      // CHECK DUPLICATE CATEGORY FOR SAME USER
       const existingCategory = await Category.findOne({
          title,
          user: req.userId
       });

        if (existingCategory) {
          return res.status(400).json({
            message: "Category name already exists"
          });
        }

      // Create category
      const category = await Category.create({
        title,
        date,
        user: req.userId
      });

      // Save files
      const memories = await Promise.all(
        req.files.map((file) =>
          Memory.create({
            fileUrl: file.path,
            cloudinaryPublicId: file.filename,
            type: file.mimetype.startsWith("image") ? "image" : "video",
            category: category._id,
            user: req.userId
          })
        )
      );

      res.json({ category, memories });

    } catch (err) {
      console.error("Upload error:", err.message || err);
      res.status(500).json({ message: err.message || "Upload failed" });
    }
  }
);


router.get("/recent", auth, async (req, res) => {
  try {
    const recent = await Memory.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(8);

    res.json(recent);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recent uploads" });
  }
});

module.exports = router;