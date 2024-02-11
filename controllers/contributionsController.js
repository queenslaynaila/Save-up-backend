const pool = require('../db')
const createContributions = async (req, res) => {
    try {
        const { saving_id, amount, date } = req.body;
        // Insert contribution 
        const contributionQuery = 'INSERT INTO contributions (saving_id, amount, date) VALUES ($1, $2, $3) RETURNING *';
        const contributionValues = [saving_id, amount, date];
        const contributionResult = await pool.query(contributionQuery, contributionValues);

        // Update the contributed_amount in the coresponding savings table
        const updateQuery = 'UPDATE savings SET contributed_amount = contributed_amount + $1 WHERE id = $2';
        const updateValues = [amount, saving_id];
        await pool.query(updateQuery, updateValues);

        return res.status(201).json(contributionResult.rows[0]);
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
        return res.status(200).json(result);
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
