'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('traffic_police', 'accident', 'other'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      distance_meters: {
        type: Sequelize.INTEGER
      },
      side: {
        type: Sequelize.ENUM('left', 'center', 'right')
      },
      latitude: {
        type: Sequelize.DECIMAL(9,6),
        allowNull: false
      },
      longitude: {
        type: Sequelize.DECIMAL(9,6),
        allowNull: false
      },
      valid_till: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reports');
  }
};
