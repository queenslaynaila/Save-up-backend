import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UserInterface, baseUserSchema, CreateUserContactInterface, CreateUserInterface } from './types';
import { MessageInterface } from '../../globalTypes/index';

const SQL_CREATE_USER_ENTITY = sql<{ entityType: string }, { id:number }>(`
  INSERT INTO entities (entity_type)
  VALUES (:entityType)
  RETURNING id
`);

const SQL_CREATE_USER_CONTACTS = sql<CreateUserContactInterface, Record<string,never>>(`
  INSERT INTO user_contact_details (id, phone_number, national_id )
  VALUES (:entityId, :phoneNumber, :nationalId)
`);

const SQL_CREATE_USER = sql<CreateUserInterface, Record<string,never>>(`
  INSERT INTO users (id, full_name, gender,pin)
  VALUES (:id, :fullName, :gender, :pin)
`);

export default (router: Router) => { 
  router.post<Record<string,never>, MessageInterface, UserInterface, Record<string,never>, Record<string,never>>(
    '/',
    validateRequest(baseUserSchema),
    async (req, res) => {
      const { fullName, gender, nationalId, phoneNumber, pin } = req.body;
      const entity = await SQL_CREATE_USER_ENTITY({ entityType: 'User' }).one();
      await SQL_CREATE_USER_CONTACTS({ entityId:entity.id,phoneNumber ,nationalId })
        .exec();
      const pinHash = bcrypt.hashSync(pin, 12);
      await SQL_CREATE_USER({ id:entity.id, fullName, gender, pin: pinHash })
        .exec();
      res.json({ message: "Account created Succesfully.Procced to login" });
    });
};