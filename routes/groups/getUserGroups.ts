import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {  BaseGroupInterface, GroupsByReceiverInterface   } from './types';

const SQL_FETCH_USER_GROUPS = sql<GroupsByReceiverInterface ,  BaseGroupInterface >(`
  SELECT groups.id, groups.name, groups.created_at
  FROM groups 
  LEFT JOIN group_members 
  ON groups.id = group_members.group_id
  WHERE group_members.user_id = :receiver_id
  AND group_members.left_at IS NULL;
`);

export default (router: Router) => {
  router.get<Record<string,never>,  BaseGroupInterface [], GroupsByReceiverInterface, Record<string,never>>(
    '/me/',
    authMiddleware(),
    async (req, res) => {
      const groups = await SQL_FETCH_USER_GROUPS({ receiver_id: req.user!.id}).many();
      return res.json(groups);
    }
  );
};