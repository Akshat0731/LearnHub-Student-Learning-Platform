const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router({mergeParams:true});         // mounted at /courses/:id/feedback
const {isLoggedIn,validateId,formFeedback} = require("../middleware.js");
const feedback = require("../controllers/feedback.js");

router.route("/")
.get(validateId("Course"),isLoggedIn,wrapAsync(feedback.newForm))
.post(validateId("Course"),isLoggedIn,formFeedback,wrapAsync(feedback.create));

module.exports = router;
