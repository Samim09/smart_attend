
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
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
  },
    course: {
    type: String,
    required: false, // should be hashed before saving
  },
    semester: {
    type: String,
    required: false, // should be hashed before saving
  },
  
  face_image: {
    type: String,
    required: false, // storing image path or base64 string
  },
  assign_class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class", // reference to Class table
    required: false,
  },
  status: {
    type: Number,
    enum: [0, 1], // 0 = No, 1 = Yes
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
