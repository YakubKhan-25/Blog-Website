const mongoose = require('mongoose');

const Createdpost =new mongoose.Schema({
   user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
   },
   title : String,
   content : String,
   postimg : {
      type: String,
      default: "defaultpost.jpg"
   },
   likes : [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
      }
   ]
})

module.exports = mongoose.model("Posts", Createdpost);