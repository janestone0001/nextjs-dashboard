import "reflect-metadata"
import { AppDataSource } from "@db/typeorm.config"

// Initialize connection
let initialized = false

export async function initializeDatabase() {
  if (!initialized) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
      }

      initialized = true
      console.log("Database connection established")
    } catch (error) {
      console.error("Error connecting to database:", error)
      throw error
    }
  }

  return AppDataSource
}

export async function getConnection() {
  return await initializeDatabase()
}

