const data = {
  key: "",
  message: {
    txns: [
      {
        gameType: "TABLE",
        gameName: "7 Up 7 Down",
        gameCode: "KM-TABLE-028",
        userId: "supercasiraua",
        platform: "KINGMAKER",
        platformTxId: "6529def2be7984003a2371c7",
        refPlatformTxId: null,
        settleType: "platformTxId",
        updateTime: "2023-10-14T08:21:15.469+08:00",
        roundId: "sud-Q6lFgU7D",
        betType: null,
        betTime: "2023-10-14T08:21:02.802+08:00",
        txTime: "2023-10-14T08:21:02.802+08:00",
        turnover: 12,
        betAmount: 12,
        winAmount: 0,
        gameInfo: {
          extension1: "tw5",
          betType: "sud-up : 12.0",
          reason: "payout",
          agentId: "tw5",
          link: "https://supports2.bo.p7.ns86.kingdomhall729.com/plays/sud-Q6lFgU7D/by_reference_number?transId=6529def2be7984003a2371c7",
          commission: "0.0",
          profit: "-12.0",
        },
      },
      {
        gameType: "TABLE",
        gameName: "7 Up 7 Down",
        gameCode: "KM-TABLE-028",
        userId: "supercasiraua",
        platform: "KINGMAKER",
        platformTxId: "6529def5be7984004643be56",
        refPlatformTxId: null,
        settleType: "platformTxId",
        updateTime: "2023-10-14T08:21:15.471+08:00",
        roundId: "sud-Q6lFgU7D",
        betType: null,
        betTime: "2023-10-14T08:21:02.802+08:00",
        txTime: "2023-10-14T08:21:02.802+08:00",
        turnover: 15,
        betAmount: 15,
        winAmount: 15,
        gameInfo: {
          extension1: "tw5",
          betType: "sud-up : 12.0, sud-seven : 3.0",
          reason: "payout",
          agentId: "tw5",
          link: "https://supports2.bo.p7.ns86.kingdomhall729.com/plays/sud-Q6lFgU7D/by_reference_number?transId=6529def5be7984004643be56",
          commission: "0.0",
          profit: "0.0",
        },
      },
      {
        gameType: "TABLE",
        gameName: "7 Up 7 Down",
        gameCode: "KM-TABLE-028",
        userId: "supercasiraua",
        platform: "KINGMAKER",
        platformTxId: "6529def7be7984004643be63",
        refPlatformTxId: null,
        settleType: "platformTxId",
        updateTime: "2023-10-14T08:21:15.471+08:00",
        roundId: "sud-Q6lFgU7D",
        betType: null,
        betTime: "2023-10-14T08:21:02.802+08:00",
        txTime: "2023-10-14T08:21:02.802+08:00",
        turnover: 6,
        betAmount: 6,
        winAmount: 0,
        gameInfo: {
          extension1: "tw5",
          betType: "sud-up : 6.0",
          reason: "payout",
          agentId: "tw5",
          link: "https://supports2.bo.p7.ns86.kingdomhall729.com/plays/sud-Q6lFgU7D/by_reference_number?transId=6529def7be7984004643be63",
          commission: "0.0",
          profit: "-6.0",
        },
      },
      {
        gameType: "TABLE",
        gameName: "7 Up 7 Down",
        gameCode: "KM-TABLE-028",
        userId: "skyecasirashidul978",
        platform: "KINGMAKER",
        platformTxId: "6529def1c9c1ec0051b96dda",
        refPlatformTxId: null,
        settleType: "platformTxId",
        updateTime: "2023-10-14T08:21:15.469+08:00",
        roundId: "sud-QVvx9dpf",
        betType: null,
        betTime: "2023-10-14T08:21:05.744+08:00",
        txTime: "2023-10-14T08:21:05.744+08:00",
        turnover: 1,
        betAmount: 1,
        winAmount: 0,
        gameInfo: {
          extension1: "tw5",
          betType: "sud-up : 1.0",
          reason: "payout",
          agentId: "tw5",
          link: "https://supports2.bo.p7.ns86.kingdomhall729.com/plays/sud-QVvx9dpf/by_reference_number?transId=6529def1c9c1ec0051b96dda",
          commission: "0.0",
          profit: "-1.0",
        },
      },
      {
        gameType: "TABLE",
        gameName: "7 Up 7 Down",
        gameCode: "KM-TABLE-028",
        userId: "supercasiraua",
        platform: "KINGMAKER",
        platformTxId: "6529deee07028100463cec7b",
        refPlatformTxId: null,
        settleType: "platformTxId",
        updateTime: "2023-10-14T08:21:15.466+08:00",
        roundId: "sud-Q6lFgU7D",
        betType: null,
        betTime: "2023-10-14T08:21:02.802+08:00",
        txTime: "2023-10-14T08:21:02.802+08:00",
        turnover: 3,
        betAmount: 3,
        winAmount: 15,
        gameInfo: {
          extension1: "tw5",
          betType: "sud-seven : 3.0",
          reason: "payout",
          agentId: "tw5",
          link: "https://supports2.bo.p7.ns86.kingdomhall729.com/plays/sud-Q6lFgU7D/by_reference_number?transId=6529deee07028100463cec7b",
          commission: "0.0",
          profit: "12.0",
        },
      },
    ],
    action: "settle",
  },
};

const { txns } = data.message;
let copyTxns = [...txns];

while (copyTxns.length !== 0) {
  const newTxns = [];
  let prifix = "";
  copyTxns.forEach((value, index) => {
    const tempPrifix = value.userId.split("casi")[0];
    if (prifix === "" || prifix === tempPrifix) {
      prifix = tempPrifix;
      newTxns.push(value);
      copyTxns.splice(index, 1);
    }
    // else if (prifix === tempPrifix){
    // }
  });
  console.log("newTxns ::: ", newTxns);
  console.log("copyTxns ::: ", copyTxns);
}

const dd = {
  extension1: "",
  message:
    '{"action":"bet","txns":[{"gameType":"TABLE","gameName":"Colour Game","gameCode":"KM-TABLE-050","userId":"supercasijahangir","platform":"KINGMAKER","platformTxId":"6531125f8eccf40050375304","roundId":"cg-NMNPtnPJ","betType":null,"currency":"MYR","betTime":"2023-10-19T19:26:23.737+08:00","betAmount":2,"gameInfo":{"extension1":"tw5","betType":"cg-pink-blue : 1.0, cg-white-green : 1.0"}}]}',
  key: "mPcM2OrbuZXEMDGX45U",
};

const dd1 = {
  extension1: "",
  message:
    '{"action":"bet","txns":[{"gameType":"TABLE","gameName":"Colour Game","gameCode":"KM-TABLE-050","userId":"supercasijahangir","platform":"KINGMAKER","platformTxId":"653112618eccf4004eaf8339","roundId":"cg-NMNPtnPJ","betType":null,"currency":"MYR","betTime":"2023-10-19T19:26:23.737+08:00","betAmount":1,"gameInfo":{"extension1":"tw5","betType":"cg-pink-green : 1.0"}}]}',
  key: "mPcM2OrbuZXEMDGX45U",
};

// 2023-10-19T19:26:23.737+08:00

// settle // 2023-10-19T11:27:54.055Z
