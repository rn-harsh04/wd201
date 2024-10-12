/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const express = require("express");
const app = express();
const path =require("path")
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,'public')));
app.get("/",async(request,response)=>{
  const allTodos=await Todo.getTodos();
  if(request.accepts("html")){
    response.render('index',{
      allTodos
    });
  }else{
    response.json({
      allTodos
    })
  }

})
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
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("We have to update a todo with ID:", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
app.delete("/todos/:id", async (request, response) => {
  console.log("Delete a todo by ID:", request.params.id);
  const todo=await Todo.findByPk(request.params.id);
  const id=request.params.id
  try {
    const result=await Todo.destroy({
      where: {id:id}
    });
    return response.json(result? true:false);
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
});

module.exports = app;
