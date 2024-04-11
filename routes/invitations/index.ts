import express from 'express';
import sendInvite from './sendInvite';
import respondToInvite from './respondToInvite';

export default (baseRouter: express.Router) => {

  const router = express.Router();
  sendInvite(router);
  respondToInvite(router);

  baseRouter.use('/invitations', router);
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Invitation:
 *       type: object
 *       required:
 *         - group_id
 *         - sender_id
 *         - receiver_id
 *       properties:
 *         group_id:
 *           type: integer
 *           description: The ID of the group.
 *         sender_id:
 *           type: integer
 *           description: The ID of the sender.
 *         receiver_id:
 *           type: integer
 *           description: The ID of the receiver.
 *         status:
 *           type: string
 *           enum: [Pending, Accepted, Rejected]
 *           description: The status of the invitation.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the invitation was created.
 *       example:
 *         group_id: 1
 *         sender_id: 2
 *         receiver_id: 3
 *         status: Pending
 *         created_at: '2024-04-12T10:00:00Z'
 */

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Invitations management API endpoints
*/

/**
 * @swagger
 * /invitations/{groupId}:
 *   post:
 *     summary: Send an invitation
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the group to send the invitation to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invitation'
 *     responses:
 *       200:
 *         description: Invitation sent successfully.
 *       400:
 *         description: Error occurred during invitation sending.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 * /invitations:
 *   patch:
 *     summary: Respond to an invitation
 *     tags: [Invitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invitation_id:
 *                 type: integer
 *                 description: The ID of the invitation to respond to.
 *               status:
 *                 type: string
 *                 enum: [Accepted, Rejected]
 *                 description: The status of the invitation response.
 *     responses:
 *       200:
 *         description: Invitation response updated successfully.
 *       404:
 *         description: Invitation not found.
 *       500:
 *         description: Internal server error.
 */
