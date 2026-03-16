const config = require("../../config/config");
const redisData = require("../../config/redis");
const { getFastSport } = require("../../config/sportsAPI");
const { EVENTS, SPORT_TYPE } = require("../../constants");
const eventEmitter = require("../../eventEmitter");
const { setFilterDetailsPearData } = require("../../utils/comman/sport");

async function handler(data, socket) {
  await redisData.setValueInKeyWithExpiry(`${config.ONLINE_PLAYER}`, {
    date: new Date(),
  });

  const sportData = await redisData.getValueFromKey(config.VELLKI_SPORTS_COUNT);
  if (sportData) {
    sportData.socket = socket;
    return eventEmitter.emit(EVENTS.SOCKET, sportData);
  }
  let cricketRes = await redisData.getValueFromKey(config.SPORTS_LIST_CRICKET);
  if (!cricketRes) cricketRes = await getFastSport(4);
  let soccerRes = await redisData.getValueFromKey(config.SPORTS_LIST_SOCCER);
  if (!soccerRes) soccerRes = await getFastSport(1);
  let tennisRes = await redisData.getValueFromKey(config.SPORTS_LIST_TENNIS);
  if (!tennisRes) tennisRes = await getFastSport(2);
  const getArray = (res) => Array.isArray(res) ? res : res?.data;

  let cricket = getArray(cricketRes)
    ? await setFilterDetailsPearData(getArray(cricketRes), SPORT_TYPE.CRICKET, "play")
    : { inplay: 0, today: 0, tomorrow: 0 };

  let soccer = getArray(soccerRes)
    ? await setFilterDetailsPearData(getArray(soccerRes), SPORT_TYPE.SOCCER, "play")
    : { inplay: 0, today: 0, tomorrow: 0 };

  let tennis = getArray(tennisRes)
    ? await setFilterDetailsPearData(getArray(tennisRes), SPORT_TYPE.TENNIS, "play")
    : { inplay: 0, today: 0, tomorrow: 0 };

  let eSoccer;
  let basketBall;

  if (config.eSoccer) {
    const eSoccerRes = await getFastSport(137);
    eSoccer = getArray(eSoccerRes)
      ? await setFilterDetailsPearData(getArray(eSoccerRes), SPORT_TYPE.ESOCCER, "play")
      : { inplay: 0, today: 0, tomorrow: 0 };
  }

  if (config.basketBall) {
    const basketBallRes = await getFastSport(7522);
    basketBall = getArray(basketBallRes)
      ? await setFilterDetailsPearData(getArray(basketBallRes), SPORT_TYPE.BASKETBALL, "play")
      : { inplay: 0, today: 0, tomorrow: 0 };
  }

  const inPlay = {
    all: 0,
    cricket: 0,
    soccer: 0,
    tennis: 0,
  };
  const today = {
    all: 0,
    cricket: 0,
    soccer: 0,
    tennis: 0,
  };
  const tomorrow = {
    all: 0,
    cricket: 0,
    soccer: 0,
    tennis: 0,
  };
  Object.keys(cricket).forEach((key) => {
    if (key === "inplay") {
      inPlay.all += cricket[key];
      inPlay.cricket += cricket[key];
    } else if (key === "today") {
      today.all += cricket[key];
      today.cricket += cricket[key];
    } else if (key === "tomorrow") {
      tomorrow.all += cricket[key];
      tomorrow.cricket += cricket[key];
    }
  });
  Object.keys(soccer).forEach((key) => {
    if (key === "inplay") {
      inPlay.all += soccer[key];
      inPlay.soccer += soccer[key];
    } else if (key === "today") {
      today.all += soccer[key];
      today.soccer += soccer[key];
    } else if (key === "tomorrow") {
      tomorrow.all += soccer[key];
      tomorrow.soccer += soccer[key];
    }
  });
  Object.keys(tennis).forEach((key) => {
    if (key === "inplay") {
      inPlay.all += tennis[key];
      inPlay.tennis += tennis[key];
    } else if (key === "today") {
      today.all += tennis[key];
      today.tennis += tennis[key];
    } else if (key === "tomorrow") {
      tomorrow.all += tennis[key];
      tomorrow.tennis += tennis[key];
    }
  });

  if (config.eSoccer) {
    inPlay.eSoccer = 0;
    today.eSoccer = 0;
    tomorrow.eSoccer = 0;
    Object.keys(eSoccer).forEach((key) => {
      if (key === "inplay") {
        inPlay.all += eSoccer[key];
        inPlay.eSoccer += eSoccer[key];
      } else if (key === "today") {
        today.all += eSoccer[key];
        today.eSoccer += eSoccer[key];
      } else if (key === "tomorrow") {
        tomorrow.all += eSoccer[key];
        tomorrow.eSoccer += eSoccer[key];
      }
    });
  }
  if (config.basketBall) {
    inPlay.basketBall = 0;
    today.basketBall = 0;
    tomorrow.basketBall = 0;
    Object.keys(basketBall).forEach((key) => {
      if (key === "inplay") {
        inPlay.all += basketBall[key];
        inPlay.basketBall += basketBall[key];
      } else if (key === "today") {
        today.all += basketBall[key];
        today.basketBall += basketBall[key];
      } else if (key === "tomorrow") {
        tomorrow.all += basketBall[key];
        tomorrow.basketBall += basketBall[key];
      }
    });
  }

  const sendData = {
    en: EVENTS.GET_LIVE_MATCH_COUNT_FOR_VELKI,
    data: {
      inPlay,
      today,
      tomorrow,
    },
    socket,
  };
  eventEmitter.emit(EVENTS.SOCKET, sendData);
}

module.exports = handler;
