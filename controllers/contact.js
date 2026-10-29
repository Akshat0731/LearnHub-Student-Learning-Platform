const Contact = require("../models/contact.js");

module.exports.form = (req,res)=>{
    res.render("contact.ejs",{title:"Contact Us | LearnHub"});
}

module.exports.create = async (req,res)=>{
    let {name,email,message} = req.body;
    await Contact.create({name,email,message});
    req.flash("success","Thank you for contacting us!");
    res.redirect("/contact");
}
