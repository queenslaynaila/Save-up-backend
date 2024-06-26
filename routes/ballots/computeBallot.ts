import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import {  StatusCodeInterface } from '../../globalTypes/index';
import {  BallotComputeInterface, 
  BallotBodyRequestInterface,
  ballotBodyRequest, 
  BallotResultInterface 
} from './types';

const SQL_CREATE_BALLOT = sql<BallotComputeInterface,  BallotResultInterface>(`
  SELECT compute_ballot_results(:group_id, :election_id, :user_id)
`);

export default (router: Router) => {
  router.post<{ id: string }, StatusCodeInterface, BallotBodyRequestInterface,  BallotResultInterface, Record<string,never>>(
    '/:id',
    validateRequest(ballotBodyRequest),
    authMiddleware(),
    async (req, res) => {
      await SQL_CREATE_BALLOT({ ...req.body, user_id: req.user!.id, group_id: parseInt(req.params.id)}).exec();
      res.sendStatus(201);
    }
  );
};