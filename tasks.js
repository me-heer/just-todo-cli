const taskDbFile = "./tasks.db"
const userDbFile = "./user-settings.db"

const Datastore = require("nedb")
const Tasks = new Datastore({ filename: taskDbFile, autoload: true })
const UserSettings = new Datastore({ filename: userDbFile, autoload: true })

const figures = require("prompts/lib/util/figures")
const moment = require("moment")
const fs = require("fs")

const kleur = require("kleur")

const initializeUser = () => {
  UserSettings.insert({ is_first_time: true }, function (err, result) {
    if (err) {
      console.log(err)
    }
  })
}

const saveUserSettings = (user) => {
  UserSettings.insert(user, function (err, result) {
    if (err) {
      console.log(err)
    }
  })
}

const loadUserSettings = () => {
  return new Promise(function (resolve, reject) {
    UserSettings.findOne({}).exec((err, user) => {
      if (err) {
        console.log(err)
      }
      resolve(user)
    })
  })
}

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
    .sort({ is_completed: true })
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
  fs.unlink(taskDbFile, (err) => {
    if (err) {
      throw err
    }

    fs.unlink(userDbFile, (err) => {
      if (err) throw err
      console.log("Reset complete.")
    })
  })
}

const getTasks = () => {
  return new Promise(function (resolve, reject) {
    Tasks.find({})
      .sort({ is_completed: true })
      .exec((err, tasks) => {
        if (err) {
          console.log(err)
        }
        resolve(tasks)
      })
  })
}

const makeTaskPrompts = (tasks) => {
  let taskPrompts = []
  tasks.forEach((task) => {
    const taskPrompt = {
      title:
        task.title +
        " (" +
        moment(new Date(task.created_on)).format("h:mm A - Do MMMM YYYY") +
        ")",
      selected: task.is_completed,
    }
    taskPrompts.push(taskPrompt)
  })
  return taskPrompts
}

module.exports = {
  addTask,
  updateTask,
  removeTask,
  listTasks,
  getTasks,
  updateTasks,
  reset,
  saveUserSettings,
  loadUserSettings,
  initializeUser,
  makeTaskPrompts,
}
