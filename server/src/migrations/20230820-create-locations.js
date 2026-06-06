'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('locations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      address: { type: Sequelize.STRING(500), allowNull: true },
      latitude: { type: Sequelize.DECIMAL(10,8), allowNull: false },
      longitude: { type: Sequelize.DECIMAL(11,8), allowNull: false },
      category: { type: Sequelize.STRING(255), allowNull: true },
      keywords: { type: Sequelize.STRING(255), allowNull: true },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('locations');
  },
};
