require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get("/", (req, res) => {
   res.send({
      message: "Interactive Mobile Game",
   });
});

io.on("connection", (socket) => {
   console.log(socket);
   console.log("A user connected");
   socket.on("disconnect", () => {
      console.log("User disconnected");
   });
});

server.listen(PORT, () => {
   console.log("Server is running on port " + PORT);
});
