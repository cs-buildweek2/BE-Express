require("dotenv").config();
const server = require("./api/server.js");
const traversal = require("./api/traversal");

const port = process.env.PORT || 4000;

server.listen(port, function() {
  console.log(`*** Server listening on port ${port}. ***`);
});
const token = process.env.SECRET;
traversal(token);
