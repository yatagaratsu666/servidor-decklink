import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

export const ENV = {
  JWT_SECRET: process.env["JWT_SECRET"] || "",
  JWT_EXPIRES_IN: process.env["JWT_EXPIRES_IN"] || "1h",
  DB_HOST: process.env["DB_HOST"] || "localhost",
  DB_PORT: Number(process.env["DB_PORT"]) || 3306,
  DB_USER: process.env["DB_USER"] || "root",
  DB_PASSWORD: process.env["DB_PASSWORD"] || "",
  DB_NAME: process.env["DB_NAME"] || "cartas_db",
  MONGO_URI: process.env["MONGO_URI"] || "mongodb://localhost:27017/cartas_db",
};
