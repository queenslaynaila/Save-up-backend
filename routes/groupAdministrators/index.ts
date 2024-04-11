import express from 'express';
import makeGroupAdmin from './makeGroupAdmin';
import nominateAdmin from './nominateAdmin';
import getNominatedAdministrators from './getNominatedAdministrators';
import approveNomination from './approveNomination';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  makeGroupAdmin(router);
  nominateAdmin(router);
  getNominatedAdministrators(router)
  approveNomination(router);
  
  baseRouter.use('/group-admin', router);
};

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupAdmin:
 *       type: object
 *       required:
 *         - group_id
 *         - user_id
 *         - created_at
 *       properties:
 *         group_id:
 *           type: integer
 *           description: The ID of the group.
 *         user_id:
 *           type: integer
 *           description: The ID of the user who is a group administrator.
 *         created_at:
 *            type: string
 *            description: The date and time when the group administrator was created.
 *       example:
 *         group_id: 1
 *         user_id: 2
 */

/**
 * @swagger
 * tags:
 *   name: Group Admin
 *   description: Group administrators management API endpoints
*/

/**
 * @swagger
 * /group-admin:
 *   post:
 *     summary: Make a user a group administrator
 *     tags: [Group Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupAdmin'
 *     responses:
 *       200:
 *         description: User made a group administrator successfully.
 *       400:
 *         description: Error occurred during group administrator creation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 * /group-admin/nominate/{group_id}:
 *   post:
 *     summary: Nominate a group administrator for a specific group
 *     tags: [Group Admin]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the group to nominate an administrator for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: The ID of the user to nominate as an administrator.
 *     responses:
 *       200:
 *         description: User nominated as a group administrator successfully.
 *       400:
 *         description: Error occurred during group administrator nomination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 * /group-admin/{group_id}:
 *   get:
 *     summary: Get nominated administrators for a group
 *     tags: [Group Admin]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the group to get nominated administrators for.
 *     responses:
 *       200:
 *         description: List of nominated administrators for the group.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupAdmin'
 */
