import "reflect-metadata"
import path from "path"

import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
  type: "mysql",
  url: process.env.AUTH_TYPEORM_CONNECTION || "mysql://root:@127.0.0.1:3306/freelance",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "freelance",
  entities: [path.join(process.cwd(), "./entities/**/*.entity.{js,ts}")],
  migrations: [path.join(process.cwd(), "./migrations/**/*.{js,ts}")],
  synchronize: process.env.NODE_ENV !== "production", // Set to false in production
  logging: process.env.NODE_ENV !== "production",
})
