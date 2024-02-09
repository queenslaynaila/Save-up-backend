const { pool } = require('../db'); 



const createContribution = async (req, res) => {
    try {
        const {  saving_id, amount, date} = req.body;
        const query = 'INSERT INTO contributions (saving_id,amount, date) VALUES ($1, $2, $) RETURNING *';
        const values = [saving_id, amount, date];
        const result = await pool.query(query, values);
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllContributions = async (req, res) => {
    try {
        const query = 'SELECT * FROM contributions';
        const result = await pool.query(query);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getContributionById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM contributions WHERE id = $1';
        const values = [id];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contribution not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateContribution = async (req, res) => {
    const { id } = req.params;
    const { amount, date } = req.body;
    try {
        const query = `
            UPDATE contributions
            SET amount = $1, date = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *`;
        const values = [amount, date, id];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contribution not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteContribution = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM contributions WHERE id = $1';
        const values = [id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Contribution not found' });
        }
        return res.status(204).json({ message: 'Contribution deleted' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createContribution,
    getAllContributions,
    getContributionById,
    updateContribution,
    deleteContribution
};
