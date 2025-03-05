import Router from '../../router';
import { sql } from '../../db';
import { NextOfKin } from './createNextOfKin';
import { z } from 'zod';
import { nextOfKinSchema } from './schema';
import { verifyPin } from '../../utils';

const nextOfKinUpdatePayload = nextOfKinSchema.pick({
  full_name: true,
  relationship: true,
  phone_number: true
}).partial();

const nextOfKinUpdateSchema = nextOfKinUpdatePayload.extend({
  xid: nextOfKinSchema.shape.xid,
  user_id: nextOfKinSchema.shape.user_id
});
type NextOfKinUpdate = z.infer<typeof nextOfKinUpdateSchema>;

const SQL_UPDATE_KIN = sql<
NextOfKinUpdate,
Pick<NextOfKin, 'full_name' | 'relationship' | 'phone_number'
>>(`
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
    summary: 'Update a next of kin details',
    request: {
      params: z.object({ xid: z.string() }),
      body: nextOfKinUpdatePayload.extend({
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    response: {
      200: {
        schema: nextOfKinUpdatePayload.required()
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const { full_name, relationship, phone_number } = req.body;
      const kin = await SQL_UPDATE_KIN({
        user_id: req.user!.id,
        xid: Number(req.params.xid),
        full_name,
        relationship,
        phone_number
      }).one();
      return res.json(kin);
    }
  });
};

export default updateNextOfKin;