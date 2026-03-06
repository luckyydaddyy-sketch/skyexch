const { sendUpdateBalanceEvent } = require("../../utils/comman/updateBalance");

function getUpdateBalanceHelper(data, socket) {
  console.log("==getUpdateBalanceHelper=> call <===");
  if (!socket.userId) return false;
  return sendUpdateBalanceEvent(data.userId, socket).catch((e) =>
    console.error(e)
  );
}

module.exports = getUpdateBalanceHelper;
