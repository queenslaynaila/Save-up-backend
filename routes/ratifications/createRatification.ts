import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import {  StatusCodeInterface } from '../../globalTypes/index';
import { RatificationInterface, ratificationSchema } from './types';

const SQL_CREATE_RATIFICATIONS = sql<RatificationInterface , Record<string,never>>(`
  INSERT INTO ratifications (group_id, election_id, user_id, :is_ratified)
  VALUES (:group_id, :election_id, :user_id, :is_ratified); 
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, RatificationInterface, 
  Record<string,never>>(
    '/',
    validateRequest(ratificationSchema),
    authMiddleware(),
    async (req, res) => {
      await SQL_CREATE_RATIFICATIONS({ 
        ...req.body, user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  );
};