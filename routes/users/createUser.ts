import { Router } from 'express';
import bcrypt from 'bcrypt';
//import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UserInterface, baseUserSchema } from './types';
import { MessageInterface } from '../../globalTypes/index';

const SQL_CREATE_USER = sql<UserInterface, MessageInterface>(`
  SELECT create_user(:full_name, :gender, :national_id, :phone_number, :pin)
`);

export default (router: Router) => { 
  router.post<Record<string,never>, MessageInterface, UserInterface, Record<string,never>, Record<string,never>>(
    '/',
    validateRequest(baseUserSchema),
    async (req, res) => {
      const { full_name, gender, national_id, phone_number, pin } = req.body;
      const pinHash = bcrypt.hashSync(pin, 12);
      await SQL_CREATE_USER({ full_name, gender, pin: pinHash, national_id, phone_number })
        .exec();
      res.json({ message:"Account created Succesfully. Procced to login" });
    });
};

