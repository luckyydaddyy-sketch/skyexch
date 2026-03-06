const joi = require("joi");
const mongo = require("../../../config/mongodb");
const payload = {
  body: joi.object().keys({
    id: joi.string().optional(),
  }),
};

async function handler({ body, user }) {
  const { id } = body;
  const { userId } = user;

  const inboxDetails = await mongo.bettingApp.model(mongo.models.inboxs).find({
    query: {
      userId,
    },
    sort: { createdAt: -1 },
    limit: 50,
  });
  // const inboxDetails = await mongo.bettingApp
  //   .model(mongo.models.inboxs)
  //   .aggregate({
  //     pipeline: [
  //       {
  //         $match: { userId : userId},
  //       },
  //       // {
  //       //   sort: { createdAt: -1 },
  //       // },
  //       // {
  //       //   limit: 50,
  //       // },
  //       {
  //         $group: {
  //           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
  //           notifications: { $push: "$$ROOT" },
  //         },
  //       },
  //     ],
  //   });

  const sendObject = {
    msg: "Get Inbox List",
    inboxDetails,
  };

  return sendObject; // Return response
}

module.exports = {
  payload,
  handler,
  auth: true,
};
