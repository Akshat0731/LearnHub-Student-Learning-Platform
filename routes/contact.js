const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const {formContact} = require("../middleware.js");
const contact = require("../controllers/contact.js");

router.route("/")
.get(contact.form)
.post(formContact,wrapAsync(contact.create));

module.exports = router;
