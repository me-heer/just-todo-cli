# just-todo-cli

Simple. Minimal. To-Do. CLI.

Sometimes you just don't want to wait for a GUI to load up.

![banner](banner.png)
![tutorial](tutorial.gif)

### Requirements:

- Install NodeJS (<https://nodejs.org/en/>)

### Installation:

    mkdir todo
    cd todo
    npm install -g just-todo-cli

**Note:** Installing the CLI will create 2 files (tasks.db, userSettings.db) to store data.

That's it. Just open the terminal/cmd and type in: `todo`

## Commands

```
Usage: todo [options] [command] [task]

To-Do List CLI

Options:
  -a, --add     add a task
  -h, --help    display help for command
  -l, --list    list all tasks
  -r, --remove  remove a task
  -u, --update  update a task

Commands:
  reset         Reset the ToDo CLI Database
```

### Uninstall

    npm uninstall -g just-todo-cli
