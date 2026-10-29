const Feedback = require("../models/feedback.js");
const Course = require("../models/course.js");
const ExpressError = require("../utils/ExpressError");

module.exports.newForm = async (req,res)=>{
    let course = await Course.findById(req.params.id);
    if(!course){
        throw new ExpressError(404,"Course not found");
    }
    res.render("feedback/new.ejs",{title:"Course Feedback | LearnHub",course});
}

module.exports.create = async (req,res)=>{
    let {id} = req.params;
    let {rating,feedback} = req.body;
    if(!(await Course.exists({_id:id}))){
        throw new ExpressError(404,"Course not found");
    }
    await Feedback.create({user:req.session.user.user_id,course:id,rating,comment:feedback});
    req.flash("success","Thank you! Your feedback has been submitted.");
    res.redirect(`/courses/${id}`);
}
