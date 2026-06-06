'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('place_images', {
            id: { 
        type: Sequelize.INTEGER.UNSIGNED, 
        autoIncrement: true, 
        primaryKey: true 
      },
      place_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: 'places', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      image_url: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('place_images');
  }
};
