import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { NextOfKin } from './createNextOfKin';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { baseNextOfKinSchema } from './schema';

const nextOfKinSchema = baseNextOfKinSchema.pick({
  xid: true,
  user_id: true,
  full_name: true,
  relationship: true,
  phone_number: true
}).partial();
type NextOfKinUpdate = z.infer<typeof nextOfKinSchema>;

const nextOfKin = baseNextOfKinSchema.pick({
  full_name: true,
  relationship: true,
  phone_number: true
}).partial();

const SQL_UPDATE_KIN = sql<NextOfKinUpdate, NextOfKin>(`
    UPDATE next_of_kins
    SET full_name = COALESCE(:full_name, full_name),
        relationship = COALESCE(:relationship, relationship),
        phone_number = COALESCE(:phone_number, phone_number)
    WHERE xid = :xid
    AND user_id = :user_id
    AND deleted_at IS NULL
    RETURNING full_name, relationship, phone_number
`);

const updateNextOfKin = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:xid',
    summary: 'Update details of next of kin',
    schema: {
      params: z.object({ xid: z.string() }),
      body: nextOfKin
    },
    response: {
      schema: nextOfKinSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const { full_name, relationship, phone_number } = req.body;
      const kin = await SQL_UPDATE_KIN({
        user_id: req.user!.id,
        xid: Number(req.params.xid),
        full_name,
        relationship,
        phone_number
      }).one(new HttpError(404));
      return res.json(kin);
    }
  });
};

export default updateNextOfKin;