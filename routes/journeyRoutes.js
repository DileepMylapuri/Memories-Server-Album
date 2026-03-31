const express = require("express");
const router = express.Router();
const Journey = require("../Models/Journey");
const auth = require("../middleware/auth");

// CREATE
router.post("/", auth, async (req, res) => {
  try {
    const { type, date, description } = req.body;

    const journey = await Journey.create({
      type,
      date,
      description,
      user: req.userId
    });

    res.json(journey);
  } catch (err) {
    res.status(500).json({ message: "Create failed" });
  }
});

// GET BY TYPE
router.get("/:type", auth, async (req, res) => {
  const data = await Journey.find({
    type: req.params.type,
    user: req.userId
  }).sort({ createdAt: -1 });

  res.json(data);
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  const updated = await Journey.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  await Journey.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;