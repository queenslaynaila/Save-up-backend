
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
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense created successfully.
 *       400:
 *         description: Error occurred during expense creation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 * 
 * /expenses/records/{id}:
 *   patch:
 *     summary: Soft delete an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the expense to soft delete.
 *     responses:
 *       200:
 *         description: Expense soft deleted successfully.
 *       404:
 *         description: Expense not found.
 * 
 * /expenses/records/{expenseId}:
 *   get:
 *     summary: Get an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the expense to retrieve.
 *     responses:
 *       200:
 *         description: Expense retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense not found.
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
 *         description: The identifier for the conditions to retrieve the expenses.
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expenses not found.
 * 
 * /expenses/{id}:
 *   patch:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the expense to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense updated successfully.
 *       404:
 *         description: Expense not found.
 */
