const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const {saveRedirectUrl,formRegister,formLogin} = require("../middleware.js");
const users = require("../controllers/users.js");

router.route("/register")
.get(users.registerForm)
.post(formRegister,wrapAsync(users.register));

router.route("/login")
.get(users.loginForm)
.post(saveRedirectUrl,formLogin,wrapAsync(users.login));

router.post("/logout",wrapAsync(users.logout));

module.exports = router;
