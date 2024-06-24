import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import {  StatusCodeInterface } from '../../globalTypes/index';
import {  BallotComputeInterface, BallotBodyRequestInterface, ballotBodyRequest } from './types';

const SQL_CREATE_BALLOT = sql<BallotComputeInterface , Record<string,never>>(`
  SELECT compute_ballot_results(:group_id, :election_id)
`);

export default (router: Router) => {
  router.post<{ id: string }, StatusCodeInterface, BallotBodyRequestInterface, Record<string,never>, Record<string,never>>(
    '/:id',
    validateRequest(ballotBodyRequest),
    authMiddleware(),
    async (req, res) => {
      await SQL_CREATE_BALLOT({ ...req.body, group_id: parseInt(req.params.id)}).exec();
      res.sendStatus(201);
    }
  );
};