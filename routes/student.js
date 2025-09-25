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
    console.log("Incoming request body:", req.body); // ✅ Debugging log
    const { face_image, ...rest } = req.body;

    // Convert face_image to Buffer if exists
    const student = await Student.create({
      ...rest,
      faceImage: face_image ? Buffer.from(face_image, "base64") : null,
    });

    res.json({ success: true, data: student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
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
