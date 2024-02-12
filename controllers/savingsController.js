const pool = require('../db');

const updateUserTotalTargetedAmount = async (userId, newSavingTargetAmount) => {
    try {
        const query = `
            UPDATE users
            SET total_targeted_amount = total_targeted_amount + $1
            WHERE id = $2
            RETURNING *`;
        const result = await pool.query(query, [newSavingTargetAmount, userId]);
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to update total targeted amount for the user');
    }
};

// const updateUserTotalContributionsAmount = async (userId, newContributionAmount) => {
//     try {
//         const query = `
//             UPDATE users
//             SET total_contributions_amount = total_contributions_amount + $1
//             WHERE id = $2
//             RETURNING *`;
//         const result = await pool.query(query, [newContributionAmount, userId]);
//         return result.rows[0];
//     } catch (error) {
//         throw new Error('Failed to update total contributions amount for the user');
//     }
// };

const createSaving = async (req, res) => {
    try {
        const { user_id, description, category, target_amount, priority, target_date} = req.body;
        const query = `
            INSERT INTO savings (user_id, description, category, target_amount, priority,  target_date) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;
        const values = [user_id, description, category, target_amount, priority, target_date];
        const result = await pool.query(query, values);
        await updateUserTotalTargetedAmount(user_id, target_amount);
        return res.status(201).json(result.rows[0]);
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
// const createSaving = async (req, res) => {
//     try {
//         await pool.query('BEGIN');

//         const { user_id, description, category, target_amount, priority, target_date } = req.body;
//         const savingQuery = `
//             INSERT INTO savings (user_id, description, category, target_amount, priority, target_date) 
//             VALUES ($1, $2, $3, $4, $5, $6) 
//             RETURNING *`;
//         const savingValues = [user_id, description, category, target_amount, priority, target_date];
//         const savingResult = await pool.query(savingQuery, savingValues);

//         // Update total targeted amount for the user
//         await updateUserTotalTargetedAmount(client, user_id, target_amount);

//         await pool.query('COMMIT');

//         return res.status(201).json(savingResult.rows[0]);
//     } catch (error) {
//         await pool.query('ROLLBACK');
//         return res.status(500).json({ error: error.message });
//     } finally {
//         pool.release();
//     }
// };


const getAllSavings = async (req, res) => {
    try {
        const query = 'SELECT * FROM savings';
        const result = await pool.query(query);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getSavingById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM savings WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Saving not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateSaving = async (req, res) => {
    const { id } = req.params;
    try {
        const {  description, category, target_amount, contributed_amount, priority, status, target_date, start_date } = req.body;
        const query = `
                        UPDATE savings 
                        SET 
                            user_id = $1,
                            description = $2,
                            category = $3,
                            target_amount = $4,
                            contributedAmount = $5,
                            priority = $6,
                            status = $7,
                            target_date = $8,
                            start_date = $9 
                        WHERE 
                            id = $10 
                        RETURNING *`;
        const values = [id, description, category, target_amount, contributed_amount, priority, status, target_date, start_date];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Saving not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteSaving = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM savings WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Saving not found' });
        }
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getSavingsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const query = `
            SELECT * FROM savings
            WHERE category = $1
        `;
        const result = await pool.query(query, [category]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getSavingsByStatus = async (req, res) => {
    const { status } = req.params;
    try {
        const query = `
            SELECT * FROM savings
            WHERE status = $1
        `;
        const result = await pool.query(query, [status]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getSavingsByPriority = async (req, res) => {
    const { priority } = req.params;
    try {
        const query = `
            SELECT * FROM savings
            WHERE priority = $1
        `;
        const result = await pool.query(query, [priority]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserSavings = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM savings WHERE user_id = $1';
        const { rows } = await pool.query(query, [id]);
        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createSaving,
    getAllSavings,
    getSavingById,
    updateSaving,
    deleteSaving,
    getSavingsByCategory,
    getSavingsByPriority,
    getSavingsByStatus,
    getUserSavings,
};
