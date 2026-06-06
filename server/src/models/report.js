import { DataTypes } from 'sequelize';

const Report = (sequelize) => {
  return sequelize.define('reports', {
    id: { autoIncrement: true, type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
    type: { type: DataTypes.ENUM('traffic_police','accident','other'), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    distance_meters: { type: DataTypes.INTEGER, allowNull: true },
    side: { type: DataTypes.ENUM('left','center','right'), allowNull: true },
    latitude: { type: DataTypes.DECIMAL(9,6), allowNull: false },
    longitude: { type: DataTypes.DECIMAL(9,6), allowNull: false },
    valid_till: { type: DataTypes.DATE, allowNull: false }
    
  }, {
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};

export default Report;
