
/**
 * @swagger
 * components:
 *   schemas:
 *     Goal:
 *       type: object
 *       required:
 *         - id
 *         - entity_id
 *         - description
 *         - category_id
 *         - amount
 *         - priority
 *         - target_at
 *         - created_at
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the goal.
 *         entity_id:
 *           type: integer
 *           description: The ID of the entity associated with the goal.
 *         description:
 *           type: string
 *           description: The description of the goal.
 *         category_id:
 *           type: integer
 *           description: The ID of the category associated with the goal.
 *         amount:
 *           type: number
 *           description: The amount associated with the goal.
 *         priority:
 *           type: integer
 *           description: The priority level of the goal.
 *         target_at:
 *           type: string
 *           format: date-time
 *           description: The target date and time for achieving the goal.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the goal was created.
 *         completed_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the goal was completed.
 *       example:
 *         id: 1
 *         entity_id: 1
 *         description: "Save $1000 for vacation"
 *         category_id: 2
 *         amount: 1000
 *         priority: 1
 *         target_at: "2024-12-31T23:59:59Z"
 *         created_at: "2024-04-15T08:00:00Z"
 *         completed_at: "2024-11-30T12:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Goals management API endpoints
*/

/**
 * @swagger
 * /goals:
 *   post:
 *     summary: Create a new goal
 *     tags: [Goals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Goal'
 *     responses:
 *       200:
 *         description: Goal created successfully.
 *       400:
 *         description: Error occurred during goal creation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 * /goals/delete/{id}:
 *   patch:
 *     summary: Soft delete a goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the goal to soft delete.
 *     responses:
 *       200:
 *         description: Goal soft deleted successfully.
 *       404:
 *         description: Goal not found.
 * 
 * /goals/records/{goalId}:
 *   get:
 *     summary: Get a goal by ID
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: goalId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the goal to retrieve.
 *     responses:
 *       200:
 *         description: Goal retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 *       404:
 *         description: Goal not found.
 * 
 * /goals/{id}:
 *   patch:
 *     summary: Update a goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the goal to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Goal'
 *     responses:
 *       200:
 *         description: Goal updated successfully.
 *       404:
 *         description: Goal not found.
 * 
 * /goals/{goalsIdentifier}:
 *   get:
 *     summary: Get a goal based on provided conditions
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: goalsIdentifier
 *         schema:
 *           type: string
 *         required: true
 *         description: The identifier for the conditions to retrieve the goal.
 *     responses:
 *       200:
 *         description: Goal retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 *       404:
 *         description: Goal not found.
 */
