// models/Game.js
class Game {
   constructor(roomName, questions) {
      this.roomName = roomName;
      this.players = [];
      this.questions = questions;
      this.currentQuestionIndex = 0;
      this.scores = {};
   }

   addPlayer(player) {
      if (this.players.length < 4) {
         this.players.push(player);
         player.socket.join(this.roomName);
         player.socket.room = this.roomName;
      } else {
         // Notify the player that the game is full
         player.socket.emit("gameFull");
      }
   }

   sendQuestion() {
      const question = this.questions[this.currentQuestionIndex];
      this.players.forEach((player) => {
         player.socket.emit("newQuestion", question);
      });
   }

   submitAnswer(playerId, answer) {
      const correctAnswer = this.questions[this.currentQuestionIndex].correctAnswer;
      const isCorrect = answer === correctAnswer;

      if (!this.scores[playerId]) {
         this.scores[playerId] = 0;
      }

      if (isCorrect) {
         this.scores[playerId] += 1;
      }

      this.players.forEach((player) => {
         player.socket.emit("answerResult", {
            playerId: playerId,
            isCorrect: isCorrect,
            scores: this.scores,
         });
      });

      this.currentQuestionIndex += 1;
      this.sendQuestion();
   }
}

module.exports = Game;
