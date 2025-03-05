import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { UserRole, userIdHistorySchema, userPhoneHistorySchema, userSchema } from './schema';
import Router from '../../router';

const convertToTitleCase = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

export const SQL_GET_USER_PIN = sql<{ id: number }, { pin: string }>(`
  SELECT pin FROM users WHERE id = :id
`);

const SQL_UPDATE_PHONE = sql<{ phone_number: string; user_id: number }, { updated_phone_number: string }>(`
  SELECT * FROM update_phone_number(:user_id, :phone_number)
`);

const SQL_UPDATE_ID_NUMBER = sql<{ user_id: number; id_type: string; id_number: string }, { new_id_number: string }>(`
  SELECT * FROM update_id_number(:user_id, :id_type, :id_number)
`);

const SQL_UPDATE_PIN = sql<{ pin: string; id: number }, Record<string, never>>(`
  UPDATE users 
  SET pin = :pin 
  WHERE id = :id
`);

const SQL_UPDATE_ROLE = sql<{ targetUserId: number; role: string; adminId: number }, { updatedRole: string }>(`
  UPDATE users 
  SET role = :role
  WHERE id = :targetUserId
  RETURNING role
`);

const updateIdNoSchema = userIdHistorySchema.pick({
  id_type: true,
  id_number: true
});

const updatePhoneNoSchema = userPhoneHistorySchema.pick({
  phone_number: true
}).extend({
  pin: z.string()
});

const updatePinSchema = z.object({
  old_pin: z.string(),
  new_pin: z.string()
});

const updateRoleSchema = userSchema.pick({
  role: true
});

const updateUserDetailsSchema = z.union([
  updateIdNoSchema,
  updatePhoneNoSchema,
  updatePinSchema,
  updateRoleSchema
]);

const updateUserAttributes = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:user_id',
    summary: 'Update user attributes (ID number, phone number, PIN, or role)',
    description: 'This endpoint allows updating various user attributes. The userId in the param can be either the user\'s id or "me" for the logged-in user.\n\n'
      + 'The following updates are supported:\n'
      + '- **ID number update**: Provide the ID type and new ID number.\n'
      + '- **Phone number update**: Provide the new phone number and current PIN for verification.\n'
      + '- **PIN update**: Provide the current PIN and a new PIN for updating.\n'
      + '- **Role update**: Admins can update a user\'s role. The role must be provided in the body.\n\n'
      + 'Requirements:\n'
      + '- For role updates, only admins can perform this action.\n'
      + '- For PIN updates, the logged-in user must submit the old and new PIN.\n'
      + '- For phone number updates, the logged-in user must provide the new phone number and current PIN.\n'
      + '- For ID number updates, the user must choose the type of ID and provide the new ID number.',
    request: {
      params: z.object({
        user_id: z.string()
      }),
      body: updateUserDetailsSchema
    },
    response: {
      200: {
        schema: z.union([
          z.object({ id_number: z.string() }),
          z.object({ phone_number: z.string() }),
          z.object({ role: z.string() })
        ])
      },
      204: {},
      401: {},
      403: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const userIdParam = req.params.user_id;
      const userId = userIdParam === 'me' ? req.user!.id : parseInt(userIdParam, 10);

      if (Number.isNaN(userId)) {
        throw new HttpError(400);
      }

      if ('id_type' in req.body && 'id_number' in req.body) {
        const { id_type, id_number } = req.body;
        const { new_id_number } = await SQL_UPDATE_ID_NUMBER({
          user_id: userId,
          id_type,
          id_number
        }).one();
        return res.json({ id_number: new_id_number });
      }

      if ('phone_number' in req.body && 'pin' in req.body) {
        const { phone_number, pin } = req.body;
        const { pin: currentPin } = await SQL_GET_USER_PIN({ id: userId }).one();
        if (!await bcrypt.compare(pin, currentPin)) {
          throw new HttpError(401);
        }
        const { updated_phone_number: updatedPhone } = await SQL_UPDATE_PHONE({
          phone_number,
          user_id: userId
        }).one();
        return res.json({ phone_number: updatedPhone });
      }

      if ('old_pin' in req.body && 'new_pin' in req.body) {
        const { old_pin: oldPin, new_pin: newPin } = req.body;
        const { pin: currentPin } = await SQL_GET_USER_PIN({ id: userId }).one();

        if (!await bcrypt.compare(oldPin, currentPin)) {
          throw new HttpError(403);
        }

        const hashedNewPin = bcrypt.hashSync(newPin, 10);
        await SQL_UPDATE_PIN({ id: userId, pin: hashedNewPin }).exec();
        return res.sendStatus(204);
      }
      if ('role' in req.body && req.user!.role === UserRole.Enum.Admin) {
        const role = convertToTitleCase(req.body.role);
        const { updatedRole } = await SQL_UPDATE_ROLE({
          targetUserId: userId,
          role,
          adminId: req.user!.id
        }).one().catch(err => {
          if (err.code === 'P0002') {
            throw new HttpError(403);
          }
          if (err.code === 'P0003') {
            throw new HttpError(400, { message: 'INVALID_USER' });
          }
          throw err;
        });
        res.json({ role: updatedRole });
      }

      throw new HttpError(400);
    }
  });
};

export default updateUserAttributes;