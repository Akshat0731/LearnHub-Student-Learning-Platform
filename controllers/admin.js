const Course = require("../models/course.js");
const User = require("../models/user.js");
const Contact = require("../models/contact.js");
const getStats = require("../utils/stats.js");
const ExpressError = require("../utils/ExpressError");

const CATEGORIES = ["Web Development","Programming","AI & ML","Data Analytics","Other"];

module.exports.dashboard = async (req,res)=>{
    let stats = await getStats();
    res.render("admin/dashboard.ejs",{title:"Admin Dashboard | LearnHub",stats});
}

// ---------- Courses ----------

module.exports.courses = async (req,res)=>{
    let courses = await Course.find().sort({_id:-1});
    res.render("admin/courses.ejs",{title:"View Courses | LearnHub",courses});
}

module.exports.newCourseForm = (req,res)=>{
    res.render("admin/new.ejs",{title:"Add New Course | LearnHub",categories:CATEGORIES});
}

module.exports.createCourse = async (req,res)=>{
    await Course.create(req.body);
    req.flash("success","Course added successfully");
    res.redirect("/admin/dashboard");
}

module.exports.editCourseForm = async (req,res)=>{
    let course = await Course.findById(req.params.id);
    if(!course){
        throw new ExpressError(404,"Course not found");
    }
    // an older course may have a category that is not in the list, keep it selectable
    let categories = CATEGORIES.includes(course.category) ? CATEGORIES : [...CATEGORIES,course.category];
    res.render("admin/edit.ejs",{title:"Edit Course | LearnHub",course,categories});
}

module.exports.updateCourse = async (req,res)=>{
    let updated = await Course.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
    if(!updated){
        throw new ExpressError(404,"Course not found");
    }
    req.flash("success","Course updated successfully");
    res.redirect("/admin/dashboard");
}

module.exports.deleteCourse = async (req,res)=>{
    // enrollments and feedback of this course are removed by the post hook in models/course.js
    let deleted = await Course.findByIdAndDelete(req.params.id);
    if(!deleted){
        throw new ExpressError(404,"Course not found");
    }
    req.flash("success","Course deleted successfully");
    res.redirect("/admin/courses");
}

// ---------- Users ----------

module.exports.users = async (req,res)=>{
    let users = await User.find().sort({_id:-1});
    res.render("admin/users.ejs",{title:"View Users | LearnHub",users});
}

module.exports.deleteUser = async (req,res)=>{
    if(req.params.id === req.session.user.user_id){
        req.flash("error","You cannot delete yourself");
        return res.redirect("/admin/users");
    }
    // enrollments and feedback of this user are removed by the post hook in models/user.js
    let deleted = await User.findByIdAndDelete(req.params.id);
    if(!deleted){
        throw new ExpressError(404,"User not found");
    }
    req.flash("success","User deleted successfully");
    res.redirect("/admin/users");
}

// ---------- Contacts ----------

module.exports.contacts = async (req,res)=>{
    let contacts = await Contact.find().sort({_id:-1});
    res.render("admin/contacts.ejs",{title:"View Contacts | LearnHub",contacts});
}
