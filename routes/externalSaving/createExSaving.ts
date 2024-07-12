import { Router } from 'express';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import {  ExternalSavingInterface, externalSavingSchema} from './types';
import { headersSchema, StatusCodeInterface } from '../../globalTypes';

const SQL_CREATE_SAVING = sql<ExternalSavingInterface, Record<string,never>>(`
  SELECT create_external_savings( 
    :entity_id,
    :pocket_id, 
    :donor_id, 
    :amount, 
    :show_details
  )
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, ExternalSavingInterface, 
  Record<string,never>>(
    '/', 
    validateRequest({
      headers: headersSchema, 
      body: externalSavingSchema
    }),
    async (req, res) => {
      await SQL_CREATE_SAVING({...req.body }).exec();
      res.sendStatus(201);
    });
};