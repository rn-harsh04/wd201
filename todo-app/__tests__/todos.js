/* eslint-disable no-unused-vars */
const request = require("supertest");
const db = require("../models/index");
const cheerio = require("cheerio");
const app = require("../app");
let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true }); // Syncing DB before running tests
    server = app.listen(4000, () => {}); // Starting server
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close(); // Closing DB connection
    server.close(); // Stopping server
  });

  test("responds with json at /todos", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split("T")[0], // Format to YYYY-MM-DD
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); // Expecting a redirect after adding a todo
  });

  test("Mark a todo as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split("T")[0], // Format to YYYY-MM-DD
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);

    // Extract dueToday from the response
    const dueToday = parsedGroupedResponse.dueTodayTodos;

    if (dueToday && Array.isArray(dueToday) && dueToday.length > 0) {
      const latestTodo = dueToday[dueToday.length - 1];

      res = await agent.get("/");
      csrfToken = extractCsrfToken(res);
      const markCompleteResponse = await agent
        .put(`/todos/${latestTodo.id}`)
        .send({
          completed: true, // Mark as completed
          _csrf: csrfToken,
        });

      const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
      expect(parsedUpdateResponse.completed).toBe(true);
    } else {
      throw new Error("dueToday is not defined, is not an array, or is empty");
    }
  });

  test("Delete a todo by the ID", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    const createResponse = await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString().split("T")[0], // Format to YYYY-MM-DD
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueToday = parsedGroupedResponse.dueTodayTodos;

    if (dueToday && Array.isArray(dueToday) && dueToday.length > 0) {
      const latestTodo = dueToday[dueToday.length - 1];
      console.log("Attempting to delete todo with ID:", latestTodo.id); // Debugging line

      // Fetch a new CSRF token before the DELETE request
      res = await agent.get("/");
      csrfToken = extractCsrfToken(res);

      const deleteResponse = await agent
        .delete(`/todos/${latestTodo.id}`)
        .send({
          _csrf: csrfToken, // Include CSRF token for security
        });

      console.log("Delete Response:", deleteResponse.text); // Debugging line
      expect(deleteResponse.statusCode).toBe(200); // Expecting a successful deletion
      const parsedDeleteResponse = JSON.parse(deleteResponse.text);
      expect(parsedDeleteResponse.success).toBe(true); // Expecting success response
    } else {
      throw new Error("No dueToday todos found to delete.");
    }
  });
});
