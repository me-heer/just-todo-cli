const mongoose = require("mongoose")

// Tasks Schema
const taskSchema = mongoose.Schema({
  title: { type: String },
  created_on: Date,
  is_completed: Boolean,
})

module.exports = mongoose.model("Task", taskSchema)
