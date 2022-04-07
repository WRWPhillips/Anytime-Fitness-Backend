const db = require("../../data/db-config");

const findAll = () => {
  return db("classes as c").join(
    "users as u",
    "c.instructor_id",
    "=",
    "u.user_id"
  ).select(
    "c.class_id",
      "c.name",
      "c.type",
      "c.start_time",
      "c.duration",
      "c.intensity_level",
      "c.location",
      "c.max_class_size",
      "u.user_id as instructor_id",
      "u.username as instructor"
  );
};

function registerForClass(registration) {
  return db("class_clients").insert(registration);
}

function findBy(filter) {
  return db("classes as c")
    .join("users as u", "c.instructor_id", "=", "u.user_id")
    .select(
      "c.class_id",
      "c.name",
      "c.type",
      "c.start_time",
      "c.duration",
      "c.intensity_level",
      "c.location",
      "c.max_class_size",
      "u.user_id as user"
    )
    .where(filter);
}

async function deleteById(class_id) {
  const result = await findById(class_id);
  await db("classes").where("class_id", class_id).del();
  return result;
}

function findById(class_id) {
  return db("classes as c")
    .join("users as u", "c.instructor_id", "=", "u.user_id")
    .join("class_clients", "c.class_id", "=", "class_clients.class_id")
    .count("class_clients.user_id", {as: 'registered_attendees'})
    .select(
      "c.class_id",
      "c.name",
      "c.type",
      "c.start_time",
      "c.duration",
      "c.intensity_level",
      "c.location",
      "c.max_class_size"
    )
    .where("c.class_id", class_id)
    .first()
}

function getAttendeesById(class_id) {
  return db('class_clients as cc')
    .join('users as u', 'cc.user_id', '=', 'u.user_id')
    .select("u.username")
    .where("cc.class_id", class_id)
}

async function add({
  name,
  type,
  start_time,
  duration,
  intensity_level,
  location,
  registered_attendees,
  max_class_size,
  instructor_id
}) {
  let created_class_id;
  await db.transaction(async (trx) => {
    const [class_id] = await trx("classes").insert({
      name,
      type,
      start_time,
      duration,
      intensity_level,
      location,
      registered_attendees,
      max_class_size,
      instructor_id
    });
    created_class_id = class_id;
  });
  let createdClass = await findById(created_class_id);
  createdClass.class_id = created_class_id;
  return createdClass;
}

async function update(class_id, changes) {
  await db("classes").update(changes).where("class_id", class_id);
  return findById(class_id);
}

module.exports = {
  add,
  findBy,
  findById,
  findAll,
  deleteById,
  update,
  getAttendeesById,
  registerForClass
};
