
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
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               category_id:
 *                 type: number
 *               amount:
 *                 type: number
 *               priority:
 *                 type: string
 *               target_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Goal created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 entity_id:
 *                   type: number
 *                 category_id:
 *                   type: number
 *                 description:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 amount:
 *                   type: number
 *                 priority:
 *                   type: string
 *                 target_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Access Denied. Log in.
 *       500:
 *         description: Internal server error.
 * 
 * /goals/{id}:
 *   patch:
 *     summary: Update a goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the goal to update.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               category_id:
 *                 type: number
 *               amount:
 *                 type: number
 *               priority:
 *                 type: string
 *                 enum:
 *                   - "High"
 *                   - "Low"
 *                   - "Intermediate"
 *               target_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Goal updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entity_id:
 *                   type: number
 *                 category_id:
 *                   type: number
 *                 description:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 priority:
 *                   type: string
 *                 target_at:
 *                   type: string
 *                   format: date-time
 *                 id:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Goal not found.
 
 * /goals/records/{goalId}:
 *   get:
 *     summary: Get a goal by ID
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: goalId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the goal to retrieve.
 *     responses:
 *       200:
 *         description: Goal retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entity_id:
 *                   type: number
 *                 category_id:
 *                   type: number
 *                 description:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 priority:
 *                   type: string
 *                 target_at:
 *                   type: string
 *                   format: date-time
 *                 id:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Not found.
 *       500:
 *         description: Internal server error.

 * /goals/delete/{id}:
 *   patch:
 *     summary: Soft delete a goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the goal to soft delete.
 *     responses:
 *       200:
 *         description: Goal deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the goal was deleted.
 *       500:
 *         description: Internal server error.
 
 * /goals/{goalsIdentifier}:
 *   get:
 *     summary: Get goals based on provided conditions
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: goalsIdentifier
 *         schema:
 *           type: string
 *         required: true
 *         description: |
 *           The identifier for the conditions to retrieve the goals. It can be one of the following:
 *           - "me": Retrieves all goals for the currently logged-in user.
 *           - "all": Retrieves all goals on the app (accessible only to admins).
 *           - A positive integer: Retrieves goals for a specific user based on their ID (requires admin role).
 *     responses:
 *       200:
 *         description: Goals retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   entity_id:
 *                     type: number
 *                   category_id:
 *                     type: number
 *                   description:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   priority:
 *                     type: string
 *                   target_at:
 *                     type: string
 *                     format: date-time
 *                   id:
 *                     type: number
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                   completed_at:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Bad request. (Invalid parameters provided.)
 *       403:
 *         description: Forbidden. (Access restricted to admins for 'all' and specific user IDs).
 *       500:
 *         description: Internal server error.
 *       404:
 *         description: Goals not found.


 */
