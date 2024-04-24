import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
//import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateUserContactInterface, CreateUserInterface, UserInterface, baseUserSchema } from '../../types';

const SQL_CREATE_USER_ENTITY = sql<{ entity_type: string }, { id:number }>(`
  INSERT INTO entities (entity_type)
  VALUES (:entity_type)
  RETURNING id
`);

const SQL_CREATE_USER_CONTACTS = sql<CreateUserContactInterface, Record<string,never>>(`
  INSERT INTO user_contact_details (id,phone_number,national_id )
  VALUES (:entity_id,:phone_number,:national_id)
`);

const SQL_CREATE_USER = sql<CreateUserInterface, Record<string,never>>(`
  INSERT INTO users (id,full_name,gender,pin)
  VALUES (:id, :full_name, :gender, :pin)
`);

export default (router: Router) => { 
  router.post<Record<string,never>, { message:string }, UserInterface, Record<string,never>, Record<string,never>>(
    '/',
    validateRequest(baseUserSchema),
    async (req, res) => {
      const { full_name, gender, national_id, phone_number, pin } = req.body;
      const entity = await SQL_CREATE_USER_ENTITY({ entity_type: 'User' }).one();
      await SQL_CREATE_USER_CONTACTS({ entity_id:entity.id,phone_number ,national_id })
        .exec();
      const pinHash = bcrypt.hashSync(pin, 12);
      await SQL_CREATE_USER({ id:entity.id, full_name, gender, pin: pinHash })
        .exec();
      res.json({message:"Account created Succesfully.Procced to login"});
    });
};