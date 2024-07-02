import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';  
import {  StatusCodeInterface } from '../../globalTypes/index';
import { ElectionInterface, electionValidation } from './types';

const SQL_CALL_ELECTION = sql<ElectionInterface , Record<string,never>>(`
  INSERT INTO elections (group_id, xid, initiator_id, type)
  SELECT 
      :group_id,
      COALESCE(MAX(xid), 0) + 1,
      :initiator_id,
      :type
  FROM elections
  WHERE group_id = :group_id;
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, ElectionInterface , Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    validateRequest(electionValidation),
    async (req, res) => {
      await SQL_CALL_ELECTION({ ...req.body, initiator_id:req.user!.id}).exec();
      res.sendStatus(201);
    }
  );
};