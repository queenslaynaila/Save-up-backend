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
 *             type: object
 *             required:
 *               - question_id
 *               - answer
 *             properties:
 *               question_id:
 *                 type: number
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Security answer created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the security answer was created successfully.
 *       403:
 *         description: Unprocessable entity. 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 * /security-answers/{id}:
 *   patch:
 *     summary: Update a security answer for the specified question ID
 *     tags: [Security Answers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the security question.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the answer was updated successfully.
 *       422:
 *         description: Unprocessable entity. 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 *       500:
 *         description: Internal Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Server error.
 */
