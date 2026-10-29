const Course = require("../../models/course.js");
const User = require("../../models/user.js");
const Contact = require("../../models/contact.js");
const getStats = require("../../utils/stats.js");
const ExpressError = require("../../utils/ExpressError");

// ---------- Courses ----------

module.exports.courses = async (req,res)=>{
    res.json({status:"success",data:await Course.find().sort({_id:-1})});
}

module.exports.createCourse = async (req,res)=>{
    await Course.create(req.body);
    res.status(201).json({status:"success",message:"Course added successfully"});
}

module.exports.updateCourse = async (req,res)=>{
    let updated = await Course.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
    if(!updated){
        throw new ExpressError(404,"Course not found");
    }
    res.json({status:"success",message:"Course updated successfully"});
}

module.exports.deleteCourse = async (req,res)=>{
    // enrollments and feedback of this course are removed by the post hook in models/course.js
    let deleted = await Course.findByIdAndDelete(req.params.id);
    if(!deleted){
        throw new ExpressError(404,"Course not found");
    }
    res.json({status:"success",message:"Course deleted successfully"});
}

// ---------- Users ----------

module.exports.users = async (req,res)=>{
    res.json({status:"success",data:await User.find().sort({_id:-1})});
}

module.exports.deleteUser = async (req,res)=>{
    if(req.params.id === req.session.user.user_id){
        throw new ExpressError(400,"You cannot delete yourself");
    }
    // enrollments and feedback of this user are removed by the post hook in models/user.js
    let deleted = await User.findByIdAndDelete(req.params.id);
    if(!deleted){
        throw new ExpressError(404,"User not found");
    }
    res.json({status:"success",message:"User deleted successfully"});
}

// ---------- Contacts ----------

module.exports.contacts = async (req,res)=>{
    res.json({status:"success",data:await Contact.find().sort({_id:-1})});
}

// ---------- Dashboard numbers + chart ----------

module.exports.stats = async (req,res)=>{
    res.json({status:"success",...(await getStats())});
}
