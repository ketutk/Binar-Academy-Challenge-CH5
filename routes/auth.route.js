const express = require("express");
const { registerUser, loginUser, authenticate } = require("../controllers/auth.controller");
const { check } = require("express-validator");

const router = express.Router();

// Mendaftar
router.post("/register", [check("email").isEmail().withMessage("Please enter a valid email address.")], registerUser);

// Login
router.post("/login", loginUser);

router.post("/authenticate", authenticate);

module.exports = router;
