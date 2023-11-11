class Player {
   constructor(id, username, avatar, socket) {
      this.id = id;
      this.username = username;
      this.avatar = avatar;
      this.socket = socket;
   }
}

module.exports = Player;
