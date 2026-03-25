const SocketIO = require("socket.io");
const { EVENTS } = require("../constants");
const requestHandler = require("../requestHandler");

let socketClient = null;

function socketConnnectionHandle(client) {
  console.log("connected socket");

  // client.conn is default menthod for ping pong request
  client.conn.on("ping", (packet) => {
    client.emit("pong", packet);
  });

  /**
   * error event handler
   */
  client.on("error", (error) =>
    console.error("Socket : client error......,", error)
  );

  /**
   * disconnect request handler
   */
  client.on("disconnect", () => {
    console.log("DISCONNECT user : ", client.id);
    requestHandler(client, { en: EVENTS.DISCONNECT, data: {} });
  });

  /**
   * get Event request handler
   */
  client.on("req", (socket) => {
    requestHandler(client, socket);
  });
}

function createSocketServer(server) {
  const socketConfig = {
    transports: ["websocket", "polling"],
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    pingInterval: 1000,
    pingTimeout: 10000,
    allowEIO3: true,
  };
  console.log("call connection file <===");
  socketClient = SocketIO(server, socketConfig);
  // .of("/socketServer");

  socketClient.on("connection", socketConnnectionHandle);

  return socketClient;
}

const init = (server) => socketClient || createSocketServer(server);

module.exports = { init };
