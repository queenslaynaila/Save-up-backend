
const pool = require('../db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};
const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone_no , password} = req.body;
    const password_hash = bcrypt.hashSync(password, 10);
    const userQuery = `
      INSERT INTO users (first_name, last_name, email, phone_no, password_hash, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *`;
    const userValues = [first_name, last_name, email, phone_no, password_hash];
    const userResult = await pool.query(userQuery, userValues);
    const user = userResult.rows[0];
    const token = generateToken(user.id);
    user.token = token;
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password, phone_no } = req.body;
    const query = email ? 'SELECT * FROM users WHERE email = $1' : 'SELECT * FROM users WHERE phone_no = $1';
    const params = [email || phone_no];
    const result = await pool.query(query, params);
    const user = result.rows[0];
   if (user && (await bcrypt.compare(password, user.password_hash))) {
        const token = generateToken(user.id);
        user.token = token;
        res.json(user);
    } 
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

  

const signout = async (req, res) => {
    const { user, cookies: { auth_token: authToken } } = req
    if (user && authToken) {
        await req.user.logout(authToken);
        return res.status(204).send()
      } 
      return res.status(400).send(
        { errors: [{ message: 'log in' }] }
      );

};

const getAllUsers = async (req, res) => {
    try {
      const query = 'SELECT * FROM users';
      const result = await pool.query(query);
      const users = result.rows;
      return res.status(200).json(users);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: error.message });
    }
  };

  
const getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      const user = result.rows[0];
      if (user) {
        return res.status(200).json(user);
      }
      return res.status(404).json({ error: 'User with the specified ID does not exist' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};
  
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone_no } = req.body;
    const query = 'UPDATE users SET first_name = $1, last_name = $2, email = $3, phone_no = $4 WHERE id = $5 RETURNING *';
    const result = await pool.query(query, [first_name, last_name, email, phone_no, id]);
    const updatedUser = result.rows[0];
      return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


  const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      if (result.rowCount > 0) {
        return res.status(204).json({ message: 'User deleted' });
      }
      throw new Error('User not found');
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    login,
    signout
};
