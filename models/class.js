// models/class.js

const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    primaryKey: true,
  },
  radius: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  time_start: {
    type: String, // can also use Date if you want precise scheduling
    required: false,
  },
  time_end: {
    type: String, // same here, can switch to Date if needed
    required: false,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  altitude: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Class", classSchema);
