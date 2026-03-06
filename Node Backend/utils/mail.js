const config = require("../config/config");

async function getTemplateBody(file, data = {}) {
  return new Promise((resolve) => {
    ejs.renderFile(
      path.resolve(__dirname, `../public/mail_templates/${file}.html`),
      data,
      {},
      (err, str) => {
        if (err) {
          return resolve(null);
        }
        resolve(str);
      }
    );
  });
}

// function sendMail(to, data, subject) {
//   let subjectName = subject ? subject : "TEST";
//   return new Promise(async (resolve) => {
//     // Create sendEmail params
//     var params = {
//       Destination: {
//         ToAddresses: [to],
//       },
//       Message: {
//         Body: {
//           Html: {
//             Charset: "UTF-8",
//             Data: data,
//           },
//         },
//         Subject: {
//           Charset: "UTF-8",
//           Data: subjectName,
//         },
//       },
//       Source: superConfig.APP_SUPPORT_EMAIL,
//     };
//     // Create the promise and SES service object
//     var sendPromise = SES.sendEmail(params).promise();

//     // Handle promise's fulfilled/rejected states
//     sendPromise
//       .then((data) => {
//         console.log("sendMail : seccuss : ", data.MessageId);
//         resolve(true);
//       })
//       .catch((err) => {
//         console.log("sendMail : error   : ", err, err.stack);
//         resolve(false);
//       });
//   });
// }

// function sendDEVMail(to, data, subject) {
//   let subjectName = subject ? subject : "TEST";
//   return new Promise(async (resolve) => {
//     // Create sendEmail params
//     var params = {
//       Destination: {
//         ToAddresses: [to],
//       },
//       Message: {
//         Body: {
//           Html: {
//             Charset: "UTF-8",
//             Data: data,
//           },
//         },
//         Subject: {
//           Charset: "UTF-8",
//           Data: subjectName,
//         },
//       },
//       Source: superConfig.DEV_SUPPORT_EMAIL, //"support@test.gg"
//     };
//     // Create the promise and SES service object

//     var sendPromise = SES.sendEmail(params).promise();

//     // Handle promise's fulfilled/rejected states
//     sendPromise
//       .then((data) => {
//         console.log("sendMail : seccuss : ", data.MessageId);
//         resolve(true);
//       })
//       .catch((err) => {
//         console.log("sendMail : error   : ", err, err.stack);
//         resolve(false);
//       });
//   });
// }

// function sendSupportMail(to, data, subject) {
//   let subjectName = subject ? subject : "TEST";

//   return new Promise(async (resolve) => {
//     // Create sendEmail params
//     var params = {
//       Destination: {
//         // CcAddresses: [to],
//         ToAddresses: [superConfig.DEV_SUPPORT_EMAIL], //["devsupport@test.gg"]
//       },
//       Message: {
//         Body: {
//           Html: {
//             Charset: "UTF-8",
//             Data: data,
//           },
//         },
//         Subject: {
//           Charset: "UTF-8",
//           Data: subjectName,
//         },
//       },
//       Source: superConfig.DEV_SUPPORT_EMAIL,
//       ReplyToAddresses: [
//         to,
//         /* more items */
//       ],
//     };
//     // Create the promise and SES service object
//     var sendPromise = SES.sendEmail(params).promise();

//     // Handle promise's fulfilled/rejected states
//     sendPromise
//       .then((data) => {
//         console.log("sendMail : seccuss : ", data.MessageId);
//         resolve(true);
//       })
//       .catch((err) => {
//         console.log("sendMail : error   : ", err, err.stack);
//         resolve(false);
//       });
//   });
// }
// function sendAppSupportMail(to, data, subject) {
//   let subjectName = subject ? subject : "TEST";

//   return new Promise(async (resolve) => {
//     // Create sendEmail params
//     var params = {
//       Destination: {
//         // CcAddresses: [to],
//         ToAddresses: [superConfig.APP_SUPPORT_EMAIL], //["devsupport@test.gg"]
//       },
//       Message: {
//         Body: {
//           Html: {
//             Charset: "UTF-8",
//             Data: data,
//           },
//         },
//         Subject: {
//           Charset: "UTF-8",
//           Data: subjectName,
//         },
//       },
//       Source: superConfig.APP_SUPPORT_EMAIL,
//       ReplyToAddresses: [
//         to,
//         /* more items */
//       ],
//     };
//     // Create the promise and SES service object
//     var sendPromise = SES.sendEmail(params).promise();

//     // Handle promise's fulfilled/rejected states
//     sendPromise
//       .then((data) => {
//         console.log("sendMail : seccuss : ", data.MessageId);
//         resolve(true);
//       })
//       .catch((err) => {
//         console.log("sendMail : error   : ", err, err.stack);
//         resolve(false);
//       });
//   });
// }

module.exports = {
  // sendMail,
  // sendDEVMail,
  // sendSupportMail,
  getTemplateBody,
  // sendAppSupportMail,
};
