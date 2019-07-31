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
  const review = await db("rooms")
    .where({ "rooms.id": id })
    .first();
  return review;
}

async function create(item) {
  const [id] = await db("rooms")
    .insert(item)
    .returning("id");
  if (id) {
    const review = await findById(id);
    return review;
  }
}

async function remove(id) {
  const review = await findById(id);
  if (review) {
    const deleted = await db("rooms")
      .where({ id })
      .del();
    if (deleted) {
      return review;
    }
  }
}

async function update(item, id) {
  const editedRoom = await db("rooms")
    .where({ id })
    .update(item);
  if (editedRoom) {
    const review = await findById(id);
    return review;
  }
}
