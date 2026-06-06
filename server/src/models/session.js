'use strict';
import { DataTypes } from "sequelize";

const session  = (sequelize) => {
  const Session = sequelize.define(
    "Session",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      modelName: "Session",
      tableName: "sessions",
      timestamps: false, // kyunki created_at already define kiya hai
    }
  );

  // relation: ek session ek user ka hoga
  Session.associate = (models) => {
    Session.belongsTo(models.LocalUser, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
  };

  return Session;
};


export default session ;