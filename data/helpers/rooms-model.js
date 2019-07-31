const db = require("../dbConfig.js");

module.exports = {
  find,
  findById,
  create,
  remove,
  update
};

async function find(id) {
  return db("rooms");
}

async function findById(id) {
  const room = await db("rooms")
    .where({ "rooms.id": id })
    .first();
  return room;
}

async function create(item) {
  const [id] = await db("rooms")
    .insert(item)
    .returning("id");
  if (id) {
    const room = await findById(id);
    return room;
  }
}

async function remove(id) {
  const room = await findById(id);
  if (room) {
    const deleted = await db("rooms")
      .where({ id })
      .del();
    if (deleted) {
      return room;
    }
  }
}

async function update(item, id) {
  const editedRoom = await db("rooms")
    .where({ id })
    .update(item);
  if (editedRoom) {
    const room = await findById(id);
    return room;
  }
}
