import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { verifyPin } from '../../utils';

const SQL_UPDATE_PIN = sql<{pin: string; id: number;}, Record<string, never>>(`
  UPDATE users 
  SET pin = :pin 
  WHERE id = :id
`);

const updateUserPin = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/me/pin',
    summary: 'Update pin',
    request: {
      body: z.object({
        pin: z.string().regex(/^\d{4}$/),
        new_pin: z.string().regex(/^\d{4}$/)
      })
    },
    response: {
      204: {
        schema: undefined
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const userId = req.user!.id;
      const hashedNewPin = bcrypt.hashSync(req.body.new_pin, 10);
      
      await SQL_UPDATE_PIN({
        id: userId,
        pin: hashedNewPin
      }).exec();
      
      res.sendStatus(204);
    }
  });
};

export default updateUserPin;