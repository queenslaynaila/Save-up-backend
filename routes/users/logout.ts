import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';

export default (router: Router) => {
  router.post<Record<string,never>, { message: string },Record<string,never>,Record<string,never>,Record<string,never>>(
    '/signout', 
    authMiddleware(), 
    async (_, res) => {
      res.removeHeader('X-Auth-Token');
      res.removeHeader('X-Refresh-Token');
      return res.json({ message: 'Logout successful' });
    });
};
