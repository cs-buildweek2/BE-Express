require("dotenv").config();
const server = require("./api/server.js");
const traversal = require("./api/traversal");
const Rooms = require("./data/helpers/rooms-model");

const port = process.env.PORT || 4000;

server.listen(port, function() {
  console.log(`*** Server listening on port ${port}. ***`);
});
const token = process.env.SECRET;
const checkRooms = async () => {
  const rooms = await Rooms.find();
  if (rooms.length < 500) {
    traversal(token);
  }
};
checkRooms();
