import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {  BaseGroupInterface, GroupsByReceiverInterface   } from './types';

const SQL_FETCH_USER_GROUPS = sql<GroupsByReceiverInterface ,  BaseGroupInterface >(`
  SELECT groups.id, groups.name, groups.created_by, groups.created_at
  FROM groups 
  LEFT JOIN user_groups 
  ON groups.id = user_groups.group_id
  WHERE user_groups.user_id = :receiver_id
  AND user_groups.left_at IS NULL;
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