import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {  StatusCodeInterface } from '../../globalTypes/index';
import {z} from 'zod'

const group = z.object({
  group_id:z.number(),
  initiator_id:z.number()
})

type GroupInterface = z.infer<typeof group>

const SQL_NOMINATE_GROUP_ADMIN = sql<GroupInterface, Record<string,never>>(`
  INSERT INTO elections (group_id, xid, initiator_id )
  SELECT 
      :group_id,
      COALESCE(MAX(xid), 0) + 1,
      :initiator_id
  FROM elections
  WHERE group_id = :group_id;
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, GroupInterface, Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    async (req, res) => {
      const initiator_id= req.user!.id
      await SQL_NOMINATE_GROUP_ADMIN({ ...req.body, initiator_id}).exec();
      res.sendStatus(201);
    }
  );
};