/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management API endpoints
*/

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Prefer not to say]
 *               national_id:
 *                 type: integer
 *               phone_number:
 *                 type: string
 *               pin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account created successfully. Proceed to login.
 *       400:
 *         description: Account with this Phone number already exists or Unexpected error occurred, please try again later.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /admin/stats/{resource}/{operator}:
 *   get:
 *     summary: Get table statistics
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: resource
 *         schema:
 *           type: string
 *         required: true
 *         description: The resource for which to retrieve statistics (goals, savings, expenses).
 *       - in: path
 *         name: operator
 *         schema:
 *           type: string
 *         required: true
 *         description: The operator to apply for statistics (SUM, MAX, MIN, AVG, COUNT).
 *     responses:
 *       200:
 *         description: Table statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *       401:
 *         description: Unauthorized access. Only admins can access this endpoint.
 */

/**
 * @swagger
 * /admin/{roleToUpdate}/{id}:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: roleToUpdate
 *         schema:
 *           type: string
 *         required: true
 *         description: The role to update (Admin, User, Moderator).
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose role to update.
 *     responses:
 *       200:
 *         description: User role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 full_name:
 *                   type: string
 *                 gender:
 *                   type: string
 *                   enum: [Male, Female, Prefer not to say]
 *                 id:
 *                   type: number
 *                 role:
 *                   type: string
 *       400:
 *         description: INVALID ROLE ERROR MSG.
 *       404:
 *         description: User not found.
 */
