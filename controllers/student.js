const Enrollment = require("../models/enrollment.js");

module.exports.dashboard = async (req,res)=>{
    let rows = await Enrollment.find({user:req.session.user.user_id})
        .sort({enroll_date:-1})
        .populate("course","title description");

    let enrollments = rows.filter((e)=> e.course);      // skip enrollments whose course no longer exists

    let total = enrollments.reduce((sum,e)=> sum + (e.progress || 0),0);
    let stats = {
        enrolled:enrollments.length,
        completed:enrollments.filter((e)=> e.progress >= 100).length,
        overall:enrollments.length ? Math.round(total / enrollments.length) : 0,
    };
    res.render("student/dashboard.ejs",{title:"Student Dashboard | LearnHub",enrollments,stats});
}
