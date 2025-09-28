const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Teacher = require("../models/teacher");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth")
// ------------------------
// LOGIN
// ------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });
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

// ------------------------
// GET ALL TEACHERS
// ------------------------
router.get("/",authMiddleware, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json({ success: true, data: teachers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------
// GET TEACHER BY ID
// ------------------------
router.get("/:id",authMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, error: "Teacher not found" });
    res.json({ success: true, data: teacher });
  } catch (err) {
    res.status(400).json({ success: false, error: "Invalid ID" });
  }
});

// ------------------------
// CREATE TEACHER
// ------------------------
router.post("/",authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        error: "Email is already registered",
      });
    }

    const teacher = await Teacher.create({ ...req.body });
    res.json({ success: true, data: teacher });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ------------------------
// UPDATE TEACHER
// ------------------------
router.put("/:id",authMiddleware, async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ success: false, error: "Teacher not found" });
    res.json({ success: true, data: teacher });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------
// DELETE TEACHER
// ------------------------
router.delete("/:id",authMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, error: "Teacher not found" });
    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
