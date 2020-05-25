var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');
var mongoose = require('mongoose');
var express = require('express');
var app = express();

// App config
mongoose.connect("mongodb://localhost/blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

const port = process.env.PORT || 3000;

// Mongoose Model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// Restful ROutes

app.get("/", (req, res) => {
    res.redirect("/blogs");
});
//Index Route
app.get("/blogs", (req, res) => {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {blogs});
        }
    });
});

//New Route
app.get("/blogs/new", (req, res) => {
    res.render("new");
});

//Create Route
app.post("/blogs", (req, res) => {
    //Create blog
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log("===============");
    console.log(req.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) {
            res.render("new");
        } else {
            //Redirect to the index
            res.redirect("/blogs");
        }
    });
});

// Show Route
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

// Edit Route
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

// Update Route
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// Delete Route
app.delete("/blogs/:id", (req, res) => {
    // Destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(port, () => {
    console.log("SERVER IS RUNNING");
});