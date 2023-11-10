class Player {
   constructor(id, username, socket) {
      this.id = id;
      this.username = username;
      this.socket = socket;
      this.idleTimer = 0;
   }
}

module.exports = Player;
