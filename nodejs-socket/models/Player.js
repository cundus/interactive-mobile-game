class Player {
   constructor(id, username, avatar, status, room) {
      this.id = id;
      this.username = username;
      this.avatar = avatar;
      this.status = status;
      this.room = room;
      this.score = 0;
   }
}

module.exports = Player;
