// models/teacher.js

const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    primaryKey: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true, // should be hashed before saving
  }
}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);
