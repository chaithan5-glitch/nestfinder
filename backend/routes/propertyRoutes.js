const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const authMiddleware = require("../middleware/auth");

// GET ALL PROPERTIES
router.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD NEW PROPERTY — now protected
router.post("/properties", authMiddleware, async (req, res) => {   // add authMiddleware
  try {
    const property = await Property.create(req.body);
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE PROPERTY BY ID
router.get("/properties/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Not found" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;