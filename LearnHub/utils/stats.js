const User = require("../models/user.js");
const Course = require("../models/course.js");
const Enrollment = require("../models/enrollment.js");

const WEEKS = 5;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Numbers for the admin dashboard: totals + enrollments in each of the last 5 weeks (oldest first).
// Used by both the dashboard page and GET /api/admin/stats.
module.exports = async () =>{
    let now = Date.now();
    let weekStarts = [];
    for(let i = WEEKS - 1; i >= 0; i--){
        weekStarts.push(new Date(now - (i + 1) * WEEK_MS + 1));
    }

    let [totalUsers,totalCourses,activeEnrollments,weeklyCounts] = await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Enrollment.countDocuments(),
        Promise.all(weekStarts.map((start)=>
            Enrollment.countDocuments({enroll_date:{$gte:start,$lt:new Date(start.getTime() + WEEK_MS)}})
        )),
    ]);

    return {
        totalUsers,
        totalCourses,
        activeEnrollments,
        weekly:weekStarts.map((start,i)=>({weekStart:start,count:weeklyCounts[i]})),
    };
}
