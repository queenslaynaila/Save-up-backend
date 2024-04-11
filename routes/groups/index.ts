import express from 'express';
import createGroup from './createGroups';
import UpdateGroup from './UpdateGroup';
import getUserGroups from './getUserGroups';
import getGroupMembers from './getGroupMembers';
import getCommonGroups from './getCommonGroups';
import ExitGroup from './ExitGroup';

export default (baseRouter: express.Router) => {

  const router = express.Router();
  createGroup(router);
  UpdateGroup(router);
  getUserGroups(router);
  getGroupMembers(router);
  getCommonGroups(router);
  ExitGroup(router);

  baseRouter.use('/groups', router);
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - id
 *         - group_name
 *         - description
 *         - created_by
 *         - updated_at
 *         - deleted_at
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the group.
 *         group_name:
 *           type: string
 *           description: The name of the group.
 *         description:
 *           type: string
 *           description: The description of the group.
 *         created_by:
 *           type: integer
 *           description: The ID of the user who created the group.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the group was last updated.
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the group was deleted (if applicable).
 *       example:
 *         id: 1
 *         group_name: "Work Team"
 *         description: "A group for collaborating on work projects"
 *         created_by: 123
 *         updated_at: "2022-04-18T12:00:00Z"
 *         deleted_at: null
 */
/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group management API endpoints
*/

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroupRequest'
 *     responses:
 *       200:
 *         description: Group created successfully.
 *       400:
 *         description: Error occurred during group creation.
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
 * /groups/exit-group/{groupId}:
 *   patch:
 *     summary: Exit a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the group to exit.
 *     responses:
 *       200:
 *         description: Exited group successfully.
 *       400:
 *         description: Error occurred while exiting the group.
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
 * /groups/common-groups/{user_id}:
 *   get:
 *     summary: Get common groups for a user
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user.
 *     responses:
 *       200:
 *         description: List of common groups.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 */

/**
 * @swagger
 * /groups/{group_id}:
 *   get:
 *     summary: Get group members
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the group.
 *     responses:
 *       200:
 *         description: List of group members.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   role:
 *                     type: string
 *                   joined_at:
 *                     type: string
 */

/**
 * @swagger
 * /groups/my-groups:
 *   get:
 *     summary: Get groups for a user
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of groups.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 */

/**
 * @swagger
 * /groups/{groupId}:
 *   patch:
 *     summary: Update a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the group to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGroupRequest'
 *     responses:
 *       200:
 *         description: Group updated successfully.
 *       400:
 *         description: Error occurred while updating the group.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 */
