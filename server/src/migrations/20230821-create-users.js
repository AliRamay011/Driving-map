'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      address: { type: Sequelize.TEXT, allowNull: true },
      dob: { type: Sequelize.DATEONLY, allowNull: true },
      gender: { type: Sequelize.ENUM('Male','Female','Other'), allowNull: true },
      profile: { type: Sequelize.STRING(255), allowNull: true },
      role: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: "user",
      },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
