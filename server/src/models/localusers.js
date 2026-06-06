'use strict';
import { DataTypes } from "sequelize";

const LocalUsers = (sequelize) => {
  const LocalUser = sequelize.define(
    "localusers",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
  field: 'googleId' // ✅ snake_case me match karega
      },
      name: { type: DataTypes.STRING },
photoURL: {
  type: DataTypes.STRING,
  allowNull: true,
  field: "photo_url",   // ✅ DB ka actual column
},
    },
    {
      tableName: "localusers", // table name in DB
      timestamps: true,       // createdAt & updatedAt
      underscored: true,      // ✅ YEH LINE ADD KAREN

    }
  );

  return LocalUser;
};

export default LocalUsers;
