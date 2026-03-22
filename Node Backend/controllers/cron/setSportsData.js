const moment = require("moment-timezone");
const config = require("../../config/config");
const mongo = require("../../config/mongodb");
const { getFastSport, getSportradarDetailsWithFallback } = require("../../config/sportsAPI");
const { SPORT_TYPE } = require("../../constants");

const getMySportLimit = async (sportLimit) => {
  Object.keys(sportLimit).map((key) => {
    const { min, max } = sportLimit[key];
    return {
      [key]: {
        min,
        max,
      },
    };
  });
};
const setSportLeageData = async (
  matchDetail,
  type,
  siteInfo,
  sportDefaultLimit,
  typeNumber
) =>
  // console.log("setSportLeageData :: matchDetail : ", matchDetail);
  new Promise(async (resolve, reject) => {
    // const sportMinMax = siteInfo[type];
    const typeDefaults = (sportDefaultLimit && sportDefaultLimit[type]) ? sportDefaultLimit[type] : {};
    const sportMinMax = Object.fromEntries(
      Object.entries(typeDefaults).map(([key, value]) => [
        key,
        { min: value?.min, max: value?.max },
      ])
    );
    const newMaxProfit = {
      odds: typeDefaults?.bet_odds_limit?.maxProfit || 0,
      bookmaker: typeDefaults?.bet_bookmaker_limit?.maxProfit || 0,
      fancy: typeDefaults?.bet_fancy_limit
        ? typeDefaults.bet_fancy_limit.maxProfit
        : 0,
      premium: typeDefaults?.bet_premium_limit?.maxProfit || 0,
    };
    const sportDetail = [];
    const matchArray = Array.isArray(matchDetail) ? matchDetail : matchDetail?.data || [];
    if (matchArray && matchArray.length > 0)
      for await (const crt of matchArray) {
        // console.log("setSportLeageData :: for :: crt :: ", crt);
        const { srEventId, srSportId } = await getSportradarDetailsWithFallback(crt, typeNumber);
        
        const query = {
          marketId: crt.marketId,
          gameId: crt.gameId,
          type,
        };
        const matchInfo = await mongo.bettingApp
          .model(mongo.models.sportsLeage)
          .findOne({
            query,
          });

        if (matchInfo) {
          console.log(`find match :: ${crt.eventName} | srEventId: ${srEventId} | srSportId: ${srSportId}`);
          const update = {
            openDate: crt.openDate,
            startDate: new Date(moment(crt.openDate).tz("Asia/Dhaka")),
            scores: crt.scores || "",
            activeStatus: {
              bookmaker: crt.m1 || false,
              fancy: crt.f || false,
              premium: crt.p || false,
              status:
                matchInfo.openDate === crt.openDate
                  ? matchInfo.activeStatus.status
                  : false,
            },
            // 9Wicket Specific Flags
            f: crt.f || false,
            m1: crt.m1 || false,
            p: crt.p || false,
            pf: crt.pf || false,
            tv: crt.tv || false,
            ematch: crt.ematch || 0,
            name: crt.eventName,
            sportradarApiSiteEventId: srEventId,
            sportradarSportId: srSportId,
            status: matchInfo.status,
          };

          await mongo.bettingApp.model(mongo.models.sportsLeage).updateOne({
            query,
            update: { $set: update },
          });
          sportDetail.push({
            _id: matchInfo._id.toString(),
            name: crt.eventName,
            marketId: matchInfo.marketId,
            gameId: matchInfo.gameId,
            openDate: crt.openDate,
            startDate: new Date(moment(crt.openDate).tz("Asia/Dhaka")),
            activeStatus: matchInfo.activeStatus,
            status: matchInfo.status,
            // matchInfo.openDate === crt.openDate ? matchInfo.status : false,
          });
        } else {
          console.log("create match :: ");
          const maxProfit = {
            odds: 2500,
            bookmaker: 5000,
            fancy: 3300,
            premium: 100,
          };
          const document = {
            name: crt.eventName,
            openDate: crt.openDate,
            startDate: new Date(moment(crt.openDate).tz("Asia/Dhaka")),
            type,
            gameId: crt.gameId,
            marketId: crt.marketId,
            scores: crt.scores || "",
            activeStatus: {
              bookmaker: crt.m1 || false,
              fancy: crt.f || false,
              premium: crt.p || false,
              status: true,
            },
            // 9Wicket Specific Flags
            f: crt.f || false,
            m1: crt.m1 || false,
            p: crt.p || false,
            pf: crt.pf || false,
            tv: crt.tv || false,
            ematch: crt.ematch || 0,
            suspend: {
              bookmaker: false,
              fancy: false,
              premium: false,
              odds: false,
            },
            oddsLimit: sportMinMax.oddsLimit,
            // {
            //   min: 1,
            //   max: 2,
            // },
            bet_odds_limit: sportMinMax.bet_odds_limit,
            // {
            //   min: 1,
            //   max: 2,
            // },
            bet_bookmaker_limit: sportMinMax.bet_bookmaker_limit,
            //  {
            //   min: 1,
            //   max: 2,
            // },
            bet_fancy_limit: sportMinMax?.bet_fancy_limit
              ? sportMinMax?.bet_fancy_limit
              : {
                min: 1,
                max: 2,
              },
            bet_premium_limit: sportMinMax?.bet_premium_limit
              ? sportMinMax?.bet_premium_limit
              : {
                min: 1,
                max: 2,
              },
            max_profit_limit: newMaxProfit ? newMaxProfit : maxProfit,
            Turnament: crt.Turnament,
            TurnamentId: crt.TurnamentId,
            sportradarApiSiteEventId: srEventId,
            sportradarSportId: srSportId,
          };
          const insertMatch = await mongo.bettingApp
            .model(mongo.models.sportsLeage)
            .insertOne({
              document,
            });

          sportDetail.push({
            _id: insertMatch._id.toString(),
            name: crt.eventName,
            marketId: document.marketId,
            gameId: document.gameId,
            openDate: document.openDate,
            startDate: document.startDate,
            activeStatus: document.activeStatus,
            status: false,
          });
        }

        const sportInfo = await mongo.bettingApp
          .model(mongo.models.sports)
          .findOne({
            query,
          });

        if (sportInfo) {
          if (sportInfo.openDate !== crt.openDate) {
            await mongo.bettingApp.model(mongo.models.sports).updateOne({
              query,
              update: {
                $set: {
                  name: crt.eventName,
                  openDate: crt.openDate,
                  startDate: new Date(moment(crt.openDate).tz("Asia/Dhaka")),
                  status: true,
                  scores: crt.scores || "",
                  // 9Wicket Specific Flags
                  f: crt.f || false,
                  m1: crt.m1 || false,
                  p: crt.p || false,
                  pf: crt.pf || false,
                  tv: crt.tv || false,
                  ematch: crt.ematch || 0,
                  sportradarApiSiteEventId: srEventId,
                  sportradarSportId: srSportId,
                }
              },
            });
          } else {
            // Even if openDate is same, update the flags to stay in sync with listing
            await mongo.bettingApp.model(mongo.models.sports).updateOne({
              query,
              update: {
                $set: {
                  f: crt.f || false,
                  m1: crt.m1 || false,
                  p: crt.p || false,
                  pf: crt.pf || false,
                  tv: crt.tv || false,
                  ematch: crt.ematch || 0,
                  sportradarApiSiteEventId: srEventId,
                  sportradarSportId: srSportId,
                  status: true,
                }
              },
            });
          }
        } else {
          // ── NEW: Insert into sports collection so getSportsDetails can find it ──
          console.log(`[setSportsData] Inserting new event into sports: gameId=${crt.gameId} type=${type}`);
          const maxProfit = {
            odds: 2500,
            bookmaker: 5000,
            fancy: 3300,
            premium: 100,
          };
          const sportsDocument = {
            name: crt.eventName,
            openDate: crt.openDate,
            startDate: new Date(moment(crt.openDate).tz("Asia/Dhaka")),
            type,
            gameId: crt.gameId,
            marketId: crt.marketId,
            scores: crt.scores || "",
            status: true, // Auto-enable: admin can disable from panel if needed
            activeStatus: {
              bookmaker: crt.m1 || false,
              fancy: crt.f || false,
              premium: crt.p || false,
              status: true,
            },
            // 9Wicket Specific Flags
            f: crt.f || false,
            m1: crt.m1 || false,
            p: crt.p || false,
            pf: crt.pf || false,
            tv: crt.tv || false,
            ematch: crt.ematch || 0,
            suspend: {
              bookmaker: false,
              fancy: false,
              premium: false,
              odds: false,
            },
            winnerSelection: [],
            oddsLimit: sportMinMax.oddsLimit,
            bet_odds_limit: sportMinMax.bet_odds_limit,
            bet_bookmaker_limit: sportMinMax.bet_bookmaker_limit,
            bet_fancy_limit: sportMinMax?.bet_fancy_limit
              ? sportMinMax.bet_fancy_limit
              : { min: 1, max: 2 },
            bet_premium_limit: sportMinMax?.bet_premium_limit
              ? sportMinMax.bet_premium_limit
              : { min: 1, max: 2 },
            max_profit_limit: newMaxProfit ? newMaxProfit : maxProfit,
            sportradarApiSiteEventId: srEventId,
            sportradarSportId: srSportId,
          };
          await mongo.bettingApp.model(mongo.models.sports).insertOne({
            document: sportsDocument,
          });
        }
      }
    resolve(sportDetail);
  });

async function setSportsData() {
  const sportNumbers = [4, 1, 2, 137, 7522];
  const siteInfo = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({});

  const sportDefaultLimit = await mongo.bettingApp
    .model(mongo.models.deafultSetting)
    .findOne({});
  const allow = [4, 1, 2];
  for await (const typeNumber of sportNumbers) {
    let type = SPORT_TYPE.CRICKET;
    if (typeNumber === 4) {
      type = SPORT_TYPE.CRICKET;
    } else if (typeNumber === 1) {
      type = SPORT_TYPE.SOCCER;
    } else if (typeNumber === 2) {
      type = SPORT_TYPE.TENNIS;
    } else if (typeNumber === 137) {
      type = SPORT_TYPE.ESOCCER;
    } else if (typeNumber === 7522) {
      type = SPORT_TYPE.BASKETBALL;
    }
    if (
      (config.eSoccer && type === SPORT_TYPE.ESOCCER) ||
      (config.basketBall && type === SPORT_TYPE.BASKETBALL) ||
      allow.includes(typeNumber)
    ) {
      const sport = await getFastSport(typeNumber);
      await setSportLeageData(sport, type, siteInfo, sportDefaultLimit, typeNumber);
    }
  }
}

module.exports = { setSportsData, setSportLeageData };
