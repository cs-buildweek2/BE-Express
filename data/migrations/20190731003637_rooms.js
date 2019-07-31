exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("rooms", table => {
      table.increments();
      table
        .integer("room_id")
        .unsigned()
        .unique()
        .notNullable();
      table.string("title", 30).notNullable();
      table.string("description", 300).notNullable();
      table.string("coordinates", 30).notNullable();
    })
    .createTable("exits", table => {
      table.increments();
      table
        .integer("room_id")
        .unsigned()
        .references("rooms.room_id")
        .notNullable()
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("direction", 40).notNullable();
      table.integer("direction_id");
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists("exits")
    .dropTableIfExists("rooms")
    .dropTableIfExists("users");
};
