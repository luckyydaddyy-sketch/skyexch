const joi = require("joi");
const mongo = require("../../../config/mongodb");
const {
  sendUpdateBalanceEvent,
} = require("../../../utils/comman/updateBalance");
const {
  betsLastExposureOdds,
  betsLastExposure,
  betsLastExposurePremium,
  currantBetRemoveOdds,
  currantBetRemove,
  currantBet,
  currantBetPremiumRemove,
  currantBetPremium,
  currantBetOdds,
} = require("../../utils/sport/getUserBets");
const { getRedLock } = require("../../../config/redLock");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(), // match id
    flag: joi.boolean().required(), // true = delete, false = re-set bet
  }),
};

async function handler({ user, body }) {
  const getLock = getRedLock();
  const matchLock = await getLock.acquire([user.userId], 3000);
  try {
    const { id, flag } = body;

    console.log("delete : flag :: ", flag);
    console.log("delete : typeof flag :: ", typeof flag);

    const deleted = flag === "false" || flag === false ? true : false;
    const newFlag = flag === "false" || flag === false ? false : true;

    console.log("in flag deleted :: ", deleted);
    console.log("in flag newFlag :: ", newFlag);

    const query = {
      winner: "",
      _id: mongo.ObjectId(id),
      deleted,
    };

    console.log("delete :: query ::", query);

    if (newFlag) console.log("is newFlag");
    if (!newFlag) console.log("is newFlag new");
    let betsHistory = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .findOne({
        query,
      });
    if (betsHistory) {
      let newExp = 0;
      let oldExp = 0;
      let oldBets = {};
      if (
        betsHistory.betType === "odds" ||
        betsHistory.betType === "bookMark"
      ) {
        if (newFlag)
          oldBets = await currantBetRemoveOdds(betsHistory, betsHistory.userId);
        if (!newFlag)
          oldBets = await currantBetOdds(betsHistory, betsHistory.userId);
        // oldBets = await betsLastExposureOdds(
        //   betsHistory.userId,
        //   betsHistory.selection,
        //   betsHistory.matchId,
        //   betsHistory.type,
        //   betsHistory.betType
        // );
      } else if (betsHistory.betType === "session") {
        if (newFlag)
          oldBets = await currantBetRemove(betsHistory, betsHistory.userId);
        if (!newFlag)
          oldBets = await currantBet(betsHistory, betsHistory.userId);
        // betExp = await betsLastExposure(
        //   betsHistory.userId,
        //   betsHistory.selection,
        //   betsHistory.matchId,
        //   betsHistory.type,
        //   betsHistory.betType
        // );
      } else {
        if (newFlag)
          oldBets = await currantBetPremiumRemove(
            betsHistory,
            betsHistory.userId
          );
        if (!newFlag)
          oldBets = await currantBetPremium(betsHistory, betsHistory.userId);
        // betExp = await betsLastExposurePremium(
        //   betsHistory.userId,
        //   betsHistory.selection,
        //   betsHistory.matchId,
        //   betsHistory.type,
        //   betsHistory.betType
        // );
      }
      console.log("deleteBet : oldBets :: ", oldBets);
      if (Object.keys(oldBets).length) {
        console.log("enter in oldBets len: ", oldBets);
        await mongo.bettingApp.model(mongo.models.users).updateOne({
          query: {
            _id: mongo.ObjectId(betsHistory.userId),
          },
          update: {
            $inc: {
              balance: oldBets.oldExp,
              exposure: -oldBets.oldExp,
            },
          },
        });
        await mongo.bettingApp.model(mongo.models.users).updateOne({
          query: {
            _id: mongo.ObjectId(betsHistory.userId),
          },
          update: {
            $inc: {
              balance: -oldBets.newExp,
              exposure: oldBets.newExp,
            },
          },
        });
      }
    }

    await mongo.bettingApp.model(mongo.models.betsHistory).updateOne({
      query,
      update: {
        deleted: newFlag,
      },
    });

    // console.log("delete : sports : bets list ::: ", betsHistory);

    sendUpdateBalanceEvent(id, "");
    const sendMessage = {
      msg: "bet is delete!",
    };
    if (!newFlag) sendMessage.msg = "bet is re-set!";

    return sendMessage;
  } catch (error) {
    console.error("delete : bet : error : ", error, body);
  } finally {
    await getLock.release(matchLock);
  }
}

module.exports = {
  payload,
  handler,
  auth: true,
};
