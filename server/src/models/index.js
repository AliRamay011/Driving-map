import { Sequelize } from "sequelize";
import initModels from "./init-models.js";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOSTNAME,
    dialect: "mysql",
    logging:false ,
  
  }
);

const models = initModels(sequelize);

export { sequelize };
export default models;
