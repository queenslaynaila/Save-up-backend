import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { verifyPin } from '../../utils';

const SQL_UPDATE_PIN = sql<{ pin: string; id: number },Record<string, never>>(`
  UPDATE users 
  SET pin = :pin 
  WHERE id = :id
`);

const updateUserPin = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/me/pin',
    summary: 'Update user PIN',
    description: 'Update authenticated user\'s PIN',
    request: {
      body: z.object({
        pin: z.string().regex(/^\d{4}$/),
        new_pin: z.string().regex(/^\d{4}$/)
      })
    },
    auth: true,
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const hashedNewPin = await bcrypt.hash(req.body.new_pin, 10);
      
      await SQL_UPDATE_PIN({
        id: req.user!.id,
        pin: hashedNewPin
      }).exec();
      
      res.sendStatus(204);
    }
  });
};

export default updateUserPin;