
import express from 'express';
import pool from '../database.mjs';
import type { AuthRequest } from '../middleware/auth.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

// Get all food items
router.get('/foods', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const foods = await pool.query('SELECT * FROM food_items ORDER BY name');
        res.json(foods.rows);
    } catch (error) {
        console.error('Get foods error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Daily Totals
router.get('/meals/totals', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date query parameter is required' });
        }

        const totals = await pool.query(
            `SELECT 
            COALESCE(SUM(calories), 0) AS total_calories,
            COALESCE(SUM(protein), 0) AS total_protein,
            COALESCE(SUM(carbs), 0) AS total_carbs,
            COALESCE(SUM(fat), 0) AS total_fat
            FROM meal_entries
            WHERE user_id = $1 AND date = $2`,
            [req.user!.id, date]
        );

        res.json(totals.rows[0]);
    } catch (error) {
        console.error('Fetch totals error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Meal Entries for a Date
router.get('/meals', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date query parameter is required' });
        }

        const meals = await pool.query(
            `SELECT * FROM meal_entries
            WHERE user_id = $1 AND date = $2
            ORDER BY created_at DESC`,
            [req.user!.id, date]
        );

        res.json(meals.rows);
    } catch (error) {
        console.error('Fetch meals error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Log a meal entry
router.post('/meals', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const {
            foodItemId,
            foodName,
            calories,
            protein,
            carbs,
            fat,
            quantity,
            mealType,
            serving,
            date,
        } = req.body;

        if (
            !foodName || !calories || !protein || !carbs || !fat ||
            !quantity || !mealType || !serving || !date
        ) {
            return res.status(400).json({ error: 'Missing required meal entry fields' });
        }

        await pool.query(
            `INSERT INTO meal_entries 
       (user_id, food_item_id, food_name, calories, protein, carbs, fat, quantity, meal_type, serving, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                req.user!.id,
                foodItemId || null,
                foodName,
                calories,
                protein,
                carbs,
                fat,
                quantity,
                mealType,
                serving,
                date,
            ]
        );

        res.status(201).json({ message: 'Meal entry added successfully' });
    } catch (error) {
        console.error('Add meal error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Track Progress Over Time
router.get('/meals/progress', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end date are required' });
        }

        const progress = await pool.query(
            `SELECT 
            date,
            COALESCE(SUM(calories), 0) AS total_calories,
            COALESCE(SUM(protein), 0) AS total_protein,
            COALESCE(SUM(carbs), 0) AS total_carbs,
            COALESCE(SUM(fat), 0) AS total_fat
            FROM meal_entries
            WHERE user_id = $1 AND date BETWEEN $2 AND $3
            GROUP BY date
            ORDER BY date ASC`,
            [req.user!.id, start, end]
        );

        res.json(progress.rows);
    } catch (error) {
        console.error('Progress fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete meal entry
router.delete('/meals/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM meal_entries WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user!.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meal entry not found' });
        }

        res.json({ message: 'Meal entry deleted successfully' });
    } catch (error) {
        console.error('Delete meal entry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get daily summary
router.get('/summary/:date', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { date } = req.params;

        const meals = await pool.query(
            'SELECT * FROM meal_entries WHERE user_id = $1 AND date = $2',
            [req.user!.id, date]
        );

        // Calculate totals
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        const mealsByType = {
            breakfast: [] as any[],
            lunch: [] as any[],
            dinner: [] as any[],
            snacks: [] as any[]
        };

        meals.rows.forEach((meal) => {
            const multiplier = parseFloat(meal.quantity);
            totalCalories += parseFloat(meal.calories) * multiplier;
            totalProtein += parseFloat(meal.protein) * multiplier;
            totalCarbs += parseFloat(meal.carbs) * multiplier;
            totalFat += parseFloat(meal.fat) * multiplier;

            mealsByType[meal.meal_type as keyof typeof mealsByType].push({
                id: meal.id,
                foodItemId: meal.food_item_id,
                foodName: meal.food_name,
                calories: parseFloat(meal.calories),
                protein: parseFloat(meal.protein),
                carbs: parseFloat(meal.carbs),
                fat: parseFloat(meal.fat),
                quantity: parseFloat(meal.quantity),
                mealType: meal.meal_type,
                serving: meal.serving,
                date: meal.date
            });
        });

        res.json({
            date,
            totalCalories: Math.round(totalCalories),
            totalProtein: Math.round(totalProtein),
            totalCarbs: Math.round(totalCarbs),
            totalFat: Math.round(totalFat),
            meals: mealsByType
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
