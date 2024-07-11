import { Router } from 'express';
import validateRequest from '../../middleware/validationMiddleware';
import authMiddleware from '../../middleware/authorization';
import { headersSchema, StatusCodeInterface } from '../../globalTypes/index';

export default (router: Router) => {
  router.delete<Record<string,never>, StatusCodeInterface, Record<string,never>, 
  Record<string,never>>(
    '/logout', 
    validateRequest({ headers: headersSchema }),
    authMiddleware(), 
    async (_req, res) => {
      res.removeHeader('authorization-token');
      res.removeHeader('refresh-token');
      res.sendStatus(204);
    });
};