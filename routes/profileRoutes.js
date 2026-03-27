const express = require("express");
const User = require("../Models/User");
const auth = require("../middleware/auth");
const { upload, cloudinary } = require("../middleware/upload");
const Category = require("../Models/Category");
const Memory = require("../Models/Memory");

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});


// Gallery route
router.get("/gallery", auth, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.userId });

    const result = await Promise.all(
      categories.map(async (category) => {
        const files = await Memory.find({
          category: category._id,
          user: req.userId
        }).sort({ createdAt: -1 });

        return {
          _id: category._id,
          title: category.title,
          date: category.date,
          files
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch gallery" });
  }
});


// profiles data
router.put(
  "/profile",
  auth,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  async (req, res) => {
    try {

      console.log("BODY:", req.body);
      console.log("FILES:", req.files);

      const username = req.body?.username;
      const bio = req.body?.bio;

      const updateData = {};

      if (username) updateData.username = username;
      if (bio) updateData.bio = bio;

      if (req.files?.profileImage) {
        updateData.profileImage = req.files.profileImage[0].path;
      }

      if (req.files?.coverImage) {
        updateData.coverImage = req.files.coverImage[0].path;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        updateData,
        { new: true }
      ).select("-password");

      res.json(updatedUser);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Update failed" });
    }
  }
);



router.delete("/memory/:id", auth, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    if (memory.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (memory.cloudinaryPublicId) {
      const resourceType = memory.type === "video" ? "video" : "image";
      await cloudinary.uploader.destroy(memory.cloudinaryPublicId, { resource_type: resourceType });
    }

    await memory.deleteOne();

    res.json({ message: "Memory deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});



router.delete("/category/:id", auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const memories = await Memory.find({ category: category._id });
    await Promise.all(
      memories
        .filter((m) => m.cloudinaryPublicId)
        .map((m) =>
          cloudinary.uploader.destroy(m.cloudinaryPublicId, {
            resource_type: m.type === "video" ? "video" : "image",
          })
        )
    );

    await Memory.deleteMany({ category: category._id });
    await category.deleteOne();

    res.json({ message: "Category deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;