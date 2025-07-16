// src/routes/auth.routes.ts
import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import database from '../database.mjs';
import type { AuthRequest } from '../middleware/auth.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

// 🔐 Sign Up
router.post('/signup', async (req: AuthRequest, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required' });

  try {
    const exists = await database.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rows.length)
      return res.status(409).json({ error: 'User already exists with this email' });

    const hash = await bcrypt.hash(password, 10);

    const result = await database.query(
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal`,
      [name, email, hash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.status(201).json({ message: 'Signup successful', token, user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔐 Login
router.post('/login', async (req: AuthRequest, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const result = await database.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dailyCalorieGoal: user.daily_calorie_goal,
        dailyProteinGoal: user.daily_protein_goal,
        dailyCarbsGoal: user.daily_carbs_goal,
        dailyFatGoal: user.daily_fat_goal
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 👤 Get Profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await database.query(
      'SELECT id, name, email, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal FROM users WHERE id = $1',
      [req.user!.id]
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✏️ Update Profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  const { name, dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal } = req.body;

  try {
    const result = await database.query(
      `UPDATE users 
       SET name = $1, daily_calorie_goal = $2, daily_protein_goal = $3,
           daily_carbs_goal = $4, daily_fat_goal = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING id, name, email, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal`,
      [name, dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal, req.user!.id]
    );

    res.json({ message: 'Profile updated', user: result.rows[0] });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
