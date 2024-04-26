import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { MessageInterface } from '../../globalTypes/index';

export default (router: Router) => {
  router.post<Record<string,never>, MessageInterface, Record<string,never>, Record<string,never>, Record<string,never>>(
    '/signout', 
    authMiddleware(), 
    async (_, res) => {
      res.removeHeader('X-Auth-Token');
      res.removeHeader('X-Refresh-Token');
      return res.json({ message: 'Logout successful' });
    });
};
