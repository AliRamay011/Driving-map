'use strict';
import { DataTypes } from "sequelize";

const Otp = (sequelize) => {
  const Otp = sequelize.define(
    "Otp",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      modelName: "Otp", // singular name
      tableName: "otps", // db table name
      timestamps: false, // kyunki tumne manually created_at dala
    }
  );

  // Relations: ek OTP ek user ka hoga
  Otp.associate = (models) => {
    Otp.belongsTo(models.LocalUser, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
  };

  return Otp;
};


export default Otp ;