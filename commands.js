#!/usr/bin/env node

const program = require("commander")
//const { prompt } = require("inquirer")
const prompts = require("prompts")
const {
  addTask,
  findTask,
  updateTask,
  removeTask,
  listTasks,
  getTasks,
  updateTasks,
  clearTasks,
} = require("./index")

// Task Questions
const taskQuestions = [
  {
    type: "text",
    name: "title",
    message: "Task: ",
  },
]

program.version("1.0.0").description("To-Do List CLI")

program
  .arguments("[task]")
  .option("-l, --list", "List all tasks")
  .option("-a, --add", "Add task")
  .option("-f, --find [task]", "Find/Search a task")
  .option("-u, --update", "Update a task")
  .option("-c, --clear", "Clear all tasks")
  .addHelpCommand("help", "show assistance")
  .action(
    (task, options) => {
      if (task) {
        addTask({ title: task.toString(), is_completed: false })
      } else if (options.add) {
        prompts(taskQuestions).then((response) => {
          addTask({ title: response.title, is_completed: false })
        })
      } else if (options.find) {
        findTask(options.find)
      } else if (options.update) {
      } else if (options.clear) {
        clearTasks()
      } else if (options.list) {
        listTasks()
      } else {
        getTasks().then((tasks) => {
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
      }

      // default
    }
    //listTasks()
  )

program
  .command("update <_id>")
  .alias("u")
  .description("Update a Task")
  .action((_id) => {
    prompts(taskQuestions).then((answers) => updateTask(_id, answers))
  })

program
  .command("remove <_id>")
  .alias("r")
  .description("Remove a Task")
  .action((_id) => removeTask(_id))

program.parse(process.argv)
