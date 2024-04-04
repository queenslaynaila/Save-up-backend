import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { sql } from '../../db';
import { GetGroupGoalsInterface, GetGroupGoalsResponse ,GetGroupGoalsResponseInterface } from '../../types';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_GET_GROUP_GOALS = sql<GetGroupGoalsInterface, GetGroupGoalsResponseInterface>(`
  SELECT *
  FROM savings
  WHERE owner_id = :group_id AND owner_type = 'Group'
`);

export default (router: Router) => {
  router.get<Record<string, never>, GetGroupGoalsResponseInterface[], Record<string, never>, Record<string, never>>(
    '/group-goals',
    authMiddleware(),
    validateRequest(GetGroupGoalsResponse),
    async (req, res) => {
      const { group_id } = req.query;
      const groupGoals = await SQL_GET_GROUP_GOALS({ group_id }).many();
      return res.json(groupGoals);
    });
};
