const mongo = require("../../config/mongodb");
const { getMarketsResult } = require("../../config/sportsAPI");
const { settleMatch } = require("../../services/settlementService");

async function autoSettlement() {
  try {
    // 1. Find all matches with pending bets
    const pendingBets = await mongo.bettingApp.model(mongo.models.betsHistory).aggregate({
      pipeline: [
        { $match: { betStatus: "pending", betType: { $in: ["odds", "bookMark"] } } },
        { $group: { _id: "$matchId" } },
        {
          $lookup: {
            from: "sports",
            localField: "_id",
            foreignField: "_id",
            as: "matchDetails"
          }
        },
        { $unwind: "$matchDetails" },
        {
          $project: {
            matchId: "$_id",
            marketId: "$matchDetails.marketId",
            winnerSelection: "$matchDetails.winnerSelection"
          }
        }
      ]
    });

    if (pendingBets.length === 0) return;

    // 2. Extract marketIds and filter out test/invalid IDs
    const marketIds = pendingBets
        .map(b => b.marketId)
        .filter(id => id && id.startsWith("1."))
        .join(",");
    
    if (!marketIds) {
        // console.log("[AutoSettlement] No valid marketIds to fetch.");
        return;
    }

    console.log(`[AutoSettlement] Fetching results for marketIds: ${marketIds}`);
    const results = await getMarketsResult(marketIds);

    if (!results || !Array.isArray(results)) return;

    // 3. Process each result
    for (const result of results) {
      const match = pendingBets.find(b => b.marketId === result.marketId);
      if (!match) continue;

      if (result.status === "CLOSED" || result.status === "SETTLED") {
        // Find all pending bets for this match
        const bets = await mongo.bettingApp.model(mongo.models.betsHistory).find({
          query: {
            matchId: mongo.ObjectId(match.matchId),
            betStatus: "pending",
            betType: { $in: ["odds", "bookMark"] }
          }
        });

        if (!bets || bets.length === 0) continue;

        for (const bet of bets) {
          // 1. Check for REMOVED status (Refund Logic)
          const runner = result.runners.find(r => 
            (bet.selectionId && r.selectionId === bet.selectionId) || 
            (r.runnerName === bet.selection)
          );

          if (runner && (runner.state?.status === "REMOVED" || runner.state?.result === "REMOVED")) {
                console.log(`[AutoSettlement] Cancelling bet ${bet._id} for REMOVED runner ${bet.selection}`);
                // Use a specialized settleSelection to cancel only this bet
                await mongo.bettingApp.model(mongo.models.betsHistory).updateOne({
                    query: { _id: bet._id },
                    update: { $set: { tType: "cancel", betStatus: "completed", winner: "cancel", settlementType: "auto", settledBy: "SYSTEM", settledAt: new Date() } }
                });
                // Note: Actual refund (distributAmount) needs to be called here or handled in a bulk way.
                // Assuming settleMatch handles the heavy lifting, we might need a granular service function.
                await settleMatch(match.matchId, "cancel", "auto", "SYSTEM"); // Temporary: cancel whole match if runner is removed
                break; // Exit bet loop for this match if we cancel the whole match
          }

          // 2. Strict selectionId Matching for WINNER/LOSER
          if (bet.selectionId) {
            const runner = result.runners.find(r => r.selectionId === bet.selectionId);
            if (runner && runner.state) {
                if (runner.state.result === "WINNER" || runner.state.isResult === "WINNER") {
                    console.log(`[AutoSettlement] Bet ${bet._id} won! Processing winner settlement...`);
                    await settleMatch(match.matchId, bet.selection, "auto", "SYSTEM");
                    break; // SettleMatch handles all bets for this match
                }
                // If it's a LOSER, we wait for the WINNER to be found for the match level settlement
            }
          }
          // Legacy/Mismatched bets remain PENDING as requested
        }
      }
    }
  } catch (error) {
    console.error("autoSettlementJob : error : ", error);
  }
}

module.exports = {
  autoSettlement,
};
