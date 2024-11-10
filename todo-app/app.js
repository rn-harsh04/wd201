/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const express = require("express");
const app = express();
const path =require("path")
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine","ejs");
const dayjs = require("dayjs");
app.use(express.static(path.join(__dirname,'public')));
app.get("/", async (request, response) => {
  try {
    const allTodos = await Todo.getTodos();
    const today = dayjs().format("YYYY-MM-DD");

    const overdueTodos = allTodos.filter(todo => dayjs(todo.dueDate).isBefore(today));
    const dueTodayTodos = allTodos.filter(todo => dayjs(todo.dueDate).isSame(today));
    const dueLaterTodos = allTodos.filter(todo => dayjs(todo.dueDate).isAfter(today));

    if (request.accepts("html")) {
      response.render("index", {
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos
      });
    } else {
      response.json({
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos
      });
    }
  } catch (error) {
    console.error(error);
    response.status(500).send("Internal Server Error");
  }
});
app.get("/todos", async (request, response) => {
  console.log("Todo List",request.body);
  try {
    const todo =await Todo.findAll();
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
app.post("/todos", async (request, response) => {
  console.log("Creating a Todo", request.body);
  //todo
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
app.put("/todos/:id/markAsCompleted", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    const updatedTodo = await todo.update({ completed: true });
    return response.json(updatedTodo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});
app.delete("/todos/:id", async (request, response) => {
  console.log("Deleting a Todo by ID:", request.params.id);
  try {
    await Todo.remove(request.params.id);  // Corrected here
    return response.json({ success: true });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
