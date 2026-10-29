require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const connectDB = require("./config/db.js");
const {MONGO_URI} = connectDB;
const {sanitizeInputs,notFound,errorHandler} = require("./middleware.js");

// website routes
const userRoute = require("./routes/user.js");
const courseRoute = require("./routes/course.js");
const enrollmentRoute = require("./routes/enrollment.js");
const feedbackRoute = require("./routes/feedback.js");
const contactRoute = require("./routes/contact.js");
const studentRoute = require("./routes/student.js");
const adminRoute = require("./routes/admin.js");

// REST API routes (JSON)
const apiAuthRoute = require("./routes/api/auth.js");
const apiCourseRoute = require("./routes/api/course.js");
const apiEnrollmentRoute = require("./routes/api/enrollment.js");
const apiFeedbackRoute = require("./routes/api/feedback.js");
const apiContactRoute = require("./routes/api/contact.js");
const apiAdminRoute = require("./routes/api/admin.js");

const isProduction = process.env.NODE_ENV === "production";
let port = process.env.PORT || 3000;

if(!process.env.SESSION_SECRET){
    if(isProduction){
        throw new Error("SESSION_SECRET is not set. Add it to your environment variables.");
    }
    console.warn("SESSION_SECRET is not set, using an insecure development secret. Copy .env.example to .env.");
}

// behind a proxy (Render, Railway, Heroku...) the secure cookie only works if Express trusts it
if(isProduction){
    app.set("trust proxy",1);
}

const sessionOptions = {
    secret:process.env.SESSION_SECRET || "learnhub-dev-secret",
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({mongoUrl:MONGO_URI,touchAfter:24 * 3600}),      // sessions live in MongoDB
    cookie:{
        httpOnly:true,
        sameSite:"lax",
        secure:isProduction,
        maxAge:7 * 24 * 60 * 60 * 1000,
    }
}

app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")));
app.get("/favicon.ico",(req,res)=>res.status(204).end());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(session(sessionOptions));
app.use(flash());
app.use(sanitizeInputs);

// values every EJS page can use: flash messages, the logged in user, a default title
app.use((req,res,next)=>{
    res.locals.title = "LearnHub";
    res.locals.currUser = req.session.user || null;
    if(req.originalUrl.startsWith("/api")){         // JSON requests must not use up the flash messages
        res.locals.success = [];
        res.locals.error = [];
    }else{
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
    }
    next();
});

// ---------- REST API ----------
app.use("/api/auth",apiAuthRoute);
app.use("/api/courses",apiCourseRoute);
app.use("/api/enrollments",apiEnrollmentRoute);
app.use("/api/feedback",apiFeedbackRoute);
app.use("/api/contact",apiContactRoute);
app.use("/api/admin",apiAdminRoute);

// ---------- Website ----------
app.get("/",(req,res)=>{
    res.render("home.ejs",{title:"LearnHub - Online Learning Platform"});
});

app.use("/courses/:id/feedback",feedbackRoute);
app.use("/courses/:id/enroll",enrollmentRoute);
app.use("/courses",courseRoute);
app.use("/contact",contactRoute);
app.use("/student",studentRoute);
app.use("/admin",adminRoute);
app.use("/",userRoute);

// ---------- 404 + the one central error handler ----------
app.use(notFound);
app.use(errorHandler);

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`LearnHub running at http://localhost:${port}`);
    });
})
.catch((err)=>{
    console.log("Failed to connect to MongoDB at",MONGO_URI);
    console.log("ERROR:",err.message);
    console.log("Is MongoDB running? (or fix MONGO_URI in your .env)");
    process.exit(1);
});
