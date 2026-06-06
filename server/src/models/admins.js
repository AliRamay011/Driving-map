// server/src/models/admins.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Admins = sequelize.define(
    "admins",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
 primaryKey: true,      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: "admin",
},
    },
    {
      tableName: "admins",
      timestamps: true,
     underscored: false, // ✅ DB snake_case columns ke liye
    }
  );

  return Admins;
};
