/* eslint-disable no-unused-vars */
const request = require("supertest");
const db = require("../models/index");
const cheerio = require("cheerio");
const app = require("../app");
const dayjs = require("dayjs");
let server, agent;

// Function to extract CSRF token from the response
function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true }); // Sync DB
    server = app.listen(4000, () => {}); // Start server
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close(); // Close DB connection
    server.close(); // Stop server
  });

  test("responds with json at /todos", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); // Expect redirect
  });

  test("Mark a todo as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    // Create a new todo
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
      _csrf: csrfToken,
    });

    // Fetch todos
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const { dueTodayTodos } = JSON.parse(groupedTodosResponse.text);
    const latestTodo = dueTodayTodos[dueTodayTodos.length - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        completed: true,
        _csrf: csrfToken,
      });

    expect(markCompleteResponse.statusCode).toBe(200); // Successful update
    expect(JSON.parse(markCompleteResponse.text).completed).toBe(true);

    // Verify that the todo is no longer in dueTodayTodos
    const updatedGroupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const updatedDueTodayTodos = JSON.parse(
      updatedGroupedTodosResponse.text,
    ).dueTodayTodos;

    // Ensure the completed todo is not in dueTodayTodos
    expect(updatedDueTodayTodos).not.toContainEqual(
      expect.objectContaining({ id: latestTodo.id }),
    );
  });

  test("Delete a todo by the ID", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    // Create a new todo
    await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
      _csrf: csrfToken,
    });

    // Fetch todos
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const { dueTodayTodos } = JSON.parse(groupedTodosResponse.text);
    const latestTodo = dueTodayTodos[dueTodayTodos.length - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const deleteResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });

    expect(deleteResponse.statusCode).toBe(200);
    expect(JSON.parse(deleteResponse.text).success).toBe(true);

    // Verify that the todo is no longer in the list
    const afterDeleteResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const afterDeleteTodos = JSON.parse(afterDeleteResponse.text).dueTodayTodos;

    expect(afterDeleteTodos).not.toContainEqual(
      expect.objectContaining({ id: latestTodo.id }),
    );
  });
});
