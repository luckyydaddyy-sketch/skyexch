const config = require("../../config/config");
const mongo = require("../../config/mongodb");
const redisData = require("../../config/redis");
const { getSport } = require("../../config/sportsAPI");
const { EVENTS, SPORT_TYPE } = require("../../constants");
const eventEmitter = require("../../eventEmitter");
const { getDate } = require("../../utils/comman/date");
const { setFilterDetail } = require("../../utils/comman/sport");

async function handler(data, socket) {
  // const cricketRes = await getSport(4);
  // const soccerRes = await getSport(1);
  // const tennisRes = await getSport(2);

  await redisData.setValueInKeyWithExpiry(`${config.ONLINE_PLAYER}`, {
    date: new Date(),
  });

  let cricketRes = await redisData.getValueFromKey(config.SPORTS_LIST_CRICKET);
  if (!cricketRes) cricketRes = await getSport(4);
  let soccerRes = await redisData.getValueFromKey(config.SPORTS_LIST_SOCCER);
  if (!soccerRes) soccerRes = await getSport(1);
  let tennisRes = await redisData.getValueFromKey(config.SPORTS_LIST_TENNIS);
  if (!tennisRes) tennisRes = await getSport(2);

  let cricket =
    cricketRes && cricketRes.data
      ? await setFilterDetail(cricketRes.data, SPORT_TYPE.CRICKET, "play")
      : [];
  let soccer =
    soccerRes && soccerRes.data
      ? await setFilterDetail(soccerRes.data, SPORT_TYPE.SOCCER, "play")
      : [];
  let tennis =
    tennisRes && tennisRes.data
      ? await setFilterDetail(tennisRes.data, SPORT_TYPE.TENNIS, "play")
      : [];

  let eSoccer;
  let basketBall;

  if (config.eSoccer) {
    const eSoccerRes = await getSport(137);
    eSoccer =
      eSoccerRes && eSoccerRes.data
        ? await setFilterDetail(eSoccerRes.data, SPORT_TYPE.ESOCCER, "play")
        : [];
  }
  if (config.basketBall) {
    const basketBallRes = await getSport(7522);
    basketBall =
      basketBallRes && basketBallRes.data
        ? await setFilterDetail(
            basketBallRes.data,
            SPORT_TYPE.BASKETBALL,
            "play"
          )
        : [];
  }
  // const cricket = [0, 2];
  // const soccer = [0, 2];
  // const tennis = [0, 2];
  const sendData = {
    en: EVENTS.GET_LIVE_MATCH_COUNT,
    data: {
      cricket: cricket.length,
      soccer: soccer.length,
      tennis: tennis.length,
    },
    socket,
  };

  if (config.eSoccer) sendData.data.eSoccer = eSoccer.length;
  if (config.basketBall) sendData.data.basketBall = basketBall.length;

  eventEmitter.emit(EVENTS.SOCKET, sendData);
}

module.exports = handler;
