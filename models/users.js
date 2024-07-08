const mongoose = require('mongoose');

mongoose.connect(`mongodb://127.0.0.1:27017/backendproject`);

const Createduser =new mongoose.Schema({
    username : String,
    email : String,
    password : String,
    profilepic: {
        type: String,
        default: "default.png",
    },
    webposts : [ 
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref : "Posts",
        }
    ],
    role: {
        type: Number,
        default: 3,
    },
},{timestamps: true})

module.exports = mongoose.model("User", Createduser);