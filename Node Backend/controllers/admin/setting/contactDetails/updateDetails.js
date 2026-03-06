const joi = require("joi");

const mongo = require("../../../../config/mongodb");

const payload = {
  body: joi.object().keys({
    bonus: joi.number().optional().default(0),
    deposit_min: joi.number().optional().default(0),
    deposit_max: joi.number().optional().default(0),
    withdrow_min: joi.number().optional().default(0),
    withdrow_max: joi.number().optional().default(0),
    email: joi.string().optional().default("").allow(""),
    whatsapp: joi.string().optional().default("").allow(""),
    facebook: joi.string().optional().default("").allow(""),
  }).unknown(true),
};

async function handler({ body, user }) {
  const { userId } = user;
  const {
    bonus,
    deposit_min,
    deposit_max,
    withdrow_min,
    withdrow_max,
    email,
    whatsapp,
    facebook,
  } = body;

  await mongo.bettingApp.model(mongo.models.contactDetails).findOneAndUpdate({
    query: {
      userId,
    },
    update: {
      bonus,
      deposit_min,
      deposit_max,
      withdrow_min,
      withdrow_max,
      email,
      whatsapp,
      facebook,
    },
    options: {
      upsert: true,
    },
  });

  // console.log("contact:: ", contact);
  const contact = {
    msg: "contactDetails updated!",
  };

  return contact;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
