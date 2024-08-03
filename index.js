const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { send } = require("process");

app.use(cors());

const server = http.createServer(app);

const rooms = {};

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// sample change {userId:"chandu",content:"some x content change"}

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    if (Object.keys(rooms).indexOf(data.fileId) === -1) {
      rooms[data.fileId] = { activeMembers: [], changes: [] };
    } else {
      if (rooms[data.fileId].activeMembers.indexOf(data.userId) === -1) {
        rooms[data.fileId].activeMembers.push(data.userId);
      }
    }
    socket.join(data.fileId);
    socket
      .to(data.fileId)
      .emit("receive_message", { roomMessage: `${data.userId} - joined` });
  });

  socket.on("send_message", (data) => {
    const { fileId, ...rem } = { ...data };
    rooms[fileId].changes.push({ userId: data.userId, content: data.content });
    let sendData = {
      newContent: data.content,
      userId: data.userId,
    };
    socket.to(fileId).emit("receive_message", sendData);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
