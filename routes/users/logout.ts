import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { MessageInterface } from '../../globalTypes/index';

export default (router: Router) => {
  router.post<Record<string,never>, MessageInterface, Record<string,never>, Record<string,never>, Record<string,never>>(
    '/logout', 
    authMiddleware(), 
    async (req, res) => {
      console.log(req.headers)
      res.removeHeader('authorization-token');
      res.removeHeader('refresh-token');
      return res.json({ message: 'Logout successful' });
    });
};
