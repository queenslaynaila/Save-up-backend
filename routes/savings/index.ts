import express from 'express';
import createSaving from './createSaving';
import getSavingsByConditions from './getSavingsByConditions';
import getSavingById from './getSavingById';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createSaving(router);
  getSavingsByConditions(router);
  getSavingById(router);

  baseRouter.use('/savings', router);
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Saving:
 *       type: object
 *       required:
 *         - id
 *         - user_id
 *         - goal_id
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the savings record.
 *         user_id:
 *           type: integer
 *           description: The ID of the user associated with the savings record.
 *         goal_id:
 *           type: integer
 *           description: The ID of the goal associated with the savings record.
 *         amount:
 *           type: number
 *           description: The amount saved.
 *       example:
 *         id: 1
 *         user_id: 1
 *         goal_id: 1
 *         amount: 100.00
 */

/**
 * @swagger
 * tags:
 *   name: Savings
 *   description: Savings management API endpoints
*/

/**
 * @swagger
 * /savings:
 *   post:
 *     summary: Create a new saving
 *     tags: [Savings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Saving'
 *     responses:
 *       200:
 *         description: Saving created successfully.
 *       400:
 *         description: Error occurred during saving creation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 * /savings/records/{id}:
 *   get:
 *     summary: Get a saving by ID
 *     tags: [Savings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the saving to retrieve.
 *     responses:
 *       200:
 *         description: Saving retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Saving'
 *       404:
 *         description: Saving not found.
 * 
 * /savings/{savingIdentifier}:
 *   get:
 *     summary: Get savings by conditions
 *     tags: [Savings]
 *     parameters:
 *       - in: path
 *         name: savingIdentifier
 *         schema:
 *           type: string
 *         required: true
 *         description: The identifier for the conditions to retrieve the savings.
 *     responses:
 *       200:
 *         description: Savings retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Saving'
 *       404:
 *         description: Savings not found.
 */
