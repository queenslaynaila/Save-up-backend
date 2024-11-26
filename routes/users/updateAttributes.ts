import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { userIdHistorySchema, userPhoneHistorySchema } from './schema';
import Router from '../../router';

const updateIdNoSchema = userIdHistorySchema.pick({
  id_type: true,
  id_number: true
});

const updatePhoneNoSchema = userPhoneHistorySchema.pick({
  phone_number: true
}).extend({
  pin: z.string()
});

const updateUserDetailsSchema = z.union([updateIdNoSchema, updatePhoneNoSchema]);

const SQL_GET_USER_PIN = sql<{ id: number }, { pin: string }>(`
  SELECT pin FROM users WHERE id = :id
`);

const SQL_UPDATE_PHONE = sql<{ phone_number: string; user_id: number }, { updated_phone_number: string }>(`
  SELECT * FROM update_phone_number(:user_id, :phone_number)
`);

const SQL_UPDATE_ID_NUMBER = sql<{ user_id: number; id_type: string; id_number: string }, { new_id_number: string }>(`
  SELECT * FROM update_id_number(:user_id, :id_type, :id_number)
`);

const updateUserAttributes = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:user_id',
    summary: 'Update a user\'s ID number or phone number',
    description: ' This endpoint allows a user to update either their ID number or phone number.\n'
    + '- **ID number update**: If updating the ID number, the user needs to provide both the type of ID (e.g., "passport", "national ID") and the new ID number.\n'
    + '- **Phone number update**: If updating the phone number, the user needs to provide the new phone number along with a PIN for verification purposes. The PIN is compared with the stored PIN in the database to authenticate the request\n',
    schema: {
      params: z.object({
        user_id: z.string()
      }),
      body: updateUserDetailsSchema
    },
    response: {
      schema: z.object({
        updated_attribute: z.string()
      })
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const userId = req.params.user_id;
      const id = userId === 'me' ? req.user!.id : parseInt(userId, 10);

      if (Number.isNaN(id)) {
        throw new HttpError(400);
      }

      if ('id_type' in req.body && 'id_number' in req.body) {
        const { id_type, id_number } = req.body;
        const { new_id_number } = await SQL_UPDATE_ID_NUMBER({
          user_id: id,
          id_type,
          id_number
        }).one();
        return res.json({ updated_attribute: new_id_number });
      }

      if ('phone_number' in req.body && 'pin' in req.body) {
        const { phone_number, pin } = req.body;
        const userPassword = await SQL_GET_USER_PIN({
          id
        }).one();
        if (!await bcrypt.compare(pin, userPassword.pin)) {
          throw new HttpError(401);
        }
        const { updated_phone_number } = await SQL_UPDATE_PHONE({
          phone_number,
          user_id: id
        }).one();
        return res.json({ updated_attribute: updated_phone_number });
      }

      throw new HttpError(400);
    }
  });
};

export default updateUserAttributes;