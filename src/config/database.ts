import { Sequelize } from "sequelize";
const config = require("./config");

// Get the current environment or default to development
const env = process.env.NODE_ENV || "development";
const dbConfig = config[env as keyof typeof config];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  }
);

export { sequelize };
