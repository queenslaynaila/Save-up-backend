/**
 * @swagger
 * /cumulatives/top-expenditure-categories:
 *   get:
 *     summary: Returns an array of categories with the most expenditure in order with their total expenses
 *     tags: [Cumulatives]
 *     responses:
 *       200:
 *         description: Categories with highest expenses retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category_id:
 *                     type: number
 *                   category_name:
 *                     type: string
 *                   total_expense:
 *                     type: number
 *       500:
 *         description: Internal server error.

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
 *                 total_contributed_amount:
 *                   type: number
 *       500:
 *         description: Unable to complete the request.

 * /cumulatives/total-expenses:
 *   get:
 *     summary: Get total expenses for all users
 *     tags: [Cumulatives]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Start date for filtering expenses (optional).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: End date for filtering expenses (optional).
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Category ID for filtering expenses (optional).
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
 *       500:
 *         description: Internal server error.

 * /cumulatives/total-target-amount:
 *   get:
 *     summary: Get total target amount for all users' goals
 *     tags: [Cumulatives]
 *     parameters:
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Priority for filtering goals (optional).
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status for filtering goals (optional).
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *         description: Category ID for filtering goals (optional).
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
 *       500:
 *         description: Internal server error.
 */
