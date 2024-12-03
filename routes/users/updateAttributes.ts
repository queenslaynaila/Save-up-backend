import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { userIdHistorySchema, userPhoneHistorySchema, userSchema } from './schema';
import Router from '../../router';
import { convertToTitleCase } from '../../caseNormalization';
import { UserRole } from '../../types';

const SQL_GET_USER_PIN = sql<{ id: number }, { pin: string }>(`
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

const SQL_UPDATE_ROLE = sql<{ targetUserId: string; role: string; adminId: number }, { updatedRole: string }>(`
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
    schema: {
      params: z.object({
        user_id: z.string()
      }),
      body: updateUserDetailsSchema
    },
    response: {
      schema: z.object({
        updated_attribute: z.string()
      }) || null
    },
    authMiddlewareOptions: {},
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
        const userPassword = await SQL_GET_USER_PIN({ id }).one();

        if (!await bcrypt.compare(pin, userPassword.pin)) {
          throw new HttpError(401);
        }

        const { updated_phone_number } = await SQL_UPDATE_PHONE({
          phone_number,
          user_id: id
        }).one();
        return res.json({ updated_attribute: updated_phone_number });
      }

      if ('old_pin' in req.body && 'new_pin' in req.body) {
        const { pin: hashedUserPin } = await SQL_GET_USER_PIN({ id }).one();
        const { old_pin, new_pin } = req.body;

        const isOldPinValid = await bcrypt.compare(old_pin, hashedUserPin);
        if (!isOldPinValid) {
          throw new HttpError(401);
        }

        const hashedNewPin = bcrypt.hashSync(new_pin, 10);
        await SQL_UPDATE_PIN({ id, pin: hashedNewPin }).exec();
        return res.sendStatus(204);
      }

      if ('role' in req.body && req.user!.role === UserRole.ADMIN) {
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
        res.json({ updated_attribute: updatedRole });
      }

      throw new HttpError(400);
    }
  });
};

export default updateUserAttributes;