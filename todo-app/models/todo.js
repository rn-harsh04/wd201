/* eslint-disable no-unused-vars */
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // Define associations here if needed
    }

    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    static getTodos() {
      return this.findAll();
    }

    static async remove(id) {
      const todo = await this.findByPk(id);
      if (!todo) {
        throw new Error("Todo not found");
      }
      return this.destroy({
        where: {
          id,
        },
      });
    }
  }

  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );

  return Todo;
};
