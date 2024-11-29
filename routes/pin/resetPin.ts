import Router from '../../router';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { validateStepToken } from '../../middleware/resetTokenMIddleware';
import { HttpError } from '../../middleware/errorMiddleware';
import { z } from 'zod';

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
    schema: {
      body: z.object({ new_pin: z.string() })
    },
    response: {
      statusCode: 204
    },
    middlewares: [validateStepToken],
    handler: async (req, res) => {
      const step = req.user!.step;
      if (step !== 3) {
        throw new HttpError(422);
      }

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