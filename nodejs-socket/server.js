require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const PORT = process.env.PORT || 3001;
const socketController = require("./src/controllers/socketController");

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

const waitingPlayers = [];
const activeGames = {};

io.on("connection", socketController.handleConnection);
