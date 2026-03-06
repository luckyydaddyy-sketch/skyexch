const joi = require("joi");
const mongo = require("../../../config/mongodb");
const getMainSportForRisk = require("./getMainSportForRisk");
const { SPORT_TYPE } = require("../../../constants");

const payload = {
  body: joi.object().keys({
    search: joi.string().optional(),
    type: joi
      .string()
      .valid(
        SPORT_TYPE.CRICKET,
        SPORT_TYPE.SOCCER,
        SPORT_TYPE.TENNIS,
        SPORT_TYPE.ESOCCER,
        SPORT_TYPE.BASKETBALL
      )
      .optional(),
    page: joi.string().optional(),
    limit: joi.string().optional(),
  }),
};

// async function filterSportCount(sportName, counters) {
//   console.log("name :: ", sportName);
//   const name = sportName.split(" v ");
//   let left = 0;
//   let right = 0;
//   let draw = 0;
//   let total = 0;

//   counters.forEach((element) => {
//     console.log("name ::element :: ", element);
//     if (element._id === name[0]) {
//       left += element.count;
//     } else if (element._id === name[1]) {
//       right += element.count;
//     } else {
//       draw += element.count;
//     }
//     total += element.count;
//   });
//   return { left, right, draw, total };
// }

async function filterSportCount(
  sportName,
  betsHistory,
  betsHistoryCount
  // name
) {
  console.log("name :: ", sportName);
  const nameForCheck = sportName.split(" v ");
  let left = 0;
  let right = 0;
  let draw = 0;
  const total = betsHistoryCount;

  betsHistory.forEach((element) => {
    console.log("name ::element :: ", element);
    let name = element.winnerSelection;
    console.log("name ::: 0 :: ", name);

    const index = name.findIndex((el) => el === "The Draw");
    if (index !== -1 && index !== 2) {
      const n = name[index];
      name.splice(1, index);
      name.push(n);
    }

    // for team check
    if (name[0] !== nameForCheck[0]) {
      if (name.length === 3) {
        const teamName = name[2];
        nameForCheck.push(teamName);

        name = nameForCheck;
      } else {
        name = nameForCheck;
      }
    }

    console.log("name ::: 1 :: ", name);
    // this is left
    if (element.selection === name[0]) {
      console.log("enter in 0 :: ");
      if (element.betSide === "back") {
        left -= element.profit;
        right += element.betPlaced;
        if (name.length === 3) draw += element.betPlaced;
      } else {
        left += element.profit;
        right -= element.betPlaced;
        if (name.length === 3) draw -= element.betPlaced;
      }
      // if (element.betSide === "back") {
      //   console.log("enter in 0 :: back");
      //   // left -= element.profit;
      //   // right += element.betPlaced;
      //   right -= element.profit;
      //   left += element.betPlaced;
      //   if (name.length === 3) {
      //     draw -= element.profit;
      //   }
      // } else {
      //   console.log("enter in 0 :: lay");
      //   // right -= element.betPlaced;
      //   // left += element.profit;
      //   left -= element.betPlaced;
      //   right += element.profit;
      //   if (name.length === 3) {
      //     draw += element.profit;
      //   }
      // }
      console.log("enter in 0 :: data : left : ", left);
      console.log("enter in 0 :: data : right : ", right);
      console.log("enter in 0 :: data : draw : ", draw);
      // left += element.count;
    } else if (element.selection === name[1]) {
      // this is right
      if (element.betSide === "back") {
        right -= element.profit;
        left += element.betPlaced;
        if (name.length === 3) draw += element.betPlaced;
      } else {
        right += element.profit;
        left -= element.betPlaced;
        if (name.length === 3) draw -= element.betPlaced;
      }
      // if (element.betSide === "back") {
      //   // left -= element.profit;
      //   // right += element.betPlaced;
      //   right -= element.profit;
      //   left += element.betPlaced;
      //   if (name.length === 3) {
      //     // draw += element.profit;
      //     draw += element.betPlaced;
      //   }
      // } else {
      //   // right -= element.betPlaced;
      //   // left += element.profit;
      //   left -= element.betPlaced;
      //   right += element.profit;
      //   if (name.length === 3) {
      //     // draw += element.profit;
      //     draw -= element.betPlaced;
      //   }
      // }

      console.log("enter in 1 :: data : left : ", left);
      console.log("enter in 1 :: data : right : ", right);
      console.log("enter in 1 :: data : draw : ", draw);
      // right += element.count;
    } else if (element.selection === name[2]) {
      // here is static
      console.log(" :: static :::");
      if (element.betSide === "back") {
        draw -= element.profit;

        right += element.betPlaced;
        left += element.betPlaced;
      } else {
        draw += element.profit;
        right -= element.betPlaced;
        left -= element.betPlaced;
      }
      // if (element.betSide === "back") {
      //   // draw += element.betPlaced;
      //   // left -= element.profit;
      //   // right -= element.profit;
      //   draw -= element.profit;
      //   left += element.betPlaced;
      //   right += element.betPlaced;
      // } else {
      //   draw += element.betPlaced;
      //   left += element.profit;
      //   right += element.profit;
      // }
      // draw += element.count;s

      console.log("enter in 2 :: data : left : ", left);
      console.log("enter in 2 :: data : right : ", right);
      console.log("enter in 2 :: data : draw : ", draw);
    }
  });

  return { left, right, draw, total };
}

async function handler({ body, user }) {
  const { userId } = user;
  const { search, type, page, limit } = body;

  const query = {
    winner: "",
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { marketId: { $regex: search, $options: "i" } },
    ];

    if (/^\d+$/.test(search)) {
      query.$or.push({ gameId: Number(search) });
    }
  }
  if (type) query.type = type;

  const matchIds = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .distinct({
      field: "matchId",
      query: {
        betStatus: { $ne: "completed" },
      },
    });
  const myUsersIds = await mongo.bettingApp.model(mongo.models.users).distinct({
    field: "_id",
    query: {
      whoAdd: userId,
    },
  });
  console.log("matchIds :: ", matchIds);
  if (matchIds.length !== 0) {
    query._id = {
      $in: matchIds,
    };
  }
  //   if (type && type === "All")
  //     query.type = { $in: ["cricket", "soccer", "tennis"] };

  let sportList = await mongo.bettingApp.model(mongo.models.sports).paginate({
    query,
    page,
    limit,
    select: {
      name: 1,
      openDate: 1,
      startDate: 1,
      gameId: 1,
      marketId: 1,
      type: 1,
    },
  });

  console.log("sportList ::: ", sportList);
  const bets = [];
  for await (const bet of sportList.results) {
    // const oneMatch = await mongo.bettingApp
    //   .model(mongo.models.betsHistory)
    //   .findOne({
    //     query: {
    //       userId: {
    //         $in: myUsersIds,
    //       },
    //       matchId: bet._id,
    //       betStatus: { $ne: "completed" },
    //       betType: { $in: ["odds", "bookMark"] },
    //     },
    //   });

    // console.log("oneMatch ::: ", oneMatch);
    const betsHistoryCount = await mongo.bettingApp
      .model(mongo.models.betsHistory)
      .countDocuments({
        query: {
          userId: {
            $in: myUsersIds,
          },
          matchId: bet._id,
          betStatus: { $ne: "completed" },
        },
      });
    console.log("betsHistoryCount :: ", betsHistoryCount);
    if (betsHistoryCount) {
      const betsHistory = await mongo.bettingApp
        .model(mongo.models.betsHistory)
        .find({
          query: {
            userId: {
              $in: myUsersIds,
            },
            matchId: bet._id,
            betStatus: { $ne: "completed" },
            betType: { $in: ["odds", "bookMark"] },
          },
        });

      console.log("sport ::: ", betsHistory);
      // const count = await filterSportCount(bet.name, sport);
      const count = await filterSportCount(
        bet.name,
        betsHistory,
        betsHistoryCount
        // betsHistory && betsHistory.length > 0 ? betsHistory[0].winnerSelection : []
      );
      if (count.total !== 0) {
        // bet.count = count;
        bet.count = {
          left: Number(count.left.toFixed(2)),
          right: Number(count.right.toFixed(2)),
          draw: Number(count.draw.toFixed(2)),
          total: count.total,
        };
        const mainBetData = await getMainSportForRisk(
          bet.type,
          bet.gameId,
          bet.marketId
        );
        bet.mainBetData = mainBetData;
        // bet.mainBetData = {};
        bets.push(bet);
      }
    }
  }
  sportList.results = bets;

  sportList.msg = "risk manager.";

  return sportList;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
