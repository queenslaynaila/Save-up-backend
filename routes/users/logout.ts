import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { StatusCodeInterface } from '../../globalTypes/index';

export default (router: Router) => {
  router.delete<Record<string,never>, StatusCodeInterface, Record<string,never>, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    async (_req, res) => {
      res.removeHeader('authorization-token');
      res.removeHeader('refresh-token');
      res.sendStatus(204);
    });
};
