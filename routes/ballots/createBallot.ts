import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import {  StatusCodeInterface } from '../../globalTypes/index';
import { BallotBodyInterface, BallotInterface, ballotBodySchema } from './types';

const SQL_CREATE_BALLOT = sql<BallotInterface , Record<string,never>>(`
  INSERT INTO ballots (group_id, election_id, candidate_id, user_id)
  VALUES (:group_id, :election_id, :candidate_id, :user_id); 
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

// We have two types of elections:

// a) ballot - Every group member selects three people of their choice (Vote). All the votes are aggregated at the end of polling and with at least 50% of the group members having cast their votes. The top three members voted for become the admin

