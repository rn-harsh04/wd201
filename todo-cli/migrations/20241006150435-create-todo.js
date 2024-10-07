"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("Todos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: "SERIAL",
      },
      title: {
        type: "VARCHAR(255)",
      },
      dueDate: {
        type: "DATE",
      },
      completed: {
        type: "BOOLEAN",
      },
      createdAt: {
        allowNull: false,
        type: "TIMESTAMP WITH TIME ZONE",
      },
      updatedAt: {
        allowNull: false,
        type: "TIMESTAMP WITH TIME ZONE",
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Todos");
  },
};
