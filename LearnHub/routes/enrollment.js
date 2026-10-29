const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router({mergeParams:true});         // mounted at /courses/:id/enroll
const {isLoggedIn,validateId} = require("../middleware.js");
const enrollments = require("../controllers/enrollments.js");

router.post("/",validateId("Course"),isLoggedIn,wrapAsync(enrollments.create));

module.exports = router;
