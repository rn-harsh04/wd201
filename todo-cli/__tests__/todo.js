const todoList = require('../todo');

describe("TodoList Test Suite", () => {
  const { all, add, markAsComplete, overdue, dueToday, dueLater } = todoList();

  test("Should add new todo", () => {
    expect(all.length).toBe(0);
    add({
      title: "Test Todo",
      completed: false,
      dueDate: new Date().toISOString().slice(0, 10),
    });
    expect(all.length).toBe(1);
  });

  test("Should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  test("Should retrieve overdue items", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    add({
      title: "Overdue Todo",
      completed: false,
      dueDate: yesterday.toISOString().slice(0, 10),
    });
    const overdueItems = overdue();
    expect(overdueItems.length).toBe(1);
  });

  test("Should retrieve due today items", () => {
    const dueTodayItems = dueToday();
    expect(dueTodayItems.length).toBe(1);
  });

  test("Should retrieve due later items", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    add({
      title: "Due Later Todo",
      completed: false,
      dueDate: tomorrow.toISOString().slice(0, 10),
    });
    const dueLaterItems = dueLater();
    expect(dueLaterItems.length).toBe(1);
  });
});
