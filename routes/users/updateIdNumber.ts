import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { UserIdDetails,UpdateIdDetails, updateIdDetailsSchema } from './types';

const SQL_UPDATE_ID_NUMBER = sql<UserIdDetails, { new_id_number:string }>(`
  SELECT * FROM update_id_number(:id, :id_type, :id_number)
`);

export default (router: Router) => {
  router.patch<Record<string,never>, { new_id_number:string },  UpdateIdDetails, 
  Record<string,never>>(
    '/id-number', 
    validateRequest({ body: updateIdDetailsSchema }),
    authMiddleware(), 
    async (req, res) => {
      const new_id_number = await SQL_UPDATE_ID_NUMBER({
        ...req.body,
        id:req.user!.id
      }).one();
      res.json(new_id_number);
    });
};