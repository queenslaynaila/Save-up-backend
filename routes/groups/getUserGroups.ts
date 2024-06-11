import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {  BaseGroupInterface, GroupsByReceiverInterface   } from './types';

const SQL_FETCH_USER_GROUPS = sql<GroupsByReceiverInterface ,  BaseGroupInterface >(`
  SELECT groups.id, groups.name, groups.created_by, groups.created_at
  FROM groups 
  LEFT JOIN group_users 
  ON groups.id = group_users.group_id
  WHERE group_users.user_id = :receiver_id
  AND group_users.left_at IS NULL;
`);

export default (router: Router) => {
  router.get<Record<string,never>,  BaseGroupInterface [], GroupsByReceiverInterface, Record<string,never>>(
    '/me/:userId/',
    authMiddleware(),
    async (req, res) => {
      const groups = await SQL_FETCH_USER_GROUPS({ receiver_id: req.user!.id}).many();
      return res.json(groups);
    }
  );
};