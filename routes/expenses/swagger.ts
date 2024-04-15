/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - id
 *         - entity_id
 *         - category_id
 *         - description
 *         - amount_spent
 *         - date_spent
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the expense.
 *         entity_id:
 *           type: integer
 *           description: The ID of the entity associated with the expense.
 *         category_id:
 *           type: integer
 *           description: The ID of the category associated with the expense.
 *         description:
 *           type: string
 *           description: The description of the expense.
 *         amount_spent:
 *           type: number
 *           description: The amount spent for the expense.
 *         date_spent:
 *           type: string
 *           format: date-time
 *           description: The date and time when the expense was spent.
 *       example:
 *         id: 1
 *         entity_id: 1
 *         category_id: 2
 *         description: "Dinner at a restaurant"
 *         amount_spent: 50.00
 *         date_spent: "2024-04-20T18:30:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expenses management API endpoints
*/

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               amount_spent:
 *                 type: number
 *               date_spent:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Expense created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category_id:
 *                   type: number
 *                 entity_id:
 *                   type: number
 *                 description:
 *                   type: string
 *                 amount_spent:
 *                   type: number
 *                 date_spent:
 *                   type: string
 *                   format: date-time
 *                 id:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: Forbidden. 
 *       500:
 *         description: Internal server error.
 * 
 * /expenses/records/{id}:
 *   patch:
 *     summary: Soft delete an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the expense to soft delete.
 *     responses:
 *       200:
 *         description: Expense soft deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the expense was deleted.
 *       404:
 *         description: Expense not found.
 *       500:
 *         description: Internal server error.
 * /expenses/{id}:
 *   patch:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the expense to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - category_id
 *               - amount_spent
 *               - date_spent
 *             properties:
 *               description:
 *                 type: string
 *                 nullable: true
 *               category_id:
 *                 type: integer
 *                 nullable: true
 *               amount_spent:
 *                 type: number
 *                 nullable: true
 *               date_spent:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Expense updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the expense was updated.
 *       404:
 *         description: Expense not found.
 *       500:
 *         description: Internal server error.
 * 
 *   get:
 *     summary: Get an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the expense to retrieve.
 *     responses:
 *       200:
 *         description: Expense retrieved successfully.
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
 *                 amount_spent:
 *                   type: number
 *                 date_spent:
 *                   type: string
 *                   format: date-time
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Expense not found.
 *       500:
 *         description: Internal server error.

 * 
 * /expenses/{expenseIdentifier}:
 *   get:
 *     summary: Get expenses by conditions
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: expenseIdentifier
 *         schema:
 *           type: string
 *         required: true
 *         description: |
 *           Defines the scope of users to retrieve.Can be one of the following:
 *           - "me": Retrieves all logged ub users expenses.
 *           - "all": Retrieves all expenses(requires Admin or Moderator role).
 *           - A positive integer: Retrieves information about a specific users expenses based on their ID (requires Admin or Moderator role).
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *         description: Optional category ID to filter expenses.
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Optional start date to filter expenses.
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Optional end date to filter expenses.
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Bad request. Invalid parameters provided.
 *       403:
 *         description: Forbidden. Access restricted to admins for 'all' and specific user IDs.
 *       500:
 *         description: Internal server error.
 *       404:
 *         description: Expenses not found.
 */
