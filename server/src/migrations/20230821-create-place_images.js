'use strict';

const PlaceImages = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('place_images', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      placeId: {
        type: Sequelize.INTEGER,
        references: { model: 'places', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      url: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('place_images');
  },
};

export default PlaceImages ;