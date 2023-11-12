const Player = require("./Player");
const roomStatus = require("../constant");

class RoomManager {
   constructor(io) {
      this.rooms = {};
      this.players = {};
      this.io = io;
      this.questions = [];
      this.currentQuestionIndex = 0;
      this.answerTimeout = null;
   }

   createRoom = (roomId) => {
      if (!this.rooms[roomId]) {
         this.rooms[roomId] = {
            id: roomId,
            players: [],
            status: roomStatus.WAITING,
            currentQuestion: null,
         };
      }
   };

   addPlayerToRoom(roomId, player) {
      if (this.rooms[roomId]) {
         this.rooms[roomId].players.push(player);
      }
   }

   removePlayerFromRoom(playerId) {
      const player = this.players[playerId];

      if (player) {
         const { roomId } = player;

         if (this.rooms[roomId]) {
            this.rooms[roomId].players = this.rooms[roomId].players.filter((p) => p.id !== playerId);
            if (this.rooms[roomId].players.length === 0) {
               // If the room is empty, you might want to clean it up
               delete this.rooms[roomId];
            }
         }

         delete this.players[playerId];
      }
   }

   getRoomInfo(roomId) {
      return this.rooms[roomId];
   }

   getPlayerInfo(playerId) {
      return this.players[playerId];
   }

   getAllRoomIds() {
      return Object.keys(this.rooms);
   }

   getAllPlayerIds() {
      return Object.keys(this.players);
   }

   handleMatchmaking(socket) {
      const { username, avatar } = socket.handshake.query;
      const availableRoomId = Object.keys(this.rooms).find((roomId) => this.rooms[roomId].players.length < 4);
      console.log(username, "finding match!");

      if (availableRoomId) {
         const player = new Player(socket.id, username, avatar, "lobby", availableRoomId);
         this.players[socket.id] = player;

         this.addPlayerToRoom(availableRoomId, player);
         socket.join(availableRoomId);
         this.startGameIfFull(availableRoomId);
      } else {
         // If no available rooms, create a new one
         const newRoomId = `room_${Math.random().toString(36).substring(7)}`;
         this.createRoom(newRoomId);

         const player = new Player(socket.id, username, avatar, "lobby", newRoomId);
         this.players[socket.id] = player;

         this.addPlayerToRoom(newRoomId, player);
         socket.join(newRoomId);
      }
   }

   startGameIfFull(roomId) {
      const room = this.getRoomInfo(roomId);
      if (room && room.players.length === 4) {
         // Implement your own logic to start the game
         this.rooms[roomId].status = roomStatus.IN_PROGRESS;
         this.startNextQuestion(roomId);
      }
   }

   startNextQuestion(roomId) {
      const room = this.getRoomInfo(roomId);
      if (room) {
         // Check if there are more questions
         if (this.currentQuestionIndex < this.questions.length) {
            // Set the current question and reset scores
            room.currentQuestion = this.questions[this.currentQuestionIndex];
            this.resetPlayerScores(roomId);
            this.broadcastQuestion(roomId);

            // Start the countdown timer
            this.answerTimeout = setTimeout(() => {
               this.handleTimeUp(roomId);
            }, 10000); // 10 seconds countdown timer (adjust as needed)
         } else {
            // No more questions, end the game
            this.endGame(roomId);
         }
      }
   }

   broadcastQuestion(roomId) {
      const room = this.getRoomInfo(roomId);
      if (room) {
         io.to(roomId).emit("newQuestion", room.currentQuestion);
      }
   }

   resetPlayerScores(roomId) {
      const room = this.getRoomInfo(roomId);
      if (room) {
         room.players.forEach((player) => {
            player.score = 0;
         });
      }
   }

   handleTimeUp(roomId) {
      // Time's up, gather and broadcast answers
      const room = this.getRoomInfo(roomId);
      if (room) {
         const answers = room.players.map((player) => {
            return { playerId: player.id, answer: null }; // For simplicity, set all answers to null when time's up
         });

         // Broadcast answers to all players
         io.to(roomId).emit("answers", answers);

         // Move to the next question
         this.currentQuestionIndex++;
         this.startNextQuestion(roomId);
      }
   }

   handleAnswer(roomId, playerId, answer) {
      const room = this.getRoomInfo(roomId);
      if (room) {
         const player = room.players.find((p) => p.id === playerId);
         if (player) {
            // Update player's answer
            player.answer = answer;

            // Check if all players have answered
            const allAnswered = room.players.every((p) => p.answer !== null);

            if (allAnswered) {
               // Stop the countdown timer
               clearTimeout(this.answerTimeout);

               // Broadcast answers to all players
               io.to(roomId).emit(
                  "answers",
                  room.players.map((p) => ({ playerId: p.id, answer: p.answer }))
               );

               // Calculate scores and broadcast the updated scores
               this.calculateScores(roomId);
               io.to(roomId).emit(
                  "scores",
                  room.players.map((p) => ({ playerId: p.id, score: p.score }))
               );

               // Move to the next question
               this.currentQuestionIndex++;
               this.startNextQuestion(roomId);
            }
         }
      }
   }

   calculateScores(roomId) {
      const room = this.getRoomInfo(roomId);
      if (room) {
         room.players.forEach((player) => {
            if (player.answer === room.currentQuestion.correctAnswer) {
               player.score += 1;
            }
         });
      }
   }

   endGame(roomId) {
      // Implement logic for ending the game (e.g., displaying final scores)
      const room = this.getRoomInfo(roomId);
      if (room) {
         io.to(roomId).emit("gameEnded", room.players);
      }
   }
}

module.exports = RoomManager;
