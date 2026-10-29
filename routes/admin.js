const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const {isAdmin,validateId,formNewCourse,formEditCourse} = require("../middleware.js");
const admin = require("../controllers/admin.js");

// every route below needs an admin session
router.use(isAdmin);

router.get("/dashboard",wrapAsync(admin.dashboard));

router.route("/courses")
.get(wrapAsync(admin.courses))
.post(formNewCourse,wrapAsync(admin.createCourse));

router.get("/courses/new",admin.newCourseForm);

router.route("/courses/:id")
.put(validateId("Course"),formEditCourse,wrapAsync(admin.updateCourse))
.delete(validateId("Course"),wrapAsync(admin.deleteCourse));

router.get("/courses/:id/edit",validateId("Course"),wrapAsync(admin.editCourseForm));

router.get("/users",wrapAsync(admin.users));
router.delete("/users/:id",validateId("User"),wrapAsync(admin.deleteUser));

router.get("/contacts",wrapAsync(admin.contacts));

module.exports = router;
