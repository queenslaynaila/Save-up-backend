import { Router  } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { validateStepToken } from '../../middleware/resetTokenMIddleware'
import { StatusCodeInterface } from '../../globalTypes/index';
import { ResetPasswordInterface, ResetPasswordRequestInterface } from './types';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_RESET_PASSWORD = sql<ResetPasswordRequestInterface, Record<string,never>>(`
  UPDATE users 
  SET pin = :pin  
  WHERE  user_id = :id;
`);

export default (router: Router) => {
  router.patch<string, Record<string,never>, StatusCodeInterface, ResetPasswordInterface, 
  Record<string,never>>(
    '/reset',
    validateStepToken,
    async (req, res) => {
      const step = req.user!.step;
      if (step !== 3) {
        throw new HttpError(422, 'ERR_STEP_SKIPPED');
      }

      const { new_pin } = req.body;
      const user_id = req.user!.id;

      const hashPassword = bcrypt.hashSync(new_pin, 10);
      await SQL_RESET_PASSWORD({ id: user_id, pin: hashPassword }).exec();
      res.sendStatus(204);
    });
};