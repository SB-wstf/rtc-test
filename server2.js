const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", ({ roomId, email, role }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.role = role;

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push({ id: socket.id, email, role });

    io.to(roomId).emit("userJoined", { socketId: socket.id, role });
    console.log(`${email} joined room ${roomId} as ${role}`);
  });

  socket.on("signal", (data) => {
    const { to, ...signalData } = data;
    if (to) {
      io.to(to).emit("signal", { ...signalData, socketId: socket.id });
    }
  });

  socket.on("chatMessage", ({ roomId, message }) => {
    io.to(roomId).emit("chatMessage", { message });
  });

  socket.on("disconnect", () => {
    const { roomId } = socket;
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
