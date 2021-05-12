const mongoose = require("mongoose")

// Tasks Schema
const taskSchema = mongoose.Schema({
  title: { type: String },
  due_date: Date,
  is_completed: Boolean,
})

module.exports = mongoose.model("Task", taskSchema)
