const axios = require("axios");
const Rooms = require("../data/helpers/rooms-model.js");
const Exits = require("../data/helpers/exits-model.js");

const roomRequest = async (token, direction) => {
  const URL = "https://lambda-treasure-hunt.herokuapp.com/api/adv/move/";
  const headers = {
    Authorization: `Token ${token}`,
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
  graph[startingRoom.room_id] = {};
  // await Rooms.create(newRoom);
  if (startingRoom.exits.length > 0) {
    for (let exit of startingRoom.exits) {
      graph[startingRoom.room_id][exit] = "?";
    }
  }
  const totalRooms = 500;
  const visited = new Set();
  const s = [];
  // will hold rooms here that have unexplored neighbors, for the purpose of backtracking
  let startingTime = new Date().getTime() / 1000;
  let cooldown = startingRoom.cooldown;
  visited.add(startingRoom.room_id);
  s.push(startingRoom.room_id);
  let currentRoom = startingRoom.room_id;
  let backtracking = false;
  while (visited.size < totalRooms) {
    let currentTime = new Date().getTime() / 1000;
    if (currentTime - startingTime >= cooldown) {
      if (!backtracking) {
        let explored = true;
        for (let direction in graph[currentRoom]) {
          if (graph[currentRoom][direction] === "?") {
            explored = false;
            const movedToRoom = roomRequest(token, direction);
            const newRoomID = movedToRoom.room_id;
            // Reset cooldown and starting time after making a move
            cooldown = movedToRoom.cooldown;
            startingTime = new Date().getTime() / 1000;
            graph[newRoomID] = {};
            visited.add(newRoomID);
            if (movedToRoom.exits.length > 0) {
              for (let exit of movedToRoom.exits) {
                graph[newRoomID][exit] = "?";
                s.push(newRoomID);
              }
            } else {
              backtracking = true;
            }
            currentRoom = newRoomID;
            break;
          }
        }

        if (explored) {
          backtracking = true;
        }
      } else {
        // Backtracking goes here
      }
    }
  }
};

module.exports = traversal;

// Commenting out the version which adds new entries as it goes
// const traversal = async token => {
//   const graph = {};
//   const startingRoom = initialization(token);
//   // const newRoom = {
//   //   room_id: startingRoom.room_id,
//   //   title: startingRoom.title,
//   //   description: startingRoom.description
//   // };
//   graph[startingRoom.room_id] = {};
//   // await Rooms.create(newRoom);
//   if (startingRoom.exits.length > 0) {
//     for (let exit of startingRoom.exits) {
//       // const newExit = {
//       //   room_id: startingRoom.room_id,
//       //   direction: exit
//       // };
//       // await Exits.create(newExit);
//       graph[startingRoom.room_id][exit] = "?";
//     }
//   }
//   const totalRooms = 500;
//   const visited = new Set();
//   const s = [];
//   // will hold rooms here that have unexplored neighbors, for the purpose of backtracking
//   let startingTime = new Date().getTime() / 1000;
//   let cooldown = startingRoom.cooldown;
//   visited.add(startingRoom.room_id);
//   s.push(startingRoom.room_id);
//   let currentRoom = startingRoom.room_id;
//   let backtracking = false;
//   while (visited.size < totalRooms) {
//     let currentTime = new Date().getTime() / 1000;
//     if (currentTime - startingTime >= cooldown) {
//       let explored = true;
//       for (let direction in graph[currentRoom]) {
//         if (graph[currentRoom][direction] === "?") {
//           explored = false;
//           const movedToRoom = roomRequest(token, direction);
//           const newRoomID = movedToRoom.room_id;
//           // Reset cooldown and starting time after making a move
//           cooldown = movedToRoom.cooldown;
//           startingTime = new Date().getTime() / 1000;
//           // const createMovedToRoom = {
//           //   room_id: movedToRoom.room_id,
//           //   title: movedToRoom.title,
//           //   description: movedToRoom.description
//           // };
//           // await Rooms.create(createMovedToRoom);
//           graph[newRoomID] = {};
//           visited.add(newRoomID);
//           // const previousExit = await Exits.findByRoom(currentRoom, direction);
//           // const newPreviousExit = {
//           //   direction_id: newRoomID
//           // };
//           // await Exits.update(newPreviousExit, previousExit.id);
//           if (movedToRoom.exits.length > 0) {
//             for (let exit of movedToRoom.exits) {
//               // const newExit = {
//               //   room_id: newRoomID,
//               //   direction: exit
//               // };
//               // await Exits.create(newExit);
//               // It will probably look cleaner to make all the database entries for the graph at once, once it is completely built
//               graph[newRoomID][exit] = "?";
//               s.push(newRoomID);
//             }
//           } else {
//             backtracking = true;
//           }
//           break;
//         }
//       }

//       if (explored) {
//         backtracking = true;
//       }
//     }
//   }
// };

// module.exports = traversal;
