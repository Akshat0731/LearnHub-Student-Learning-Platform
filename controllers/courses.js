const Course = require("../models/course.js");
const Feedback = require("../models/feedback.js");
const ExpressError = require("../utils/ExpressError");

module.exports.index = async (req,res)=>{
    let courses = await Course.find().sort({_id:-1});
    res.render("courses/index.ejs",{title:"Courses | LearnHub",courses});
}

module.exports.show = async (req,res)=>{
    let course = await Course.findById(req.params.id);
    if(!course){
        throw new ExpressError(404,"Course not found");
    }

    // playlist wins over single video, same as before
    let embedUrl = "";
    if(course.youtube_playlist_id){
        embedUrl = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(course.youtube_playlist_id)}`;
    }else if(course.youtube_video_id){
        embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(course.youtube_video_id)}`;
    }

    let feedbacks = await Feedback.find({course:course._id}).sort({submitted_at:-1}).populate("user","name");
    res.render("courses/show.ejs",{title:"Course Details | LearnHub",course,embedUrl,feedbacks});
}
