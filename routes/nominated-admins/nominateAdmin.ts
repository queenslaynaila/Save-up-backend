import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import {  StatusCodeInterface } from '../../globalTypes/index';
import { ProposeAdminInterface } from './types'

const SQL_NOMINATE_GROUP_ADMIN = sql<ProposeAdminInterface, Record<string,never>>(`
  INSERT INTO nominated_administrators (group_id, user_id)
  VALUES (:group_id, :user_id)
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, ProposeAdminInterface, Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    async (req, res) => {
      await SQL_NOMINATE_GROUP_ADMIN({ ...req.body}).one(
        new HttpError(400, `Member has already been nominated as admin`)
      );
      res.sendStatus(201);
    }
  );
};