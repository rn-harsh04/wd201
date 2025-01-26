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
//Function for User login
const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};
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
  test("Sign up", async () => {
    let res = await agent.get("/signup");
    let csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "testing",
      email: "user.testing@test.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });
  test("Sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });
  test("responds with json at /todos", async () => {
    const agent = request.agent(server);
    await login(agent, "user.testing@test.com", "12345678");
    const res = await agent.get("/todos");
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
    const agent = request.agent(server);
    await login(agent, "user.testing@test.com", "12345678");
    let res = await agent.get("/todos");
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
      .get("/todos")
      .set("Accept", "application/json");
    const { dueTodayTodos } = JSON.parse(groupedTodosResponse.text);
    const latestTodo = dueTodayTodos[dueTodayTodos.length - 1];

    res = await agent.get("/todos");
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
      .get("/todos")
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
    const agent = request.agent(server);
    await login(agent, "user.testing@test.com", "12345678");
    let res = await agent.get("/todos");
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
      .get("/todos")
      .set("Accept", "application/json");
    const { dueTodayTodos } = JSON.parse(groupedTodosResponse.text);
    const latestTodo = dueTodayTodos[dueTodayTodos.length - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const deleteResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });

    expect(deleteResponse.statusCode).toBe(200);
    expect(JSON.parse(deleteResponse.text).success).toBe(true);

    // Verify that the todo is no longer in the list
    const afterDeleteResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const afterDeleteTodos = JSON.parse(afterDeleteResponse.text).dueTodayTodos;

    expect(afterDeleteTodos).not.toContainEqual(
      expect.objectContaining({ id: latestTodo.id }),
    );
  });
});
