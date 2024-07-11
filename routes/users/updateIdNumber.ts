import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { UserIdDetails,UpdateIdDetails, updateIdDetailsSchema } from './types';
import { headersSchema, StatusCodeInterface } from '../../globalTypes/index';

const SQL_UPDATE_ID_NUMBER = sql<UserIdDetails, Record<string,never>>(`
   SELECT * FROM update_id_number(:id, :id_type, :id_number)
`);

export default (router: Router) => {
  router.patch<Record<string,never>, StatusCodeInterface,  UpdateIdDetails, 
  Record<string,never>>(
    '/id-details', 
    validateRequest({ headers: headersSchema, body: updateIdDetailsSchema }),
    authMiddleware(), 
    async (req, res) => {
      const id= req.user!.id;
      await SQL_UPDATE_ID_NUMBER({...req.body, id}).exec();
      res.sendStatus(204);
    });
};