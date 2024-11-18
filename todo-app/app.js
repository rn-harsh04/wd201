const express = require("express");
const app = express();
const path = require("path");
const csrf = require("tiny-csrf");
const dayjs = require("dayjs");
const cookieParser = require("cookie-parser");
const { Todo } = require("./models");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("shh! Some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

// Middleware to handle CSRF token errors
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next(err);
});

// GET route for the home page
app.get("/", async (request, response) => {
  try {
    const allTodos = await Todo.getTodos();
    const today = dayjs().format("YYYY-MM-DD");

    // Filter todos based on their completion status
    const overdueTodos = allTodos.filter(
      (todo) => dayjs(todo.dueDate).isBefore(today) && !todo.completed,
    );
    const dueTodayTodos = allTodos.filter(
      (todo) => dayjs(todo.dueDate).isSame(today) && !todo.completed,
    );
    const dueLaterTodos = allTodos.filter(
      (todo) => dayjs(todo.dueDate).isAfter(today) && !todo.completed,
    );
    const completedTodos = allTodos.filter((todo) => todo.completed);

    if (request.accepts("html")) {
      return response.render("index", {
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
        csrfToken: request.csrfToken(),
      });
    } else {
      return response.json({
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
      });
    }
  } catch (error) {
    console.error(error);
    return response.status(500).send("Internal Server Error");
  }
});

// GET route to fetch all todos
app.get("/todos", async (request, response) => {
  try {
    const allTodos = await Todo.getTodos();
    return response.json(allTodos);
  } catch (error) {
    console.error(error);
    return response.status(500).send("Internal Server Error");
  }
});

// POST route to add a new todo
app.post("/todos", async (request, response) => {
  const { title, dueDate } = request.body;

  if (!title || !dueDate) {
    return response
      .status(422)
      .json({ error: "Title and due date are required." });
  }

  try {
    await Todo.addTodo({
      title,
      dueDate,
      completed: false,
    });
    return response.redirect("/");
  } catch (error) {
    console.error(error);
    return response.status(422).json({ error: error.message });
  }
});

// PUT route to mark a todo as complete or incomplete
app.put("/todos/:id", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    const { completed } = request.body;
    await todo.update({ completed });
    return response.json(todo);
  } catch (error) {
    console.error(error);
    return response.status(422).json({ error: error.message });
  }
});

// DELETE route to remove a todo
app.delete("/todos/:id", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    console.error(error);
    return response.status(422).json({ error: error.message });
  }
});

// Route to get completed todos
app.get("/todos/completed", async (request, response) => {
  try {
    const completedTodos = await Todo.findAll({
      where: { completed: true },
    });

    if (request.accepts("json")) {
      return response.json(completedTodos);
    }

    return response.render("completed", { completedTodos });
  } catch (error) {
    console.error(error);
    return response.status(500).send("Internal Server Error");
  }
});

// Export the app for testing
module.exports = app;
