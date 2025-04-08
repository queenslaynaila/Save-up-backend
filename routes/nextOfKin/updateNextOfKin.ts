import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { NextOfKin, nextOfKinSchema } from './schema';
import { verifyPin } from '../../utils';

const SQL_UPDATE_KIN = sql<
  Partial<Pick<NextOfKin, 'full_name' | 'relationship' | 'phone_number'>> &
  Pick<NextOfKin, 'user_id' | 'xid'>,
  Pick<NextOfKin, 'full_name' | 'relationship' | 'phone_number'>
>(`
  UPDATE next_of_kins
  SET full_name = COALESCE(:full_name, full_name),
      relationship = COALESCE(:relationship, relationship),
      phone_number = COALESCE(:phone_number, phone_number)
  WHERE xid = :xid
    AND user_id = :user_id
    AND deleted_at IS NULL
  RETURNING 
    full_name, 
    relationship, 
    phone_number;
`);

const updateNextOfKin = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/users/me/next-of-kins/:xid',
    auth: true,
    summary: 'Update a next of kin details',
    schema: {
      params: z.object({
        xid: z.number().int().min(1)
      }),
      body: nextOfKinSchema.pick({
        full_name: true,
        relationship: true,
        phone_number: true
      }).partial().extend({
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    response: {
        schema: nextOfKinSchema.pick({
          full_name: true,
          relationship: true,
          phone_number: true
        }).partial().required()
    },
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const { full_name, relationship, phone_number } = req.body;

      const kin = await SQL_UPDATE_KIN({
        user_id: req.user!.id,
        xid: req.params.xid,
        full_name,
        relationship,
        phone_number
      }).one();

      return res.json(kin);
    }
  });
};

export default updateNextOfKin;