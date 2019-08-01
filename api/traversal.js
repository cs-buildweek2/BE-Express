const axios = require("axios");
const Rooms = require("../data/helpers/rooms-model.js");
const Exits = require("../data/helpers/exits-model.js");

class Queue {
  constructor() {
    this.storage = [];
  }
  enqueue(value) {
    this.storage.push(value);
  }
  dequeue() {
    return this.storage.pop();
  }
  size() {
    return this.storage.length;
  }
}

const inner_bfs = (graph, starting_vertex, destination) => {
  const q = Queue();
  q.enqueue([starting_vertex]);
  while (q.size() > 0) {
    const path = q.dequeue();
    const node = path[path.length - 1];
    for (let direction in graph[node]) {
      let room = graph[node][direction];
      if (room === destination) {
        path.push(room);
        return path;
      } else {
        const new_path = path.concat();
        new_path.push(room);
        q.enqueue(new_path);
      }
    }
  }
};

const graphToDatabase = async graph => {
  for (let room in graph) {
    for (let direction in graph[room]) {
      let direction_id = graph[room][direction];
      const newExit = {
        direction_id,
        direction,
        room_id: room
      };
      await Exits.create(newExit);
    }
  }
};

const checkDirections = (graph, currentRoom, nextRoom) => {
  const opposites = {
    n: "s",
    s: "n",
    w: "e",
    e: "w"
  };
  for (let exit in graph[currentRoom]) {
    if (graph[currentRoom][exit] === nextRoom) {
      const opposite = opposites[exit];
      if (opposite in graph[nextRoom]) {
        graph[nextRoom][opposite] = currentRoom;
        return true;
      } else {
        return false;
      }
    }
  }
};

const roomRequest = async (token, direction) => {
  const URL = "https://lambda-treasure-hunt.herokuapp.com/api/adv/move/";
  const headers = {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json"
    }
  };
  try {
    const request = { direction };
    const response = await axios.post(URL, request, headers);
    return response.data;
  } catch (error) {
    console.error(error, "<---roomRequest error");
  }
};

const shorterRoomRequest = async (token, direction, nextRoom) => {
  const URL = "https://lambda-treasure-hunt.herokuapp.com/api/adv/move/";
  const headers = {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json"
    }
  };
  try {
    const request = { direction, next_room_id: nextRoom.toString() };
    const response = await axios.post(URL, request, headers);
    return response.data;
  } catch (error) {
    console.error(error, "<---shorter Room error");
  }
};

const initialization = async token => {
  const URL = "https://lambda-treasure-hunt.herokuapp.com/api/adv/init/";
  const headers = {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json"
    }
  };
  try {
    const response = await axios.get(URL, headers);
    return response.data;
  } catch (error) {
    console.error(error, "<---initialize error");
  }
};

const traversal = async token => {
  const graph = {};
  const startingRoom = await initialization(token);
  graph[startingRoom.room_id] = {};
  const newRoom = {
    room_id: startingRoom.room_id,
    title: startingRoom.title,
    description: startingRoom.description,
    coordinates: startingRoom.coordinates
  };
  await Rooms.create(newRoom);
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
      console.log(graph);
      if (!backtracking) {
        let explored = true;
        for (let direction in graph[currentRoom]) {
          if (graph[currentRoom][direction] === "?") {
            explored = false;
            const movedToRoom = roomRequest(token, direction);
            const newRoomID = movedToRoom.room_id;
            graph[currentRoom][direction] = newRoomID;
            // Reset cooldown and starting time after making a move
            cooldown = movedToRoom.cooldown;
            startingTime = new Date().getTime() / 1000;
            if (!newRoomID in visited) {
              // Only create the entry if this is the first time coming here
              const createMovedToRoom = {
                room_id: movedToRoom.room_id,
                title: movedToRoom.title,
                description: movedToRoom.description,
                coordinates: movedToRoom.coordinates
              };
              await Rooms.create(createMovedToRoom);
              graph[newRoomID] = {};
              visited.add(newRoomID);
              s.push(newRoomID);
              for (let exit of movedToRoom.exits) {
                graph[newRoomID][exit] = "?";
              }
              checkDirections(graph, currentRoom, newRoomID);
              // Check if you can travel to the room you just came from. If you can, set that direction in the graph
            } else {
              // This has been visited already. Check for unexplored rooms. If none exist, start backtracking
              let allNeighborsVisited = true;
              for (let exit in graph[newRoomID]) {
                if (graph[newRoomID][exit] === "?") {
                  allNeighborsVisited = false;
                }
              }
              if (allNeighborsVisited) {
                backtracking = true;
              } else {
                s.push(newRoomID);
              }
            }
            currentRoom = newRoomID;
            break;
          }
        }

        if (explored) {
          backtracking = true;
        }
      } else {
        // Don't pop until we traverse there
        const lastUnExploredRoom = s[s.length - 1];
        if (currentRoom === lastUnExploredRoom) {
          backtracking = false;
        } else {
          // Else take a step towards the lastRoom. Check graph for available paths
          const path = inner_bfs(graph, currentRoom, lastUnExploredRoom);
          const convertedPath = [];
          let counter = convertedPath.length;
          let increment = 0;
          for (let i = 1; i < path.length; i++) {
            let previousRoom = path[i - 1];
            let room = path[i];
            for (let direction in graph[previousRoom]) {
              if (graph[previousRoom][direction] === room) {
                convertedPath.push(direction);
              }
            }
          }
          // Backtrack path is complete, traverse it
          while (counter > 0) {
            currentTime = new Date().getTime() / 1000;
            if (currentTime - startingTime >= cooldown) {
              // traverse, use the room_to method for shorter cooldown
              let nextRoom = await shorterRoomRequest(
                token,
                convertedPath[increment],
                path[increment + 1]
              );
              currentRoom = nextRoom.room_id;
              cooldown = nextRoom.cooldown;
              startingTime = new Date().getTime() / 1000;
              increment += 1;
              counter -= 1;
            }
          }
          backtracking = false;
        }
      }
    }
  }
  // All rooms visited, save the result to database
  graphToDatabase(graph);
};

module.exports = traversal;
