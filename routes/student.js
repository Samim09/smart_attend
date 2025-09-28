const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Student = require("../models/student");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth")

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Student.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ success: false, error: "Invalid email or password" });
    }


    if (teacher.password !== password) {
      return res.status(400).json({ success: false, error: "Invalid username or password" });
    }
    const token = jwt.sign(
      { id: teacher._id, email: teacher.email }, // payload
      process.env.JWT_SECRET || "mysecretkey",  // secret key
      { expiresIn: "7d" }  // token validity (7 days here)
    );

    res.json({ success: true, token, data: teacher, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Get all students
router.get("/",authMiddleware, async (req, res) => {
  try {
    const Students = await Student.find();
    res.json({ success: true, data: Students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get student by ID
router.get("/:id",authMiddleware, async (req, res) => {
  const student = await Student.findById(req.params.id).populate("assign_class");
  if (!student) return res.status(404).json({ success: false, error: "Student not found" });
  res.json({ success: true, data: student });
});

// Create student
router.post("/",authMiddleware, async (req, res) => {
  try {
    const {
      name,
      email,
      course,
      semester,
      section,
      face_image,
      password,
    } = req.body;

    // Basic validation
    if (!name || !email || !course || !semester || !section) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    // ✅ Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: "A student with this email already exists"
      });
    }

    // Save student
    const student = await Student.create({
      name,
      email,
      course,
      semester,
      section,
      face_image: face_image || null, // empty string or undefined handled
      password: password || "defaultPassword123",
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    console.error("Error creating student:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Update student
router.put("/:id",authMiddleware, async (req, res) => {
  try {
    if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, 10);
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete student
router.delete("/:id",authMiddleware, async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
