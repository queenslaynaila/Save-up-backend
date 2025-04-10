import Router from '../../router';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { z } from 'zod';
import { checkResetTokenValidity } from '../../utils';

const SQL_RESET_PASSWORD = sql<{
  id: number;
  pin: string;
}, Record<string, never>>(`
  UPDATE users 
  SET pin = :pin  
  WHERE id = :id
`);

const resetPin = (router: Router) => {
  router.patch({
    path: '/reset-pin',
    summary: 'Reset pin',
    schema: {
      body: z.object({
        new_pin: z.string().regex(/^\d{4}$/)
      })
    },
    middlewares: [checkResetTokenValidity(3)],
    handler: async (req, res) => {
      const newPin = req.body.new_pin;
      const hashPassword = bcrypt.hashSync(newPin, 10);

      await SQL_RESET_PASSWORD({
        id: req.user!.id,
        pin: hashPassword
      }).exec();

      res.sendStatus(204);
    }
  });
};

export default resetPin;