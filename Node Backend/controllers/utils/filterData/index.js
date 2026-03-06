const betsHistoryDataFiter = (betsHistory) => {
  if (!betsHistory || (betsHistory && betsHistory.length === 0)) {
    return betsHistory;
  }
  const updateBetHistory = betsHistory.map((value) => {
    if (typeof value.profit !== "undefined")
      value.profit = Number(value.profit.toFixed(2));
    if (typeof value.exposure !== "undefined")
      value.exposure = Number(value.exposure.toFixed(2));

    // if (value.betType === "premium") {
    //   value.selection = `${value.selection}/${value.subSelection}`;
    // }

    return value;
  });

  return updateBetHistory;
};

const casinoMatchHistoryFilter = async (betsHistory) => {
  if (!betsHistory || (betsHistory && betsHistory.length === 0)) {
    return betsHistory;
  }

  const updateBetHistory = betsHistory.map((value) => {
    // if (typeof value.profit !== "undefined")
    //   value.profit = Number(value.profit.toFixed(2));
    // if (typeof value.exposure !== "undefined")
    //   value.exposure = Number(value.exposure.toFixed(2));

    // // if (value.betType === "premium") {
    // //   value.selection = `${value.selection}/${value.subSelection}`;
    // // }

    const tempObject = {
      _id: value.roundId,
      type: value.gameType,
      name: value.platform,
      betType: value.gameName,
      selection: "",
      betSide: "back",
      betId: value.roundId,
      createdAt: value.createdAt,
      stake: value.betAmount,
      oddsUp: value.stake,
      oddsDown: "",
      tType:
        value.gameStatus === "LOSE"
          ? "lost"
          : value.gameStatus === "WIN"
          ? "win"
          : value.gameStatus,
      betSide: "back",
      profit:
        value.gameStatus === "LOSE" ? value.betAmount : value.winLostAmount,
      exposure:
        value.gameStatus === "LOSE" ? value.betAmount : value.winLostAmount,
    };

    return tempObject;
  });

  return updateBetHistory;
};
module.exports = {
  betsHistoryDataFiter,
  casinoMatchHistoryFilter,
};
