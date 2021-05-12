const mongoose = require("mongoose")
const { MongoClient } = require("mongodb")
var async = require("async")
const SuppressWarnings = require("suppress-warnings")

SuppressWarnings([
  (warning, name, ctor) => name.code.toString() === "MONGODB DRIVER",
])

mongoose.Promise = global.Promise

var mongoDB = "mongodb://localhost:27017/todo_cli"
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoose.set("bufferCommands", true)

var db = mongoose.connection

db.on("error", console.error.bind(console, "MongoDB Connection Error: "))

const Task = require("./models/tasks")

const addTask = (task) => {
  Task.create(task, function (err, result) {
    if (err) {
      console.log(err)
    }
    console.info("New Task Created")
    db.close()
  })
}

const findTask = (name) => {
  const search = new RegExp(name, "i")
  Task.find({ title: search }).exec((err, tasks) => {
    if (err) {
      console.log(err)
    }
    tasks.forEach((task) => {
      console.info(task.title)
    })
    console.info(`${tasks.length} matches`)
    db.close()
  })
}

const updateTask = (_id, task) => {
  Task.updateOne({ _id }, task).then((task) => {
    console.info("Task updated")
    db.close()
  })
}

const removeTask = (_id) => {
  Task.remove({ _id }).then((Task) => {
    console.info("Task removed")
    db.close()
  })
}

const listTasks = () => {
  Task.find().then((Tasks) => {
    console.info(Tasks)
    console.info(`${Tasks.length} Tasks`)
    db.close()
  })
}

const getTasks = () => {
  let myTasks = Task.find().then((tasks) => {
    db.close()
    return tasks
  })
  return myTasks
}

const clearTasks = () => {
  Task.deleteMany({}).then((result) => {
    console.log(`Successfully cleared ${result.deletedCount} tasks`)
    db.close()
  })
}

const updateTasks = async (tasks) => {
  const client = new MongoClient(mongoDB)
  await client.connect()

  await tasks.forEach(async (task) => {
    const result = await client
      .db("todo_cli")
      .collection("tasks")
      .updateOne(
        { _id: task._id },
        { $set: { is_completed: task.is_completed } }
      )
  })

  client.close()
}

module.exports = {
  addTask,
  findTask,
  updateTask,
  removeTask,
  listTasks,
  getTasks,
  updateTasks,
  clearTasks,
}
