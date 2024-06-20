import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import {  StatusCodeInterface } from '../../globalTypes/index';
import { BallotBodyInterface, BallotInterface, ballotBodySchema } from './types';

const SQL_CREATE_BALLOT = sql<BallotInterface , Record<string,never>>(`
  SELECT create_ballot(:group_id, :election_id, :candidate_id, :user_id)
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, BallotBodyInterface, Record<string,never>, Record<string,never>>(
    '/',
    validateRequest(ballotBodySchema),
    authMiddleware(),
    async (req, res) => {
      await SQL_CREATE_BALLOT({ ...req.body, user_id: req.user!.id}).exec();
      res.sendStatus(201);
    }
  );
};