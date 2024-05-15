import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import {  ExternalSavingInterface, externalSavingSchema } from './types';
import { MessageInterface } from '../../globalTypes';

const SQL_CREATE_SAVING = sql<ExternalSavingInterface, Record<string,never>>(`
  SELECT create_external_savings( :pocket_id, :amount, :show_donor_details)
`);

export default (router: Router) => {
  router.post<Record<string,never>, MessageInterface, ExternalSavingInterface, Record<string,never>>(
    '/', 
    authMiddleware(),
    validateRequest(externalSavingSchema),
    async (req, res) => {
      const { pocket_id, amount, show_donor_details } = req.body;
      const savingResult = await SQL_CREATE_SAVING({ pocket_id, amount, show_donor_details })
        .one(new HttpError(400, 'Unable to complete the request'));
      const amountPaid = savingResult.amount
      return res.json({ message: `Your saving of KES ${amountPaid}  was successful!` });
    });
};