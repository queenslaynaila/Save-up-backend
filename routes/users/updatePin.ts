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

const SQL_FETCH_PIN_BY_USER_ID = sql<{id:number}, {pin:string} >(`
  SELECT pin FROM users 
  WHERE id = :id
`);

const SQL_UPDATE_PIN = sql<{pin:string, id:number}, Record<string, never>>(`
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
      const { pin: hashedUserPin } = await SQL_FETCH_PIN_BY_USER_ID({
        id: userId
      }).one();
      const { old_pin, new_pin } = req.body;

      const isOldPinValid = await bcrypt.compare(old_pin, hashedUserPin);
      if (!isOldPinValid) {
        throw new HttpError(400);
      }

      const hashedNewPin = bcrypt.hashSync(new_pin, 10);
      await SQL_UPDATE_PIN({
        id: userId,
        pin: hashedNewPin
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default updatePin;