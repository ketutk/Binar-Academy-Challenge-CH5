const express = require("express");
const { check } = require("express-validator");
const { getUsers, getUserById } = require("../controllers/users.controller");

const router = express.Router();

// Mendapatkan data semua users
router.get("/", getUsers);

// Mendapatkan data user tertentu
router.get("/:userId", getUserById);

module.exports = router;
