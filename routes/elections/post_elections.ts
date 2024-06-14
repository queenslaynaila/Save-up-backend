import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {  StatusCodeInterface } from '../../globalTypes/index';
import {z} from 'zod'

const group = z.object({
  group_id:z.number(),
  started_by:z.number()
})

type GroupInterface = z.infer<typeof group>

const SQL_NOMINATE_GROUP_ADMIN = sql<GroupInterface, Record<string,never>>(`
  SELECT start_election(:group_id, :started_by)
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, GroupInterface, Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    async (req, res) => {
      const started_by = req.user!.id
      await SQL_NOMINATE_GROUP_ADMIN({ ...req.body, started_by}).exec();
      res.sendStatus(201);
    }
  );
};