import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import  validateRequest from '../../middleware/validationMiddleware';
import { StatusCodeInterface } from '../../globalTypes';
import { 
  CandidateInterface, 
  CandidateRequestBody, 
  candidateRequestBody 
} from './types';

const SQL_CREATE_CANDIDATES = sql<CandidateInterface , Record<string,never>>(`
  INSERT INTO CANDIDATES (group_id, election_id, candidate_id, chosen_by)
  VALUES (:group_id, :election_id, :candidate_id, :chosen_by);
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, CandidateRequestBody, 
  Record<string,never>>(
    '/',
    validateRequest({
      body:candidateRequestBody
    }), 
    authMiddleware(),
    async (req, res) => {
      const chosen_by = req.user!.id
      await SQL_CREATE_CANDIDATES({ ...req.body, chosen_by}).exec();
      res.sendStatus(201);
    }
  );
};