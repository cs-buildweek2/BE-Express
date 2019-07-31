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

server.post("/traverse", (req, res) => {
  res.send("Traversal will go here");
});

module.exports = server;
