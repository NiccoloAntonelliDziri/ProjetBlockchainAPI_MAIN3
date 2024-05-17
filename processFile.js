const multer = require("multer");
const path = require("path");const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  // you can add more here
};const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null,path.join(__dirname, './upload'));
   // Note ./upload path should be relative. Change this path according to your folder structure
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    // const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});const processFile = multer({ storage: storage }).single("file"); //<--here `file` key
/*
Look at the last example of how we will use `file` key to 
upload files using form data and postman.For accepting multiple files change above line to const processFile = multer({ storage: storage }).array('file', 12);
Where 12 is the number of files you want to accept.*/module.exports = processFile;
