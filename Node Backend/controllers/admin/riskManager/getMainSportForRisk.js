const config = require("../../../config/config");
const redisData = require("../../../config/redis");
const { getFastSport } = require("../../../config/sportsAPI");
const { SPORT_TYPE } = require("../../../constants");

const getMainSportForRisk = async (type, gameId, marketId) => {
  console.log("getMainSportForRisk ::: type, gameId, marketId :: ", {
    type,
    gameId,
    marketId,
  });

  let number = 1;
  if (type === SPORT_TYPE.CRICKET) {
    number = 4;
  } else if (type === SPORT_TYPE.SOCCER) {
    number = 1;
  } else if (type === SPORT_TYPE.TENNIS) {
    number = 2;
  } else if (type === SPORT_TYPE.ESOCCER) {
    number = 137;
  } else if (type === SPORT_TYPE.BASKETBALL) {
    number = 7522;
  }

  
  let sport = await redisData.getValueFromKey(
    number === 4
      ? config.SPORTS_LIST_CRICKET
      : number === 1
      ? config.SPORTS_LIST_SOCCER
      : config.SPORTS_LIST_TENNIS
  );
  if(!sport) sport = await getFastSport(number);

  // console.log("getMainSportForRisk ::: sport :: ", sport);
  let mainBet = {};
  if (sport && sport.data && sport.data.data)
    for (let i = 0; i < sport.data.data.length; i++) {
      const crt = sport.data.data[i];
      console.log("=============== match in ======== ");
      if (crt.marketId === marketId && crt.gameId === gameId) {
        console.log("=============== match fount ======== ");
        mainBet = crt;
        break;
      }
    }
  // sport.data.data.forEach((crt) => {
  //   if (crt.marketId === marketId && crt.gameId === gameId) {
  //     mainBet = crt;
  //   }
  // });

  console.log("getMainSportForRisk ::: mainBet :: ", mainBet);
  return mainBet;
};

module.exports = getMainSportForRisk;
