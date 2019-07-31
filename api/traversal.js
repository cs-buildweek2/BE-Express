const axios = require("axios");

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
    Authorization: `Token ${secret}`,
    "Content-Type": "application/json"
  };
  const response = await axios.get(URL, headers);
  return response;
};

const traversal = token => {
  const startingRoom = initialization(token);
};

module.exports = traversal;
