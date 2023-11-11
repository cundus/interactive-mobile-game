const Player = require("../models/Player");
const Game = require("../models/Game");

const waitingPlayers = [];
const activeGames = {};

function handleConnection(socket) {
   const { playerId, username, avatar } = socket.handshake.query;
   console.log(username + " connected");

   const player = new Player(playerId, username, avatar, socket);

   socket.player = player;

   socket.on("joinQueue", () => {
      if (waitingPlayers.length < 4) {
         waitingPlayers.push(player);
         tryMatchPlayers();
      } else {
         socket.emit("queueFull");
      }
   });

   socket.on("disconnect", () => {
      console.log("User disconnected");
      removePlayerFromQueue(player);

      if (socket.room) {
         endGame(socket.room);
      }
   });

   socket.on("startGame", (roomName) => {
      startGame(roomName);
   });

   socket.on("submitAnswer", (data) => {
      submitAnswer(socket.room, player.id, data.answer);
   });
}

function tryMatchPlayers() {
   if (waitingPlayers.length >= 4) {
      const players = waitingPlayers.splice(0, 4);

      const roomName = `room_${Math.random().toString(36).substring(7)}`;

      players.forEach((player) => {
         player.socket.join(roomName);
         player.socket.room = roomName;
      });

      const game = new Game(roomName, players, []);
      activeGames[roomName] = game;

      players.forEach((player) => {
         player.socket.emit("gameStarted", game);
      });

      game.sendQuestion();
   }
}

function removePlayerFromQueue(player) {
   const index = waitingPlayers.indexOf(player);
   if (index !== -1) {
      waitingPlayers.splice(index, 1);
   }
}

function startGame(roomName) {
   const game = activeGames[roomName];
   if (game) {
      game.sendQuestion();
   }
}

function submitAnswer(roomName, playerId, answer) {
   const game = activeGames[roomName];
   if (game) {
      game.submitAnswer(playerId, answer);
   }
}

function endGame(roomName) {
   const game = activeGames[roomName];
   if (game) {
      game.players.forEach((player) => {
         player.socket.emit("gameEnded", game.scores);
      });

      delete activeGames[roomName];
   }
}

module.exports = {
   handleConnection,
};
