import { Router } from 'express';
import getAllSecurityQuestions from './getAllSecurityQuestions';

/**
 * @swagger
 * components:
 *   schemas:
 *     SecurityQuestion:
 *       type: object
 *       required:
 *         - id
 *         - question
 *         - created_at
 *       properties:
 *         id:
 *           type: number
 *           description: The unique identifier of the security question.
 *         question:
 *           type: string
 *           description: The text of the security question.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the security question was created.
 *       example:
 *         id: 1
 *         question: What is your mother's maiden name?
 *         created_at: '2022-04-18T12:00:00Z'
 */

/**
 * @swagger
 * tags:
 *   name: Security Questions
 *   description: The security questions API endpoints
 */

/**
 * @swagger
 * /security-questions:
 *   get:
 *     summary: Get all security questions
 *     tags: [Security Questions]
 *     responses:
 *       200:
 *         description: List of security questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SecurityQuestion'
 */

export default (baseRouter: Router) => {

  const router = Router();
  getAllSecurityQuestions(router);
  baseRouter.use('/security-questions', router);
  
};
