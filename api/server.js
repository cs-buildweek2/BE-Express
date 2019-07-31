const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());

server.get("/", (req, res) => {
  res.send("Api is up and running");
});

// Replace this later once the graph is already generated, and have it traverse the already-complete map for treasure using a player token
// server.post("/traverse", (req, res) => {
//   const { token } = req.body.token;
//   if (!token) {
//     res.status(401).json({ message: "Bad request. No token sent." });
//   } else {
//     res.status(200).json({ message: "Traversal running." });
//   }
// });

module.exports = server;
