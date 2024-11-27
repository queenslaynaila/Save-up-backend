import Router from '../../router';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { z } from 'zod';

const pinUpdateSchema = z.object({
  old_pin: z.string(),
  new_pin: z.string()
});

const SQL_GET_PASSWORD_BY_ID = sql<{id:number}, {pin:string} >(`
  SELECT pin FROM users 
  WHERE id = :id
`);

const SQL_UPDATE_PASSWORD = sql<{pin:string, id:number}, Record<string, never>>(`
  UPDATE users 
  SET pin = :pin 
  WHERE id = :id
`);

const updatePin = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/me/pin',
    summary: 'Update user pin',
    schema: {
      body: pinUpdateSchema
    },
    response: {
      statusCode: 204
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const userId = req.user!.id;
      const { pin: hashedPassword } = await SQL_GET_PASSWORD_BY_ID({
        id: userId
      }).one();
      const { old_pin, new_pin } = req.body;

      const isPasswordCorrect = await bcrypt.compare(old_pin, hashedPassword);
      if (!isPasswordCorrect) {
        throw new HttpError(400);
      }

      const hashedNewPassword = bcrypt.hashSync(new_pin, 10);
      await SQL_UPDATE_PASSWORD({
        id: userId,
        pin: hashedNewPassword
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default updatePin;