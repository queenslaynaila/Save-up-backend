import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserSchema } from '../../routes/users/index';

const VALID_OPERATORS = ['upgrade', 'downgrade'];

const SQL_UPDATE_ROLE = sql<{ action : string; userId: string, roleToUpdate: string }, UserSchema>(`
  UPDATE users 
  SET role = :roleToUpdate 
  WHERE id = :userId
`);

export default (router: Router) => {
  router.patch('/:action', async (req, res) => {
    const { action } = req.params;
    const { userId } = req.body;

    if (!VALID_OPERATORS.includes(action )) {
      throw new HttpError(400, 'Action is either upgrade or downgrade');
    }

    const roleToUpdate = (action  === 'upgrade') ? 'admin' : 'user';
    const result = await SQL_UPDATE_ROLE({action ,userId,roleToUpdate}).one();
    res.json(result);
  });
};
