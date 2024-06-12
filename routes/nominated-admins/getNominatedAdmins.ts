import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { NominatedAdminInterface } from './types'
import { IdParamInterface } from '../../globalTypes/index';

const SQL_GET_NOMINATED_MEMBERS = sql<{ group_id: number}, NominatedAdminInterface>(`
  get_nominated_admins(:group_id) 
`);

export default (router: Router) => {
  router.get<IdParamInterface, NominatedAdminInterface[], Record<string,never>, Record<string,never>>(
    '/:id/',
    authMiddleware(),
    async (req, res) => {
      const group_id = parseInt(req.params.id);
      const groups = await SQL_GET_NOMINATED_MEMBERS({ group_id }).many();
      return res.json(groups);
    }
  );
};