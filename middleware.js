const ExpressError = require("./utils/ExpressError");
const schemas = require("./schema.js");

const isApiRequest = (req) => req.originalUrl.startsWith("/api");
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

module.exports.isValidId = (id) => typeof id === "string" && OBJECT_ID_RE.test(id);

// ---------- auth ----------

// Pages: flash a message and send the person to /login (and bring them back after login).
// API (/api/...): JSON error from the error handler.
module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.session.user){
        if(isApiRequest(req)){
            throw new ExpressError(401,"User not logged in");
        }
        if(req.method === "GET"){
            req.session.redirectUrl = req.originalUrl;
        }
        req.flash("error","You must be logged in first!");
        return res.redirect("/login");
    }
    next();
}

module.exports.isAdmin = (req,res,next) =>{
    if(!req.session.user){
        if(isApiRequest(req)){
            throw new ExpressError(403,"Access denied");
        }
        if(req.method === "GET"){
            req.session.redirectUrl = req.originalUrl;
        }
        req.flash("error","You must be logged in first!");
        return res.redirect("/login");
    }
    if(req.session.user.role !== "admin"){
        if(isApiRequest(req)){
            throw new ExpressError(403,"Access denied");
        }
        req.flash("error","Access denied. Admins only.");
        return res.redirect("/");
    }
    next();
}

// copies the saved url into res.locals before login regenerates the session
module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

// ---------- input safety ----------

// Removes keys that start with "$" or contain "." (e.g. { "$ne": null }) so they can never
// act as MongoDB operators. Works on the object in place.
const clean = (obj) =>{
    if(!obj || typeof obj !== "object"){
        return obj;
    }
    for(const key of Object.keys(obj)){
        if(key.startsWith("$") || key.includes(".")){
            delete obj[key];
        }else{
            clean(obj[key]);
        }
    }
    return obj;
}

module.exports.sanitizeInputs = (req,res,next) =>{
    clean(req.body);
    clean(req.params);
    clean(req.query);
    next();
}

const checkInput = (schema,req,source) =>{
    const input = clean(req[source] || {});     // runs again here because multer fills req.body after the global sanitizer
    return schema.validate(input,{abortEarly:true,stripUnknown:true});
}

// API: validate(schema) checks req.body, validate(schema,"query") checks req.query.
// A bad input throws a 400 which the error handler returns as JSON.
const validate = (schema,source="body") => (req,res,next) =>{
    const {error,value} = checkInput(schema,req,source);
    if(error){
        throw new ExpressError(400,error.details[0].message);
    }
    if(source === "body"){
        req.body = value;
    }
    next();
}
module.exports.validate = validate;

// Website forms: a bad input shows a flash message and sends the person back to the form.
// back = path of the form page, or a function (req) => path
const validateForm = (schema,back) => (req,res,next) =>{
    const {error,value} = checkInput(schema,req,"body");
    if(error){
        req.flash("error",error.details[0].message);
        return res.redirect(typeof back === "function" ? back(req) : back);
    }
    req.body = value;
    next();
}
module.exports.validateForm = validateForm;

module.exports.validateRegister = validate(schemas.registerSchema);
module.exports.validateLogin = validate(schemas.loginSchema);
module.exports.validateContact = validate(schemas.contactSchema);
module.exports.validateCourse = validate(schemas.courseSchema);
module.exports.validateEnrollment = validate(schemas.enrollmentSchema);
module.exports.validateFeedback = validate(schemas.feedbackSchema);
module.exports.validateFeedbackQuery = validate(schemas.feedbackQuerySchema,"query");

// the same checks as forms (flash + redirect back)
module.exports.formRegister = validateForm(schemas.registerSchema,"/register");
module.exports.formLogin = validateForm(schemas.loginSchema,"/login");
module.exports.formContact = validateForm(schemas.contactSchema,"/contact");
module.exports.formFeedback = validateForm(schemas.feedbackFormSchema,(req)=>`/courses/${req.params.id}/feedback`);
module.exports.formNewCourse = validateForm(schemas.courseSchema,"/admin/courses/new");
module.exports.formEditCourse = validateForm(schemas.courseSchema,(req)=>`/admin/courses/${req.params.id}/edit`);

// validateId("Course") rejects /:id values that are not a real ObjectId with "Course not found"
module.exports.validateId = (label="Item") => (req,res,next) =>{
    if(!module.exports.isValidId(req.params.id)){
        throw new ExpressError(404,`${label} not found`);
    }
    next();
}

// ---------- error handling ----------

module.exports.notFound = (req,res,next) =>{
    next(new ExpressError(404,isApiRequest(req) ? "Not found" : "Page Not Found"));
}

// The one and only error handler. Everything that throws (ExpressError, Mongoose,
// Multer, bad JSON...) ends up here and is turned into a consistent response.
module.exports.errorHandler = (err,req,res,next) =>{
    if(res.headersSent){
        return next(err);
    }

    let status = err.status || err.statusCode || 500;
    let message = err.message || "Something went wrong!!";

    if(err.code === 11000){                                   // unique index violated
        const keys = Object.keys(err.keyPattern || err.keyValue || {});
        status = 409;
        if(keys.includes("email")){
            message = "Email already registered.";
        }else if(keys.includes("user") && keys.includes("course")){
            message = "Already enrolled in this course";
        }else{
            message = "Duplicate entry";
        }
    }else if(err.name === "ValidationError"){                 // Mongoose schema validation
        status = 400;
        message = Object.values(err.errors).map((e)=>e.message).join(", ");
    }else if(err.name === "CastError"){                       // malformed ObjectId etc.
        status = 400;
        message = "Invalid ID";
    }else if(err.name === "MulterError"){
        status = 400;
    }else if(err.type === "entity.parse.failed"){             // broken JSON body
        status = 400;
        message = "Invalid JSON";
    }

    if(!Number.isInteger(status) || status < 400 || status > 599){
        status = 500;
    }
    if(status >= 500){
        console.error(err);
        message = "Something went wrong. Try again.";
    }

    if(isApiRequest(req)){
        return res.status(status).json({status:"error",message});
    }
    res.status(status).render("error.ejs",{title:"Error | LearnHub",status,message});
}
