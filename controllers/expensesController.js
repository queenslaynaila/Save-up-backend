const pool = require('../db')
const createExpense = async (req, res) => {
    try {
        const { category, amount, date,user_id } = req.body;
        const query = 'INSERT INTO expenses (category, amount, date,user_id) VALUES ($1, $2, $3,$4) RETURNING *';
        const values = [category, amount, date,user_id];
        const result = await pool.query(query, values);
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllExpenses = async (req, res) => {
    try {
        const query = 'SELECT * FROM expenses';
        const result = await pool.query(query);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getExpenseById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM expenses WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateExpense = async (req, res) => {
    const { id } = req.params;
    try {
        const { category, amount, date } = req.body;
        const query = 'UPDATE expenses SET category = $1, amount = $2, date = $3 WHERE id = $4 RETURNING *';
        const values = [category, amount, date, id];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM expenses WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        return res.status(204).json({ message: 'Expense deleted' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const getExpenseByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const query = `
            SELECT * FROM expenses
            WHERE category = $1
        `;
        const result = await pool.query(query, [category]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = {
    createExpense,
    getAllExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseByCategory
};
