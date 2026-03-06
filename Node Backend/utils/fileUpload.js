const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    console.log(" file.fieldname :: ", file.fieldname);
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});
const upload = multer({ storage: storage });

const storageForDeposit = multer.diskStorage({
  destination: "depositImage",
  filename: (req, file, cb) => {
    console.log(" file.fieldname :: ", file.fieldname);
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});
const uploadForDeposit = multer({ storage: storageForDeposit });

module.exports = {
  upload,
  uploadForDeposit,
};
