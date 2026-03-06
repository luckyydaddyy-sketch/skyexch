const joi = require("joi");
const fs = require("fs");

const payload = {
  body: joi.object({
    fileName: joi.string().optional(),
  }),
};
async function handler(req, res) {
  //   console.log("gameIconUpload :call-->", Number(req.headers["content-length"]));

  const { file, user, body } = req;
    console.log("file ::: ", file)
    // console.log("file.filename ::: ", file.filename)
    // console.log("file.path ::: ", file.path)
  console.log("body ::: ", body);
  const { domain } = body;
  if ( typeof body.fileName !== "undefined" && fs.existsSync(`./uploads/${body.fileName}`)) {
    // console.log("file is here");
    fs.unlinkSync(`./uploads/${body.fileName}`);
  } 
  // else {
  //   console.log("file is not here");
  // }

  return {
    path: file.filename,
    msg: "Image upload Done!",
  };
}

module.exports = {
  payload,
  handler,
  auth: true,
};
