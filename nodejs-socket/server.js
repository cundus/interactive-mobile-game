require("dotenv").config();
const PORT = process.env.PORT || 3001;
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const RoomManager = require("./models/Room");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get("/", (req, res) => {
   res.send({
      message: "Interactive Mobile Game",
   });
});

server.listen(PORT, () => {
   console.log("Server is running on port " + PORT);
});

const roomManager = new RoomManager(io);

io.on("connection", (socket) => {
   console.log(socket.room);

   socket.on("matchmaking", () => {
      roomManager.handleMatchmaking(socket);
   });

   socket.on("startGame", (room) => {
      const roomId = room; // Assumes the room ID is in the second position in the rooms array
      console.log(roomId);
      roomManager.startGameIfFull(roomId);
   });

   socket.on("answer", ({ roomId, answer }) => {
      const playerId = socket.id;
      roomManager.handleAnswer(roomId, playerId, answer);
   });

   socket.on("disconnect", () => {
      const playerId = socket.id;
      const player = roomManager.getPlayerInfo(playerId);

      if (player) {
         const { roomId } = player;
         roomManager.removePlayerFromRoom(playerId);

         io.to(roomId).emit("playerLeft", playerId);
      }
   });
});
