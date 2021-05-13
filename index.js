#!/usr/bin/env node

var dbFile = "./tasks.db"

var Datastore = require("nedb")
var Tasks = new Datastore({ filename: dbFile, autoload: true })

const program = require("commander")
const prompts = require("prompts")
const fs = require("fs")

const kleur = require("kleur")

const addTask = (task) => {
  Tasks.insert(task, function (err, result) {
    if (err) {
      console.log(err)
    }
    console.info("New Task Created")
  })
}

const findTask = (name) => {
  const search = new RegExp(name, "i")

  Tasks.find({ title: search }, function (err, tasks) {
    if (err) {
      console.log(err)
    }

    console.log(`Found ${tasks.length} matches:`)

    tasks.forEach((task) => {
      console.log(task.title)
    })
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
  Tasks.find({}).exec(function (err, tasks) {
    if (tasks.length == 0) {
      console.log("You currently have no tasks.")
      console.log("Create a task using: todo [task]")
      console.log('e.g.: todo "Get groceries"')
      return
    }

    console.log(kleur.blue().bold().underline("Your tasks: "))
    tasks.forEach((task) => console.log(`- ${task.title}`))
  })
}

const getTasks = () => {
  let myTasks = Tasks.find({}, (tasks) => {
    return tasks
  })
  return myTasks
}

const clearTasks = () => {
  Tasks.remove({}, { multi: true }, function (err, numDeleted) {
    if (err) {
      console.log(err)
    }

    console.log(`Deleted ${numDeleted} tasks`)
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

const resetDb = () => {
  fs.unlink(dbFile, (err) => {
    if (err) {
      throw err
    }
    console.log("Reset complete.")
  })
}

// Task Questions
const taskQuestions = [
  {
    type: "text",
    name: "title",
    message: "Task Title: ",
  },
]

program.version("0.1.0").description("To-Do List CLI")

program
  .arguments("[task]")
  .option("-l, --list", "List all tasks")
  .option("-a, --add", "Add task")
  .option("-f, --find [task]", "Find/Search a task")
  .option("-u, --update", "Update a task")
  .option("-r, --remove", "Remove a task")
  .option("-c, --clear", "Clear all tasks")
  .addHelpCommand("help", "Display help")
  .action((task, options) => {
    switch (true) {
      case task != undefined:
        addTask({ title: task.toString(), is_completed: false })
        break

      case options.add:
        prompts(taskQuestions).then((response) => {
          addTask({ title: response.title, is_completed: false })
        })
        break
      case options.find:
        findTask(options.find)
        break
      case options.update:
        Tasks.find({}).exec(function (err, tasks) {
          if (err) {
            console.log(err)
          }

          let taskPrompts = []
          tasks.forEach((task) => {
            const taskPrompt = {
              title: task.title,
            }
            taskPrompts.push(taskPrompt)
          })

          prompts(
            {
              type: "select",
              name: "task",
              message: "Choose a task to update:",
              choices: taskPrompts,
            },
            { onCancel: () => {} }
          ).then((selectResponse) => {
            if (selectResponse) {
              // prompt for Task Title
              prompts(taskQuestions).then((renameResponse) => {
                updateTask(tasks[selectResponse.task]._id, {
                  title: renameResponse.title,
                  is_completed: tasks[selectResponse.task].is_completed,
                })
              })
            }
          })
        })
        break
      case options.remove:
        Tasks.find({}).exec(function (err, tasks) {
          if (err) {
            console.log(err)
          }

          let taskPrompts = []
          tasks.forEach((task) => {
            const taskPrompt = {
              title: task.title,
            }
            taskPrompts.push(taskPrompt)
          })

          prompts(
            {
              type: "select",
              name: "task",
              message: "Choose a task to remove:",
              choices: taskPrompts,
            },
            { onCancel: () => {} }
          ).then((selectResponse) => {
            if (selectResponse) {
              // prompt for Task Title
              removeTask(tasks[selectResponse.task]._id)
            }
          })
        })
        break
      case options.clear:
        clearTasks()
        break
      case options.list:
        listTasks()
        break
      default:
        Tasks.find({}).exec(function (err, tasks) {
          if (tasks.length == 0) {
            console.log("You currently have no tasks.")
            console.log("Create a task using: todo [task]")
            console.log('e.g.: todo "Get groceries"')
            return
          }
          if (err) {
            console.log(err)
          }
          let taskPrompts = []
          tasks.forEach((task) => {
            const taskPrompt = {
              title: task.title,
              selected: task.is_completed,
            }
            taskPrompts.push(taskPrompt)
          })

          prompts(
            {
              type: "multiselect",
              name: "tasks",
              message: "Done:",
              choices: taskPrompts,
            },
            { onCancel: () => {} }
          ).then((response) => {
            if (response.tasks) {
              for (let index = 0; index < tasks.length; index++) {
                if (response.tasks.includes(index)) {
                  tasks[index].is_completed = true
                } else {
                  tasks[index].is_completed = false
                }
              }
              updateTasks(tasks)
            }
          })
        })
        break
    }
  })

program
  .command("reset")
  .description("Reset the ToDo CLI Database")
  .action(() => resetDb())
program.parse(process.argv)
