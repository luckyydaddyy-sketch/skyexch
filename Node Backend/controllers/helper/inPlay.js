const config = require("../../config/config");

// const redisData = require("../../config/redis");
const { getSport } = require("../../config/sportsAPI");
const { SPORT_TYPE } = require("../../constants");
const { setDetailNewForInPlayAndCount } = require("../../utils/comman/sport");

async function inPlay({ body }) {
  const redisData = require("../../config/redis");
  // console.log("in-play :: time :: enter : ", new Date());
  const { filter, userId } = body;

  // const cricketRes = await getSport(4); // 100 mili
  // // console.log("in-play :: time :: enter : cricketRes :", new Date());
  // const soccerRes = await getSport(1);
  // // console.log("in-play :: time :: enter : soccerRes : ", new Date());
  // const tennisRes = await getSport(2);
  // // console.log("in-play :: time :: enter : tennisRes : ", new Date());

  let cricketRes = await redisData.getValueFromKey(config.SPORTS_LIST_CRICKET);
  if (!cricketRes) cricketRes = await getSport(4);
  let soccerRes = await redisData.getValueFromKey(config.SPORTS_LIST_SOCCER);
  if (!soccerRes) soccerRes = await getSport(1);
  let tennisRes = await redisData.getValueFromKey(config.SPORTS_LIST_TENNIS);
  if (!tennisRes) tennisRes = await getSport(2);

  let cricket = await setDetailNewForInPlayAndCount(
    cricketRes.data,
    SPORT_TYPE.CRICKET,
    filter,
    userId
  );
  // console.log("in-play :: time :: enter : cricket : ", new Date());
  let soccer = await setDetailNewForInPlayAndCount(
    soccerRes.data,
    SPORT_TYPE.SOCCER,
    filter,
    userId
  );
  // console.log("in-play :: time :: enter : soccer : ", new Date());
  let tennis = await setDetailNewForInPlayAndCount(
    tennisRes.data,
    SPORT_TYPE.TENNIS,
    filter,
    userId
  );
  let eSoccer;
  let basketBall;
  if (config.eSoccer) {
    const eSoccerRes = await getSport(137);
    eSoccer = await setDetailNewForInPlayAndCount(
      eSoccerRes.data,
      SPORT_TYPE.ESOCCER,
      filter,
      userId
    );
  }
  if (config.basketBall) {
    const basketBallRes = await getSport(7522);
    basketBall = await setDetailNewForInPlayAndCount(
      basketBallRes.data,
      SPORT_TYPE.BASKETBALL,
      filter,
      userId
    );
  }
  // console.log("in-play :: time :: enter : tennis : ", new Date());

  const sendObject = {
    msg: "in-Play info!",
    cricket,
    soccer,
    tennis,
    //   filter
  };

  if (config.eSoccer) sendObject.eSoccer = eSoccer;
  if (config.basketBall) sendObject.basketBall = basketBall;

  return sendObject; // Return response
}

module.exports = inPlay;
