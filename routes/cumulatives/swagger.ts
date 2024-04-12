
/**
 * @swagger
 * tags:
 *   name: Cumulatives
 *   description: Admin-only cumulative data API endpoints
*/

/**
 * @swagger
 * /cumulatives/total-expenses:
 *   get:
 *     summary: Get total expenses for all users
 *     tags: [Cumulatives]
 *     responses:
 *       200:
 *         description: Total expenses retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_expenses:
 *                   type: number
 *                   description: The total expenses amount for all users.
 *       401:
 *         description: Unauthorized access. Only admins can access this endpoint.
 * 
 * /cumulatives/total-savings:
 *   get:
 *     summary: Get total savings for all users
 *     tags: [Cumulatives]
 *     responses:
 *       200:
 *         description: Total savings retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_savings:
 *                   type: number
 *                   description: The total savings amount for all users.
 *       401:
 *         description: Unauthorized access. Only admins can access this endpoint.
 * 
 * /cumulatives/total-target-amount:
 *   get:
 *     summary: Get total target amount for all users' goals
 *     tags: [Cumulatives]
 *     responses:
 *       200:
 *         description: Total target amount retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_target_amount:
 *                   type: number
 *                   description: The total target amount for all users' goals.
 *       401:
 *         description: Unauthorized access. Only admins can access this endpoint.
 */
