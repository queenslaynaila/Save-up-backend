import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { userIdHistorySchema, userPhoneHistorySchema } from './types';
import Router from '../../router';

const updateIdSchema = userIdHistorySchema.pick({
  id_type: true,
  id_number: true
});

const updatePhoneSchema = userPhoneHistorySchema.pick({
  phone_number: true
}).extend({
  pin: z.string()
});

const updateDetailsSchema = z.union([updateIdSchema, updatePhoneSchema]);

const SQL_GET_USER_PIN = sql<{ id: number }, { pin: string }>(`
  SELECT pin FROM users WHERE id = :id
`);

const SQL_UPDATE_PHONE = sql<{ phone_number: string; id: number }, { updated_phone_number: string }>(`
  SELECT * FROM update_phone_number(:id, :phone_number)
`);

const SQL_UPDATE_ID_NUMBER = sql<{ id: number; id_type: string; id_number: string }, { new_id_number: string }>(`
  SELECT * FROM update_id_number(:id, :id_type, :id_number)
`);

const updateId = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:user_id',
    summary: 'Update a user\'s id number or phone number',
    security: [{ 'authorization-token': [] }],
    schema: {
      params: z.object({
        user_id: z.string()
      }),
      body: updateDetailsSchema
    },
    response: {
      schema: z.object({
        updated_attribute: z.string()
      })
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const userIdParam = req.params.user_id;
      const id = userIdParam === 'me' ? req.user!.id : Number(userIdParam);

      if ('id_number' in req.body && 'id_type' in req.body) {
        const { id_type, id_number } = req.body;
        const { new_id_number } = await SQL_UPDATE_ID_NUMBER({
          id,
          id_type,
          id_number: id_number
        }).one();
        return res.json({ updated_attribute: new_id_number });
      }

      if ('phone_number' in req.body && 'pin' in req.body) {
        const { phone_number, pin } = req.body;
        const userPassword = await SQL_GET_USER_PIN({ id }).one(new HttpError(400));
        if (!await bcrypt.compare(pin, userPassword.pin)) {
          throw new HttpError(401);
        }
        const { updated_phone_number } = await SQL_UPDATE_PHONE({
          phone_number: phone_number,
          id
        }).one();
        return res.json({ updated_attribute: updated_phone_number });
      }
      throw new HttpError(400);
    }
  });
};

export default updateId;