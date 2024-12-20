import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_DATABASE || "qairline",
  process.env.DB_USERNAME || "qairline",
  process.env.DB_PASSWORD || "Vuniem131104@",
  {
    dialect: "mysql",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
      },
      connectTimeout: 60000,
    },
  }
);
