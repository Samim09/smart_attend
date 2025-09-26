const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Admin = require("../models/admin");
const Class = require("../models/class");
const students = require("../models/student");

// Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(200).json({ success: false, error: " not found" });

   
    if (admin.password !== password)  return res.status(400).json({ success: false, error: "Incorrect password" });

    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Logout (dummy route, just for API consistency)
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// Create default admin
router.post("/create-default", async (req, res) => {
  try {
    const exists = await Admin.findOne({ role: "super_admin" });
    if (exists) return res.json({ success: true, message: "Default admin already exists" });

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await Admin.create({ username: "admin", email: "admin@smartattend.com", password: hashedPassword, role: "super_admin" });
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/classes", async (req, res) => {
 try {
     const Students = await Class.find();
     res.json({ success: true, data: Students });
   } catch (err) {
     res.status(500).json({ success: false, error: err.message });
   }
});


//add class


router.post("/classes", async (req, res) => {
  try {
    const { name, radius, latitude, longitude, altitude, course, semester, section } = req.body;

    // Validate required fields
    if (!name || radius == null || latitude == null || longitude == null || altitude == null) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, radius, latitude, longitude, altitude",
      });
    }

    // 1. Create new class
    const newClass = new Class({
      name,
      radius,
      latitude,
      longitude,
      altitude,
    });

    const savedClass = await newClass.save();

    // 2. Find students matching course + semester + section
    const updatedResult = await students.updateMany(
      { course, semester, section },             // filter
      { $set: { assign_class: savedClass.name , class_id: savedClass._id } } // update
    );

    res.status(201).json({
      success: true,
      data: savedClass,
      studentsUpdated: updatedResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

//delete 
// Delete student
router.delete("/classes/:id", async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
module.exports = router;
