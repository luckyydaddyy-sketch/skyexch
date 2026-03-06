const joi = require("joi");

// const mongo = require("../../../config/mongodb");
const config = require("../../../config/config");
// const { getSport } = require("../../../config/sportsAPI");
const {
  // setFilterDetail,
  setDetailNewForInPlayAndCount,
} = require("../../../utils/comman/sport");
// const { SPORT_TYPE } = require("../../../constants");
const redisData = require("../../../config/redis");
const inPlay = require("../../helper/inPlay");
// const { getDate } = require("../../../utils/comman/date");

const payload = {
  body: joi.object().keys({
    filter: joi.string().valid("play", "today", "tomorrow").required(),
    userId: joi.string().optional().allow(""),
  }),
};

async function handler({ body }) {
  const { filter } = body;
  const { ONLINE_PLAYER, IN_PLAY_KET } = config;
  await redisData.setValueInKeyWithExpiry(`${ONLINE_PLAYER}`, {
    date: new Date(),
  });

  let inPlayData = await redisData.getValueFromKey(`${IN_PLAY_KET}:${filter}`);

  if (!inPlayData) {
    console.log(" I don't find the data ");
    inPlayData = await inPlay({
      body: {
        filter,
      },
    });

    await redisData.setValueInKeyWithExpiry(
        `${IN_PLAY_KET}:${filter}`,
        inPlayData
      );
  }

  return inPlayData;
}

module.exports = {
  payload,
  handler,
};
