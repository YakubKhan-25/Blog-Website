const express = require('express')
const yk = express();
const usermodel = require('./models/users');
const postmodel = require('./models/posts');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ejs = require("ejs");
const cookieparser = require('cookie-parser');
const {check} = require('express-validator');
const {validationResult} = require('express-validator');
const upload = require('./config/multer')
const multerpostimg = require('./config/multer-postimg')

yk.use(express.json());
yk.use(express.urlencoded({ extended: true }));
yk.set("view engine", "ejs");
yk.use(express.static('./public'))
yk.use(cookieparser());

const signupvalidator = [
    check("username").notEmpty().withMessage("Name is Required"),
    check("email").isEmail().withMessage("Invalid Email").notEmpty().withMessage("Email is Required"),
    check("password").notEmpty().withMessage("Password is Required")
]
    
const signinvalidator = [
    check("email").isEmail().withMessage("Invalid Email").notEmpty().withMessage("Email is Required"),
    check("password").notEmpty().withMessage("Password is Required")
]

const checkvalidate = (req, res, next)=>{
    const errors = validationResult(req);
    const mappederrors = {}
    if (errors.isEmpty()) {
        return next();
    }errors.errors.forEach((error)=>{
        mappederrors[error.path] = error.msg;
    })
    return res.status(400).json(mappederrors);
}


const errhandler = (error, req, res, next)=>{
    const code = res.code ? res.code :500;
    return res.status(code).json({code, status: false, message: error.msg, stack : error.stack})
}

yk.get("/", function(req, res){
    res.render('signup');
})

yk.post('/signup', signupvalidator, checkvalidate, async function(req, res){
  
    let {username, email, password} = req.body;
    
    let user = await usermodel.findOne({email});
    if(user){ 
        return res.redirect('/profile'); 
    }

    bcrypt.genSalt(10, function(err, salt){
        if(err){
            return res.status(500).json({message: "Error Generating salt"})
        }
        bcrypt.hash(password, salt, async function(err, hash){
            if (err) {
                return res.status(500).json({ message: "Error hashing password" });
            }
            try{
                let user = await usermodel.create({
                    username,
                    email,
                    password : hash
                })
                .then(()=> console.log("user is created")).catch((err)=> console.log("user is not created yet"))
                console.log(user);
                let token = jwt.sign({userId: user.id, email: email}, "yksk2428sk");
                res.cookie("token", token);
                res.redirect('/login');
            }
            catch (err) {
                console.log("User is not created yet", err);
                return res.status(500).json({message: "User Creation Failed"})
            }
        })
    })
})
yk.get("/checkupd",(req, res)=>{
    res.render('check');
})

yk.get("/login", function(req, res){
    res.render('login')
})

yk.post("/login", signinvalidator , checkvalidate, async function(req, res){
    let {email, password} = req.body;

    let user = await usermodel.findOne({email});
    if(!user){ 
     return res.redirect('/');
    }
    bcrypt.compare(password, user.password, function(err, result){
        if(err){
            return res.status(500).json({message: "Error Comparison Failed"})
        }
        if(result){
            let token = jwt.sign({userId: user.id, email: email}, "yksk2428sk");
            res.cookie("token", token);
            return res.redirect('/profile');
        }
        else{
           return res.redirect('/logerr');
        }
    })
})

yk.get("/webposts", isloggedin, async function(req, res){
    let user = await usermodel.findOne({email : req.user.email}).populate('webposts');
    res.render('webpost', {user});
})


yk.get('/publicposts', isloggedin, async function(req, res) {
    try {
        let user = await usermodel.findOne({email: req.user.email});
        let users = await usermodel.find({}).populate('webposts');
        let allPosts = [];

        users.forEach(user => {
            if (user.webposts) {
                user.webposts.forEach(post => {
                    allPosts.push({
                        username: user.username,
                        ...post.toObject()
                    });
                });
            }
        });

        res.render('public_posts', { allPosts, currentUser: req.user , user});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});




yk.post("/post", isloggedin, multerpostimg.single("post-img") , async function(req, res){
    
    let user = await usermodel.findOne({email: req.user.email});
    let {title, content} = req.body;
    let post = await postmodel.create({
        user: user._id,
        title,
        content,
    })
    user.webposts.push(post._id);
    await user.save();
    console.log(req.file)
    post.postimg = req.file.filename;
    await post.save();
    res.redirect('/webposts');
})
// ------------------------------------------------------------------

const mongoose = require('mongoose');

yk.get('/like/:id', isloggedin , async function(req, res) {
    try {
        // Ensure user ID is a mongoose ObjectId
        const userId = new mongoose.Types.ObjectId(req.user._id);

        // Find the post by ID
        let post = await postmodel.findOne({ _id: req.params.id }).populate('user');

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the current user has already liked the post
        const alreadyLikedIndex = post.likes.indexOf(userId.toString());

        // If the current user has not liked the post, add their ID to the likes array
        if (alreadyLikedIndex === -1) {
            post.likes.push(userId);
            console.log(`User ${userId} liked the post`);
        } else {
            post.likes.splice(alreadyLikedIndex, 1);
            console.log(`User ${userId} unliked the post`);
        }

        // Save the updated post
        await post.save();
        console.log(`Post likes updated: ${post.likes.length} likes`);

        // Redirect back to the page where the post was liked/unliked
        return res.redirect('/publicposts');
    } catch (error) {
        // Handle any errors
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});





yk.get("/deletepost/:id", isloggedin, async function(req, res){
    try{
    let postdelete = await postmodel.findByIdAndDelete(req.params.id);
    let user = await usermodel.findOneAndUpdate({email: req.user.email}, {$pull: {webposts: req.params.id}})
    if(!postdelete){
       return res.status(404).json({message: "post not found"})
    }else{
        console.log("post was deleted");
        await user.save();
        return res.redirect('/webposts')
    }
    }catch(err){
       return res.status(500).json({message:"Server not found"});
    }
})

yk.get('/edit/:id', isloggedin , async function(req, res){
    let post = await postmodel.findOne({_id: req.params.id}).populate('user');
    return res.render('updatepost', {post});
})

yk.post('/update/:id', isloggedin , multerpostimg.single("updatefile"), async function(req, res){
    let post = await postmodel.findOneAndUpdate({_id: req.params.id}, {title : req.body.title , content : req.body.content, postimg: req.file.filename});
    await post.save();
    return res.redirect('/webposts')
})

yk.get("/logerr", function(req, res){
    res.render('logerr');
})

yk.get("/logout", function(req, res){
    res.cookie("token", "");
    return res.redirect('/login');
})

yk.get("/profile", isloggedin, function(req, res){
    res.render('profile');
})

yk.get('/webposts/uploadimage', isloggedin, function(req, res){
    res.render('uploadimage')
})

yk.post('/upload', isloggedin, upload.single("image") ,async function(req, res){
    let user = await usermodel.findOne({email : req.user.email});
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect('/webposts');
})

function isloggedin(req, res, next) {
    if (!req.cookies.token) {
        return res.redirect('/logerr');
    } else {
        try {
            let data = jwt.verify(req.cookies.token, "yksk2428sk");
            req.user = { _id: data.userId, email: data.email }; // assuming JWT contains userId and email
            next(); 
        } catch (err) {
            return res.redirect('/logerr');
        }
    }
}




yk.listen(3000);