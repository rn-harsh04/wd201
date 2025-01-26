# WD201

## Overview
The wd201 repository contains code and projects related to the WD201 course by Pupilfirst. It includes various modules such as a simple HTTP server, a Todo application, and a command-line interface for managing todos.

## Project Structure
- **http-server**: A simple HTTP server that serves HTML content.
- **todo-app**: A Todo application using Express.js, Sequelize, and EJS for templating.
- **todo-cli**: A command-line interface for managing todos.

## Dependencies
The project relies on several dependencies which are managed using npm:

- express
- sequelize
- ejs
- dayjs
- minimist
- cookie-parser
- tiny-csrf
- passport
- bcrypt
- body-parser
- connect-ensure-login
- express-session
- passport-local

## Getting Started

### Prerequisites
Ensure you have the following installed:
- Node.js
- npm

### Installation
1. Clone the repository:
   git clone https://github.com/rn-harsh04/wd201.git
   cd wd201 
2. Install the dependencies:  
   npm install  

### Running the HTTP Server
Navigate to the `http-server` directory:  
   cd http-server  

Start the server:  
   node index.js --port=3000  

Open your browser and go to http://localhost:3000.

### Running the Todo Application
Navigate to the `todo-app` directory:  
   cd ../todo-app  

Start the application:  
   node app.js  

Open your browser and go to http://localhost:3000.

### Using the Todo CLI
Navigate to the `todo-cli` directory:  
   cd ../todo-cli  

Add a new todo:  
   node addTodo.js --title="Buy milk" --dueInDays=2  

Mark a todo as complete:  
   node completeTodo.js --id=1  

### Testing
To run the tests, use the following command:  
   npm test  
