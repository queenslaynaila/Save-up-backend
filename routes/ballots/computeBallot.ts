import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import  validateRequest from '../../middleware/validationMiddleware';
import {  
  BallotComputeInterface, 
  BallotBodyRequestInterface,
  ballotBodyRequest, 
  BallotResultInterface 
} from './types';

const SQL_GET_ELECTION_WINNERS = sql<BallotComputeInterface,  BallotResultInterface>(`
  SELECT * FROM compute_ballot_results(:group_id, :election_id, :user_id)
`);

export default (router: Router) => {
  router.get<Record<string,never>, BallotResultInterface[], BallotBodyRequestInterface, 
  Record<string,never>>(
    '/',
    validateRequest({
      body:ballotBodyRequest 
    }),
    authMiddleware(),
    async (req, res) => {
      const winners = await SQL_GET_ELECTION_WINNERS ({
        ...req.body, 
        user_id: req.user!.id
      }).many();
      res.json(winners);
    }
  );
};