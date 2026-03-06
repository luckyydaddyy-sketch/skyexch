const filterBetInfo = (betInfo) => {
  const bet = {
    userId: betInfo.userObjectId,
    userName: betInfo.userId,
    roundId: betInfo.roundId,
    platformTxId: betInfo.platformTxId,
    gameStatus: betInfo.gameStatus,
    gameType: betInfo.gameType,
    gameCode: betInfo.gameCode,
    platform: betInfo.platform,
    gameName: betInfo.gameName,
    selection: betInfo.betType,
    betPlaced: betInfo.betAmount,
    refPlatformTxId: betInfo.refPlatformTxId,
  };
};
