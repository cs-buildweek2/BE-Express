const axios = require("axios");
const Rooms = require("../data/helpers/rooms-model.js");
const Exits = require("../data/helpers/exits-model.js");

const roomRequest = async (token, direction) => {
  const URL = "https://lambda-treasure-hunt.herokuapp.com/api/adv/move/";
  const headers = {
    Authorization: `Token ${secret}`,
    "Content-Type": "application/json"
  };
  const request = { direction };
  const response = await axios.post(URL, request, headers);
  return response;
};

const initialization = async token => {
  const URL = "https://lambda-treasure-hunt.herokuapp.com/api/adv/init/";
  const headers = {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json"
  };
  const response = await axios.get(URL, headers);
  return response;
};

const traversal = async token => {
  const graph = {};
  const startingRoom = initialization(token);
  const newRoom = {
    room_id: startingRoom.room_id,
    title: startingRoom.title,
    description: startingRoom.description
  };
  graph[startingRoom] = {};
  await Rooms.create(newRoom);
  if (startingRoom.exits.length > 0) {
    for (exit of exits) {
      const newExit = {
        room_id: startingRoom.id,
        direction: exit
      };
      await Exits.create(newExit);
      graph[startingRoom][exit] = "?";
    }
  }
  const totalRooms = 500;
  const visited = new Set();
  const s = [];
  // will hold rooms here that have unexplored neighbors, for the purpose of backtracking
  visited.add(startingRoom.room_id);
  while (visited.size < totalRooms) {
    return;
    // Traverse until you hit a dead-end, then back-track to the nearest room with an unexplored path.
  }
};

module.exports = traversal;
