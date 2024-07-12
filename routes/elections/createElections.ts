import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';  
import {  headersSchema, 
  StatusCodeInterface } from '../../globalTypes/index';
import { ElectionInterface, 
  ElectionValidation, 
  electionValidation } from './types';

const SQL_CALL_ELECTION = sql<ElectionInterface , Record<string,never>>(`
  SELECT create_election(:group_id, :initiator_id, :type)
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, ElectionValidation, 
  Record<string,never>>(
    '/',
    validateRequest({
      headers: headersSchema, 
      body: electionValidation
    }), 
    authMiddleware(),
    async (req, res) => {
      await SQL_CALL_ELECTION({ ...req.body, initiator_id:req.user!.id}).exec();
      res.sendStatus(201);
    }
  );
};