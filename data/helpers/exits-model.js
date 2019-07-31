const db = require("../dbConfig.js");

module.exports = {
  find,
  findById,
  create,
  remove,
  update
};

async function find(id) {
  return db("exits");
}

async function findById(id) {
  const exit = await db("exits")
    .where({ "exits.id": id })
    .first();
  return exit;
}

async function create(item) {
  const [id] = await db("exits")
    .insert(item)
    .returning("id");
  if (id) {
    const exit = await findById(id);
    return exit;
  }
}

async function remove(id) {
  const exit = await findById(id);
  if (exit) {
    const deleted = await db("exits")
      .where({ id })
      .del();
    if (deleted) {
      return exit;
    }
  }
}

async function update(item, id) {
  const editedExit = await db("exits")
    .where({ id })
    .update(item);
  if (editedExit) {
    const exit = await findById(id);
    return exit;
  }
}
