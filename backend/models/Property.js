const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  rent: { type: Number, required: true },
  city: { type: String, required: true },
  type: { type: String, required: true },
  description: String,
  image: String,
  amenities: [String],
  gender: String,
  ownerName: String,
  ownerPhone: String,
  rating: { type: Number, default: 4.0 },
}, { timestamps: true });

module.exports = mongoose.model("Property", PropertySchema);