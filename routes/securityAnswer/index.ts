import { Router } from 'express';
import createSecurityAnswer from './createSecurityAnswer';
import deleteSecurityAnswer from './deleteSecurityAnswer';

export default (baseRouter: Router) => {
  const router = Router();
  createSecurityAnswer(router);
  deleteSecurityAnswer(router);
  baseRouter.use('/security-answers', router);
};

/**
 * @swagger
 * components:
 *   schemas:
 *     SecurityAnswer:
 *       type: object
 *       required:
 *         - user_id
 *         - question_id
 *         - answer
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The ID of the user.
 *         question_id:
 *           type: integer
 *           description: The ID of the security question.
 *         answer:
 *           type: string
 *           description: The answer to the security question.
 *       example:
 *         user_id: 1
 *         question_id: 1
 *         answer: "My answer"
 */

/**
 * @swagger
 * tags:
 *   name: Security Answers
 *   description: Security answers management API endpoints
*/

/**
 * @swagger
 * /security-answers:
 *   post:
 *     summary: Create a new security answer
 *     tags: [Security Answers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SecurityAnswer'
 *     responses:
 *       200:
 *         description: Security answer created successfully.
 *       400:
 *         description: Error occurred during security answer creation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 *   delete:
 *     summary: Delete a security answer
 *     tags: [Security Answers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: The ID of the user.
 *               question_id:
 *                 type: integer
 *                 description: The ID of the security question.
 *     responses:
 *       200:
 *         description: Security answer deleted successfully.
 *       404:
 *         description: Security answer not found.
 *       500:
 *         description: Internal server error.
 */
