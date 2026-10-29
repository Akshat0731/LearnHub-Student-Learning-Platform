const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const {isLoggedIn} = require("../middleware.js");
const student = require("../controllers/student.js");

router.get("/dashboard",isLoggedIn,wrapAsync(student.dashboard));

module.exports = router;
