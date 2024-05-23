import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
//import { validateRequest } from '../../middleware/validationMiddleware';
import {  ExternalSavingInterface} from './types';
import { MessageInterface } from '../../globalTypes';

const SQL_CREATE_SAVING = sql<ExternalSavingInterface, Record<string,never>>(`
  SELECT create_external_savings( 
    :pocket_id, 
    :amount, 
    :show_donor_details, 
    :full_name,
    :phone_number
  )
`);

export default (router: Router) => {
  router.post<Record<string,never>, MessageInterface, ExternalSavingInterface, Record<string,never>>(
    '/', 
    async (req, res) => {
      const { pocket_id, amount, show_donor_details, full_name, phone_number } = req.body;
      const savingResult = await SQL_CREATE_SAVING({ pocket_id, amount, show_donor_details, full_name, phone_number })
        .one(new HttpError(400, 'Unable to complete the request'));
      const amountPaid = savingResult.amount
      return res.json({ message: `Your saving of KES ${amountPaid}  was successful!` });
    });
};