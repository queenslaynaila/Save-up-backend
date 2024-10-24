import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { StatusCodeInterface } from '../../globalTypes';

export default (router: Router) => {
  router.delete<Record<string, never>, StatusCodeInterface, Record<string, never>,
  Record<string, never>>(
    '/logout',
    authMiddleware(),
    async (_req, res) => {
      res.removeHeader('authorization-token');
      res.removeHeader('refresh-token');
      res.sendStatus(204);
    }
  );
};