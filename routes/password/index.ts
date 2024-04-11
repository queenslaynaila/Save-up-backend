import express from 'express';
import updatePassword from './updatePassword';
import {
  initiatePasswordReset,
  verifyPasswordResetToken,
  verifySecurityAnswers,
  resetPassword,
} from './ForgetPasswordRoutes';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  updatePassword(router);
  initiatePasswordReset(router);
  verifyPasswordResetToken(router);
  verifySecurityAnswers(router);
  resetPassword(router);

  baseRouter.use('/password', router);
};

/**
 * @swagger
 * tags:
 *   name: Password
 *   description: Password management API endpoints
*/

/**
 * @swagger
 * /pin/update-pin:
 *   patch:
 *     summary: Update user password
 *     tags: [Password]
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Error occurred during password update.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 * /pin/forget-password-request:
 *   post:
 *     summary: Initiate password reset
 *     tags: [Password]
 *     responses:
 *       200:
 *         description: Password reset initiated successfully. Check your email for instructions.
 *       400:
 *         description: Error occurred during password reset request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 * /pin/verify-reset-token:
 *   post:
 *     summary: Verify password reset token
 *     tags: [Password]
 *     responses:
 *       200:
 *         description: Password reset token verified successfully.
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
 * 
 * /pin/verify-security-answers:
 *   post:
 *     summary: Verify security answers for password reset
 *     tags: [Password]
 *     responses:
 *       200:
 *         description: Security answers verified successfully.
 *       400:
 *         description: Error occurred during security answer verification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 * /pin/reset:
 *   post:
 *     summary: Reset user password
 *     tags: [Password]
 *     responses:
 *       200:
 *         description: Password reset successfully. Proceed to login with your new password.
 *       400:
 *         description: Error occurred during password reset.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 */
