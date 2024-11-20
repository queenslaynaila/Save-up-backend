import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { NextOfKin, nextOfKinSchema } from './createNextOfKin';

const SQL_GET_KIN = sql<{user_id:number}, NextOfKin>(`
  SELECT xid, full_name, relationship, phone_number, created_at
  FROM next_of_kins 
  WHERE user_id = :user_id
  AND deleted_at is null
`);

const getNextOfKin = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get next of kin',
    security: [{ 'authorization-token': [] }],
    response: {
      schema: nextOfKinSchema.partial()
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const nextOfKin = await SQL_GET_KIN({
        user_id: req.user!.id
      }).oneOrNull();
      if (nextOfKin === undefined) {
        return res.json(null);
      }
      return res.json(nextOfKin);
    }
  });
};

export default getNextOfKin;