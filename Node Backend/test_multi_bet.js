const placeBet = require("/Users/sherkhan/Documents/Arjun malik/sky ui/Node Backend/controllers/casinoApi/placeBet.js");

const req = {
    body: {
        key: "A0FW0DisGEzosHU58SU",
        message: JSON.stringify({
            action: "bet",
            txns: [
                {
                    gameType: "LIVE", gameCode: "MX-LIVE-001", platform: "SEXYBCRT",
                    gameName: "BaccaratClassic", userId: "testpl9", betAmount: 2300, platformTxId: "MULTI-BET-1-" + Date.now(), currency: "INR"
                },
                {
                    gameType: "LIVE", gameCode: "MX-LIVE-001", platform: "SEXYBCRT",
                    gameName: "BaccaratClassic", userId: "testpl9", betAmount: 2300, platformTxId: "MULTI-BET-2-" + Date.now(), currency: "INR"
                }
            ]
        })
    }
};

const res = {
    send: (data) => console.log("RES:", data),
    status: (code) => { console.log("STATUS:", code); return res; }
};

setTimeout(async () => {
    try {
        await placeBet.handler(req, res);
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}, 2000);
