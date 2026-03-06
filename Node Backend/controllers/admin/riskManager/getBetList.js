const joi = require("joi");
const mongo = require("../../../config/mongodb");
const { betsHistoryDataFiter } = require("../../utils/filterData");

const payload = {
  body: joi.object().keys({
    id: joi.string().required(), // sport id
    search: joi.string().optional().allow(""),
    betType: joi
      .array()
      .items(
        joi.string().optional().valid("odds", "bookMark", "session", "premium")
      )
      .optional(),
  }),
};

async function handler({ user, body }) {
  console.log("body :: ", body);
  const { userId } = user;
  const { id, betType, search } = body;

  const userQuery = {
    whoAdd: userId,
  };
  if (search && search !== "") {
    userQuery.user_name = { $regex: `^${search}$`, $options: "i" };
  }
  const myUsersIds = await mongo.bettingApp.model(mongo.models.users).distinct({
    field: "_id",
    query: userQuery,
  });

  const query = {
    winner: "",
    matchId: mongo.ObjectId(id),
    userId: {
      $in: myUsersIds,
    },
  };

  if (betType && betType.length) {
    query.betType = { $in: betType };
  }
  const oneMatch = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .findOne({
      query: {
        matchId: mongo.ObjectId(id),
        betStatus: { $ne: "completed" },
        betType: { $in: ["odds", "bookMark"] },
      },
    });
  const name =
    oneMatch && oneMatch.winnerSelection ? oneMatch.winnerSelection : [];

  console.log("name :: ", name);
  let betsHistory = await mongo.bettingApp
    .model(mongo.models.betsHistory)
    .find({
      query,
      populate: {
        path: "userId",
        model: await mongo.bettingApp.model(mongo.models.users),
        select: ["agent_level", "user_name"],
      },
      select: {
        type: 1,
        matchId: 1,
        betType: 1,
        selection: 1,
        betSide: 1,
        betId: 1,
        createdAt: 1,
        stake: 1,
        oddsUp: 1,
        oddsDown: 1,
        userId: 1,
        exposure: 1,
        deleted: 1,
        profit: 1,
        betPlaced: 1,
        winnerSelection: 1,
        subSelection: 1,
        fancyYes: 1,
        fancyNo: 1,
      },
    });

  // console.log("sports : bets list ::: ", betsHistory);
  betsHistory = await betsHistoryDataFiter(betsHistory);

  let adminBook = [
    {
      userName: "admin",
      left: 0,
      right: 0,
      draw: 0,
    },
  ];
  betsHistory.forEach((element) => {
    console.log("name ::element :: ", element);

    if (element.betType === "odds" || element.betType === "bookMark") {
      const book = {
        userName: element.userId.user_name,
        left: 0,
        right: 0,
        draw: 0,
      };
      if (element.selection === name[0]) {
        if (element.betSide === "back") {
          book.left -= element.profit;
          book.right += element.betPlaced;

          if (name.length === 3) {
            book.draw += element.betPlaced;
          }
        } else {
          book.left += element.profit;
          book.right -= element.betPlaced;
          if (name.length === 3) {
            book.draw -= element.betPlaced;
          }
        }
        // left += element.count;
      } else if (element.selection === name[1]) {
        if (element.betSide === "back") {
          book.right -= element.profit;
          book.left += element.betPlaced;
          if (name.length === 3) {
            book.draw += element.betPlaced;
          }
        } else {
          book.right += element.profit;
          book.left -= element.betPlaced;
          if (name.length === 3) {
            book.draw -= element.betPlaced;
          }
        }
        // right += element.count;
      } else if (element.selection === name[2]) {
        // here is static
        console.log(" :: static :::");
        if (element.betSide === "back") {
          book.draw -= element.profit;
          book.left += element.betPlaced;
          book.right += element.betPlaced;
        } else {
          book.draw += element.profit;
          book.left -= element.betPlaced;
          book.right -= element.betPlaced;
        }
        book.draw += element.count;
      }
      const index = adminBook.findIndex(
        (ele) => ele.userName === book.userName
      );
      if (index === -1) {
        adminBook.push(book);
      } else {
        adminBook[index].left += book.left;
        adminBook[index].right += book.right;
        adminBook[index].draw += book.draw;
      }
    }
  });

  adminBook.forEach((element, index) => {
    if (index !== 0) {
      adminBook[0].draw += element.draw;
      adminBook[0].left += element.left;
      adminBook[0].right += element.right;
    }
  });

  adminBook = adminBook.map((element) => {
    const newAdminBook = {
      userName: element.userName,
      left:
        element.left > 0 || element.left < 0
          ? Number(element.left.toFixed(2))
          : element.left,
      right:
        element.right > 0 || element.right < 0
          ? Number(element.right.toFixed(2))
          : element.right,
      draw:
        element.draw > 0 || element.draw < 0
          ? Number(element.draw.toFixed(2))
          : element.draw,
    };

    return newAdminBook;
  });
  const sendObject = {
    msg: "sports bet history.",
    betsHistory,
    adminBook,
  };
  // betsHistory.msg = "sports bet history.";
  // betsHistory.adminBook = adminBook;

  return sendObject;
}

module.exports = {
  payload,
  handler,
  auth: true,
};
