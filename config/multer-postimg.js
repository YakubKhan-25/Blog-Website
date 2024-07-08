const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/posts-img')
    },
    filename: function (req, file, cb) {
     crypto.randomBytes(12, function (err, name){
        const funcname =  name.toString("hex") + path.extname(file.originalname);
        cb(null, funcname);
      })
    }
  })
  
  const upload = multer({ storage: storage })

  module.exports =  upload;