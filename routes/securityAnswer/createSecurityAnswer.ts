import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateSecurityAnswerInterface, securityAnswerRequestSchema } from './types'
import {  MessageInterface } from '../../globalTypes/index';

const SQL_CREATE_ANSWER = sql<CreateSecurityAnswerInterface ,Record<string,never>>(`
  INSERT INTO security_answers ( user_id, question_id, answer) 
  VALUES (:userId, :questionId, :answer)
`); 

export default (router: Router) => {
  router.post<Record<string,never>, MessageInterface, CreateSecurityAnswerInterface , Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(securityAnswerRequestSchema),
    async (req, res) => {
      const userId = req.user!.id;
      const { questionId , answer } = req.body;
      const hashedAnswer = await bcrypt.hash(answer, 12);
      await SQL_CREATE_ANSWER({ userId,  questionId, answer: hashedAnswer }).exec();
      res.json({ message: 'Security answer created successfully' });
    });
};
