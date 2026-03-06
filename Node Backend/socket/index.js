const { init: socketOps } = require("../config/socket");

async function sendEventToClient(client, data) {
  try {
    const socketClient = socketOps();

    // console.log("SEND EVENT TO CLIENT: ", data);

    if (typeof client !== "string") client.emit("res", { data });
    else socketClient.to(client).emit("res", { data });
  } catch (error) {
    console.error("sendEventToClient :: error :: ", error);
  }
}

async function sendEventToRoom(roomId, data) {
  const socketClient = socketOps();
  console.log("SEND EVENT TO ROOM : ", data);
  socketClient.to(roomId).emit("res", { data });
}

function addClientInRoom(socket, roomId) {
  if (socket.id !== "ROBOT") return socket.join(roomId);
}

function getSocketFromSocketId(socketId) {
  const socketClient = socketOps();
  return socketClient.sockets.sockets.get(socketId);
}

function sendEventToGlobal(data) {
  const socketClient = socketOps();
  return socketClient.emit("res", { data });
}

const exportObject = {
  sendEventToClient,
  sendEventToRoom,
  addClientInRoom,
  getSocketFromSocketId,
  sendEventToGlobal,
};

module.exports = exportObject;
