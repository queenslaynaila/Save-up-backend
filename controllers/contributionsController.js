const pool = require('../db')


const updateUserTotalContributionsAmount = async (userId, newContributionAmount) => {
    try {
        const query = `
            UPDATE users
            SET total_contributions_amount = total_contributions_amount + $1
            WHERE id = $2
            RETURNING *`;
        await pool.query(query, [newContributionAmount, userId]);
    } catch (error) {
        throw new Error('Failed to update total contributions amount for the user');
    }
};
const createContributions = async (req, res) => {
    try {
        await pool.query('BEGIN');

        const { saving_id, amount, date } = req.body;
        const contributionQuery = 'INSERT INTO contributions (saving_id, amount, date) VALUES ($1, $2, $3) RETURNING *';
        const contributionValues = [saving_id, amount, date];
        const contributionResult = await pool.query(contributionQuery, contributionValues);

        const getUserQuery = 'SELECT user_id FROM savings WHERE id = $1';
        const getUserResult = await pool.query(getUserQuery, [saving_id]);
        const user_id = getUserResult.rows[0].user_id;

        await updateUserTotalContributionsAmount(user_id, amount);

        await pool.query('COMMIT');
        
        return res.status(201).json(contributionResult.rows[0]);
    } catch (error) {
        await pool.query('ROLLBACK');
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

const getContributionsById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM contributions WHERE id = $1';
        const result = await pool.query(query, [id]);
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateContributions = async (req, res) => {
    const { id } = req.params;
    try {
        const { amount, date } = req.body;
        const query = 'UPDATE contributions SET amount = $1, date = $2 WHERE id = $3 RETURNING *';
        const values = [ amount, date, id];
        const result = await pool.query(query, values);
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteContributions = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM contributions WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Contributions not found' });
        }
        return res.status(204).json({ message: 'Contributions deleted' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getContributionsBySaving = async (req, res) => {
    const { saving_id } = req.params;
    try {
        const query = 'SELECT * FROM contributions WHERE saving_id = $1';
        const result = await pool.query(query, [saving_id]);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createContributions,
    getAllContributions,
    getContributionsById,
    updateContributions,
    deleteContributions,
    getContributionsBySaving
};
