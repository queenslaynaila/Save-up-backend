import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { UserId } from './schema';

const updateIdSchema = z.object({
  id_type: z.string(),
  new_id_number: z.string()
});

const updatePhoneSchema = z.object({
  new_phone_number: z.string(),
  pin: z.string()
});

const updateDetailsSchema = z.union([updateIdSchema, updatePhoneSchema]);

type UpdateDetailsType = z.infer<typeof updateDetailsSchema>;

const SQL_GET_USER_PIN = sql<{ id: number }, { pin: string }>(`
  SELECT pin FROM users WHERE id = :id
`);

const SQL_UPDATE_PHONE = sql<{ phone_number: string; id: number }, { updated_phone_number: string }>(`
  SELECT update_phone_number(:id, :phone_number)
`);

const SQL_UPDATE_ID_NUMBER = sql<{ id: number; id_type: string; id_number: string }, { updated_id: string }>(`
  SELECT * FROM update_id_number(:id, :id_type, :id_number)
`);

export default (router: Router) => {
  router.patch<UserId, { updated_attribute: string }, UpdateDetailsType, Record<string, never>>(
    '/:user_id',
    authMiddleware(),
    validateRequest({ body: updateDetailsSchema }),
    async (req, res) => {
      const userIdParam = req.params.user_id;
      const id = userIdParam === 'me' ? req.user!.id : Number(userIdParam);

      if ('new_id_number' in req.body && 'id_type' in req.body) {
        const { id_type, new_id_number } = req.body;
        const { updated_id } = await SQL_UPDATE_ID_NUMBER({
          id,
          id_type,
          id_number: new_id_number
        }).one();
        return res.json({ updated_attribute: updated_id });
      }

      if ('new_phone_number' in req.body && 'pin' in req.body) {
        const { new_phone_number, pin } = req.body;
        const userPassword = await SQL_GET_USER_PIN({ id }).one(new HttpError(400));
        if (!await bcrypt.compare(pin, userPassword.pin)) {
          throw new HttpError(401);
        }
        const { updated_phone_number } = await SQL_UPDATE_PHONE({
          phone_number: new_phone_number,
          id
        }).one();
        return res.json({ updated_attribute: updated_phone_number });
      }

      throw new HttpError(400);
    }
  );
};