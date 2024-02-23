import { Router } from 'express';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', async (_, res) => {
    const query = 'SELECT * FROM security_questions LIMIT 10';
    const result = await pool.query(query);
    const questions = result.rows || [];
    res.json(questions);
  });
};
