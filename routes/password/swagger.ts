/**
 * @swagger
 * tags:
 *   name: Password
 *   description: Password management API endpoints
*/


/**
 * @swagger
 * /pin/forget-password:
 *   post:
 *     summary: Initiate password reset
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset initiated successfully. Check your email for instructions.
 *         headers:
 *           X-Reset-Token:
 *             schema:
 *               type: string
 *               description: The reset token sent to the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indicating the successful initiation of the password reset.
 */

/**
 * @swagger
 * /pin/verify-reset-token:
 *   post:
 *     summary: Verify password reset token
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reset_token:
 *                 type: number
 *     responses:
 *       200:
 *         description: Password reset token verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   question_id:
 *                     type: number
 *                   question:
 *                     type: string
 *       400:
 *         description: Error occurred during password reset token verification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 */

/**
/**
 * @swagger
 * /pin/verify-security-answers:
 *   post:
 *     summary: Verify security answers for password reset
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question_id:
 *                       type: number
 *                     answer:
 *                       type: string
 *     responses:
 *       200:
 *         description: Security answers verified successfully.
 *       401:
 *         description: Incorrect answers. Contact customer service for help.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 */

/**
 * @swagger
 * /pin/reset:
 *   post:
 *     summary: Reset user password
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully. Proceed to login with your new password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indicating the successful password reset.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 */

