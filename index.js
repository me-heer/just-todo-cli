#!/usr/bin/env node

const program = require("commander")
const prompts = require("prompts")

const {
  addTask,
  updateTask,
  removeTask,
  getTasks,
  updateTasks,
  listTasks,
  reset,
} = require("./tasks")

// Task Questions
const taskQuestions = [
  {
    type: "text",
    name: "title",
    message: "Task Title: ",
  },
]

program.description("To-Do List CLI")

program.configureHelp({
  sortSubcommands: true,
  sortOptions: true,
})

program
  .arguments("[task]")
  .option("-l, --list", "list all tasks")
  .option("-a, --add", "add a task")
  .option("-u, --update", "update a task")
  .option("-r, --remove", "remove a task")
  .addHelpCommand(false)
  .action((task, options) => {
    switch (true) {
      case task != undefined:
        addTask({
          title: task.toString(),
          is_completed: false,
          created_on: Date(),
        })
        break

      case options.add:
        prompts(taskQuestions).then((response) => {
          addTask({
            title: response.title,
            is_completed: false,
            created_on: Date(),
          })
        })
        break
      case options.update:
        getTasks().then(function (tasks) {
          let taskPrompts = []
          tasks.forEach((task) => {
            const taskPrompt = {
              title: task.title,
            }
            taskPrompts.push(taskPrompt)
          })

          prompts({
            type: "select",
            name: "task",
            message: "Choose a task to update:",
            choices: taskPrompts,
          }).then((selectResponse) => {
            if (selectResponse) {
              // prompt for Task Title
              prompts(taskQuestions).then((renameResponse) => {
                if (renameResponse.title) {
                  updateTask(tasks[selectResponse.task]._id, {
                    title: renameResponse.title,
                    is_completed: tasks[selectResponse.task].is_completed,
                    created_on: tasks[selectResponse.task].created_on,
                  })
                }
              })
            }
          })
        })
        break
      case options.remove:
        getTasks().then(function (tasks) {
          if (tasks.length == 0) {
            console.info("You currently have no tasks.")
            console.info("Create a task using: todo [task]")
            console.info('e.g.: todo "Get groceries"')
            return
          }
          let taskPrompts = []
          tasks.forEach((task) => {
            const taskPrompt = {
              title: task.title,
            }
            taskPrompts.push(taskPrompt)
          })

          prompts({
            type: "select",
            name: "task",
            message: "Choose a task to remove:",
            choices: taskPrompts,
          }).then((selectResponse) => {
            if (selectResponse) {
              // prompt for Task Title
              removeTask(tasks[selectResponse.task]._id)
            }
          })
        })
        break
      case options.list:
        listTasks()
        break
      default:
        getTasks().then((tasks) => {
          if (tasks.length == 0) {
            console.log("You currently have no tasks.")
            console.log("Create a task using: todo [task]")
            console.log('e.g.: todo "Get groceries"')
            return
          }
          let taskPrompts = []
          tasks.forEach((task) => {
            const taskPrompt = {
              title: task.title,
              selected: task.is_completed,
            }
            taskPrompts.push(taskPrompt)
          })

          prompts({
            type: "multiselect",
            name: "tasks",
            message: "Done:",
            choices: taskPrompts,
          }).then((response) => {
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
  .action(() => reset())

try {
  program.parse(process.argv)
} catch (error) {
  console.log(error)
}
