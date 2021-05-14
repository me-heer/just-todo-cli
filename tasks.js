var dbFile = "./tasks.db"

var Datastore = require("nedb")
var Tasks = new Datastore({ filename: dbFile, autoload: true })

const figures = require("prompts/lib/util/figures")
const moment = require("moment")
const fs = require("fs")

const kleur = require("kleur")
const { configureHelp } = require("commander")

const addTask = (task) => {
  Tasks.insert(task, function (err, result) {
    if (err) {
      console.log(err)
    }
    console.info("New Task Created")
  })
}

const updateTask = (_id, task) => {
  Tasks.update({ _id }, task, { upsert: false, multi: false }, (err) => {
    console.log("Task updated")
  })
}

const removeTask = (_id) => {
  Tasks.remove({ _id: _id }, (err) => {
    if (err) {
      console.log(err)
    }
    console.log("Task removed")
  })
}

const listTasks = () => {
  Tasks.find({})
    .sort({ created_on: 1 })
    .exec(function (err, tasks) {
      if (tasks.length == 0) {
        console.info("You currently have no tasks.")
        console.info("Create a task using: todo [task]")
        console.info('e.g.: todo "Get groceries"')
        return
      }

      console.info(kleur.blue().bold().underline("Your tasks:"))
      tasks.forEach((task) => {
        if (task.is_completed)
          console.info(
            `${kleur.green(figures.tick)} ${kleur.green(
              task.title
            )} ${kleur.gray(
              "(" +
                moment(new Date(task.created_on)).format(
                  "h:mm A - Do MMMM YYYY"
                ) +
                ")"
            )}`
          )
        else
          console.info(
            `${figures.line} ${task.title} ${kleur.gray(
              "(" +
                moment(new Date(task.created_on)).format(
                  "h:mm A - Do MMMM YYYY"
                ) +
                ")"
            )}`
          )
      })
    })
}

const updateTasks = async (tasks) => {
  tasks.forEach((task) => {
    Tasks.update({ _id: task._id }, task, {}, (err) => {
      if (err) {
        console.log(err)
      }
    })
  })
}

const reset = () => {
  fs.unlink(dbFile, (err) => {
    if (err) {
      throw err
    }
    console.log("Reset complete.")
  })
}

const getTasks = () => {
  return new Promise(function (resolve, reject) {
    Tasks.find({})
      .sort({ created_on: 1 })
      .exec((err, tasks) => {
        if (err) {
          console.log(err)
        }
        resolve(tasks)
      })
  })
}

module.exports = {
  addTask,
  updateTask,
  removeTask,
  listTasks,
  getTasks,
  updateTasks,
  reset,
}
