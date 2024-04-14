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
 * /invitations/my-invites:
 *   get:
 *     summary: Retrieve invitations for the logged-in user
 *     tags: [Invitations]
 *     responses:
 *       200:
 *         description: List of invitations for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sender_id:
 *                     type: integer
 *                     description: The ID of the sender.
 *                   receiver_id:
 *                     type: integer
 *                     description: The ID of the receiver.
 *                   group_id:
 *                     type: integer
 *                     description: The ID of the group.
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time when the invitation was created.
 *       500:
 *         description: Internal server error
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
 *           type: string
 *         required: true
 *         description: The ID of the group to send the invitation to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitation sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the invitation was sent.
 *       400:
 *         description: User already has a pending invitation for this group.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 *       404:
 *         description: User with this phone number not found. You can invite them to join the app and connect with you.
 *       500:
 *         description: Internal server error.
 * /invitations/update-invite:
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
 *               group_id:
 *                 type: integer
 *                 description: The ID of the invitation to respond to.
 *               status:
 *                 type: string
 *                 description: |
 *                   The status of the invitation response.
 *                   It can only be one of the following values: 'Accepted', 'Rejected'.
 *                   This field is not case-sensitive.
 *                 enum:
 *                   - Accepted
 *                   - Rejected
 *     responses:
 *       200:
 *         description: Invitation response updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the invitation response was processed.
 *       400:
 *         description: Invalid response.
 *       500:
 *         description: Internal server error.
 */
