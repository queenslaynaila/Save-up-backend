import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { 
  AnswerCreationType, 
  SecurityAnswersBaseType, 
  answerCreationValidation 
} from './types'
import {  StatusCodeInterface } from '../../globalTypes';

const SQL_CREATE_ANSWER = sql<SecurityAnswersBaseType, Record<string,never>>(`
  SELECT create_answer (:user_id, :question_id, :answer)
`); 

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, AnswerCreationType, 
  Record<string,never>>(
    '/', 
    validateRequest({ body:answerCreationValidation }),
    authMiddleware(), 
    async (req, res) => {
      const hashedAnswer = await bcrypt.hash(req.body.answer, 12);
      await SQL_CREATE_ANSWER({  
        ...req.body, answer: hashedAnswer, user_id:req.user!.id
      }).exec();
      res.sendStatus(201);
    });
};