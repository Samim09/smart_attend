const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Student = require("../models/student");


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Student.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ success: false, error: "Invalid email or password" });
    }

   
    if (teacher.password !== password)  {
      return res.status(400).json({ success: false, error: "Invalid username or password" });
    }

    res.json({ success: true, data: teacher, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Get all students
router.get("/", async (req, res) => {
 try {
     const Students = await Student.find();
     res.json({ success: true, data: Students });
   } catch (err) {
     res.status(500).json({ success: false, error: err.message });
   }
});

// Get student by ID
router.get("/:id", async (req, res) => {
  const student = await Student.findById(req.params.id).populate("assign_class");
  if (!student) return res.status(404).json({ success: false, error: "Student not found" });
  res.json({ success: true, data: student });
});

// Create student
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      course,
      semester,
      section,
      face_image,
      assign_class,
      status
    } = req.body;

    // Basic validation (optional but recommended)
    if (!name || !email || !course || !semester || !section || !assign_class) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    // Save student
    const student = await Student.create({
      name,
      email,
      course,
      semester,
      section,
      face_image: face_image || null, // ✅ handles empty string or undefined
      assign_class,
      status: status || "active" // default status if not provided
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    console.error("Error creating student:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


// Update student
router.put("/:id", async (req, res) => {
  try {
    if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, 10);
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete student
router.delete("/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
