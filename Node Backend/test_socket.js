const io = require("socket.io-client");

const socket = io("http://localhost:3001");

socket.on("connect", () => {
    console.log("Connected to local socket server!");
    console.log("Requesting live match counts...");
    socket.emit("GET_LIVE_MATCH_COUNT", {});
});

socket.on("GET_LIVE_MATCH_COUNT", (data) => {
    console.log("RECEIVED LIVE MATCH COUNT EVENT:");
    console.log(JSON.stringify(data, null, 2));
    process.exit();
});

socket.on("error", (err) => {
    console.error("Socket error:", err);
});

socket.on("connect_error", (err) => {
    console.error("Connect error:", err.message);
    process.exit();
});

setTimeout(() => {
    console.log("Timeout waiting for socket response.");
    process.exit();
}, 5000);
