import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {  StatusCodeInterface } from '../../globalTypes/index';
import { ProposeAdminInterface } from './types'

const SQL_NOMINATE_GROUP_ADMIN = sql<ProposeAdminInterface, Record<string,never>>(`
  INSERT INTO nominated_administrators (group_id, nominee_id, nominator_id, election_id)
  VALUES (:group_id, :nominee_id, :nominator_id, :election_id);
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, ProposeAdminInterface, Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    async (req, res) => {
      await SQL_NOMINATE_GROUP_ADMIN({ ...req.body, nominator_id: req.user!.id}).exec();
      res.sendStatus(201);
    }
  );
};