import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test database connection
export const connectDB = async () => {
  try {
    await pool.connect();
    console.log("✅ Connected to PostgreSQL database");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
};

// Initialize database tables
export const initDB = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        daily_calorie_goal INTEGER DEFAULT 2000,
        daily_protein_goal INTEGER DEFAULT 150,
        daily_carbs_goal INTEGER DEFAULT 250,
        daily_fat_goal INTEGER DEFAULT 70,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create food_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS food_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        calories DECIMAL(8,2) NOT NULL,
        protein DECIMAL(8,2) NOT NULL,
        carbs DECIMAL(8,2) NOT NULL,
        fat DECIMAL(8,2) NOT NULL,
        serving VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create meal_entries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meal_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        food_item_id INTEGER REFERENCES food_items(id) ON DELETE CASCADE,
        food_name VARCHAR(255) NOT NULL,
        calories DECIMAL(8,2) NOT NULL,
        protein DECIMAL(8,2) NOT NULL,
        carbs DECIMAL(8,2) NOT NULL,
        fat DECIMAL(8,2) NOT NULL,
        quantity DECIMAL(8,2) NOT NULL,
        meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
        serving VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample food items if they don't exist
    const foodExists = await pool.query("SELECT COUNT(*) FROM food_items");
    if (parseInt(foodExists.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO food_items (name, calories, protein, carbs, fat, serving) VALUES
        ('Banana', 105, 1.3, 27, 0.4, '1 medium (118g)'),
        ('Apple', 95, 0.5, 25, 0.3, '1 medium (182g)'),
        ('Greek Yogurt', 130, 20, 9, 0, '1 cup (245g)'),
        ('Chicken Breast', 165, 31, 0, 3.6, '100g'),
        ('Brown Rice', 216, 5, 45, 1.8, '1 cup cooked (195g)'),
        ('Avocado', 234, 2.9, 12, 21, '1 medium (150g)'),
        ('Almonds', 161, 6, 6, 14, '1 oz (28g)'),
        ('Salmon', 206, 28, 0, 9, '100g'),
        ('Broccoli', 31, 3, 6, 0.4, '1 cup chopped (91g)'),
        ('Oatmeal', 154, 5, 28, 3, '1 cup cooked (234g)'),
        ('Eggs', 155, 13, 1, 11, '2 large eggs (100g)'),
        ('Sweet Potato', 112, 2, 26, 0.1, '1 medium baked (128g)'),
        ('Spinach', 7, 0.9, 1, 0.1, '1 cup fresh (30g)'),
        ('Quinoa', 222, 8, 39, 4, '1 cup cooked (185g)'),
        ('Blueberries', 84, 1, 21, 0.5, '1 cup (148g)')
      `);
    }

    console.log("✅ Database tables initialized");
  } catch (err) {
    console.error("❌ Database initialization error:", err);
    throw err;
  }
};

export default pool;
