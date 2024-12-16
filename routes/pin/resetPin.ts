import Router from '../../router';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { z } from 'zod';
import { authenticateResetToken, checkResetStepProgression } from '../../authorization';

const SQL_RESET_PASSWORD = sql<{id: number; pin: string}, Record<string, never>>(`
  UPDATE users 
  SET pin = :pin  
  WHERE  id = :id;
`);

const resetPin = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/reset',
    summary: 'Reset pin',
    request: {
      body: z.object({
        new_pin: z.string().regex(/^\d{4}$/)
      })
    },
    middlewares: [authenticateResetToken, checkResetStepProgression(3)],
    handler: async (req, res) => {
      const { new_pin } = req.body;
      const user_id = req.user!.id;

      const hashPassword = bcrypt.hashSync(new_pin, 10);
      await SQL_RESET_PASSWORD({
        id: user_id,
        pin: hashPassword
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default resetPin;