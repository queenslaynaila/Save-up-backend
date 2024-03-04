import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserSchema } from '../../routes/users/index';

const VALID_ROLES = ['Moderator', 'User'];

const SQL_GET_USERS_BY_ROLE = sql<{ role: string }, UserSchema[]>(`
  SELECT * 
  FROM users 
  WHERE role = :role
`);

export default (router: Router) => {
  router.get('/usersByRole/:role', async (req, res) => {
    let { role } = req.params;
    role = role.toLowerCase();

    if (!VALID_ROLES.includes(role)) {
      throw new HttpError(400, 'Invalid role. Role must be either "Moderator" or "User".');
    }

    const users = await SQL_GET_USERS_BY_ROLE({ role }).many();
    res.json(users);
  });
};
