const bcrypt = require("bcryptjs");
const User = require("../models/user.js");

// express-session uses callbacks, this wraps it so we can use await
const regenerateSession = (req) => new Promise((resolve,reject)=>{
    req.session.regenerate((err)=> err ? reject(err) : resolve());
});

module.exports.registerForm = (req,res)=>{
    res.render("users/register.ejs",{title:"Register | LearnHub"});
}

module.exports.register = async (req,res)=>{
    let {name,email,password} = req.body;
    if(await User.exists({email})){
        req.flash("error","Email already registered.");
        return res.redirect("/register");
    }
    let hashed = await bcrypt.hash(password,10);
    await User.create({name,email,password:hashed});     // role defaults to "student"
    req.flash("success","Registration successful. Please log in.");
    res.redirect("/login");
}

module.exports.loginForm = (req,res)=>{
    res.render("users/login.ejs",{title:"Login | LearnHub"});
}

module.exports.login = async (req,res)=>{
    let {email,password} = req.body;
    let redirectUrl = res.locals.redirectUrl;          // set by saveRedirectUrl, the session is replaced below

    let user = await User.findOne({email});
    let ok = user && await bcrypt.compare(password,user.password);
    if(!ok){
        req.flash("error","Invalid email or password.");
        return res.redirect("/login");
    }

    // new session id on login (prevents session fixation)
    await regenerateSession(req);
    req.session.user = {
        user_id:user._id.toString(),
        name:user.name,
        email:user.email,
        role:user.role,
    };
    req.flash("success",`Welcome back, ${user.name}!`);
    res.redirect(redirectUrl || (user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"));
}

module.exports.logout = async (req,res)=>{
    await regenerateSession(req);                      // drops the logged-in session, gives a clean one for the flash message
    res.clearCookie("connect.sid");
    req.flash("success","You logged out!!");
    res.redirect("/");
}
