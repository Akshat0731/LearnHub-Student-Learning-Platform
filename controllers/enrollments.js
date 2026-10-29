const Enrollment = require("../models/enrollment.js");
const Course = require("../models/course.js");
const ExpressError = require("../utils/ExpressError");

module.exports.create = async (req,res)=>{
    let {id} = req.params;
    if(!(await Course.exists({_id:id}))){
        throw new ExpressError(404,"Course not found");
    }
    let user = req.session.user.user_id;
    if(await Enrollment.exists({user,course:id})){
        req.flash("error","Already enrolled in this course");
        return res.redirect(`/courses/${id}`);
    }
    // the unique {user, course} index is the real guard if two requests arrive together
    await Enrollment.create({user,course:id});
    req.flash("success","Course enrolled successfully");
    res.redirect(`/courses/${id}`);
}
