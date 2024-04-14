/**
 * @swagger
 * components:
 *   schemas:
 *     NextOfKin:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the next of kin record.
 *         full_name:
 *           type: string
 *           description: The full name of the next of kin.
 *         relationship:
 *           type: string
 *           enum:
 *             - Parent
 *             - Spouse
 *             - Sibling
 *             - Child
 *             - Relative
 *             - Lawyer
 *             - Friend
 *           description: The relationship of the next of kin to the user.
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the next of kin.
 *         phone_number:
 *           type: string
 *           description: The phone number of the next of kin.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the record was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the record was last updated.
 * /next-of-kin:
 *   post:
 *     summary: Create a new next of kin record
 *     tags: [Next of Kin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: The full name of the next of kin.
 *               relationship:
 *                 type: string
 *                 description: The relationship of the next of kin to the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the next of kin.
 *               phone_number:
 *                 type: string
 *                 description: The phone number of the next of kin.
 *     responses:
 *       200:
 *         description: Next of kin record created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NextOfKin'
 *       400:
 *         description: You already have an existing next of kin. Please update it.
 *       500:
 *         description: Internal server error.
 *   get:
 *     summary: Get a next of kin record of logged in user
 *     tags: [Next of Kin]
 *     responses:
 *       200:
 *         description: Next of kin record retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NextOfKin'
 *       500:
 *         description: Internal server error.
 * /next-of-kin/{id}:
 *   patch:
 *     summary: Update  next of kin record of logged in user
 *     tags: [Next of Kin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the next of kin record to update.
 *     requestBody:
 *       required: []
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: The full name of the next of kin.
 *                 nullable: true
 *               relationship:
 *                 type: string
 *                 enum:
 *                   - Parent
 *                   - Spouse
 *                   - Sibling
 *                   - Child
 *                   - Relative
 *                   - Lawyer
 *                   - Friend
 *                 description: The relationship of the next of kin to the user.
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the next of kin.
 *                 nullable: true
 *               phone_number:
 *                 type: string
 *                 description: The phone number of the next of kin.
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Next of kin record updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NextOfKin'
 *       404:
 *         description: Next of kin record not found.
 *       500:
 *         description: Internal server error.
 * /next-of-kin/record/{id}:
 *   patch:
 *     summary: Soft delete a next of kin record
 *     tags: [Next of Kin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the next of kin record to delete.
 *     responses:
 *       200:
 *         description: Next of kin record deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the record was deleted.
 *       404:
 *         description: Next of kin record not found.
 *       500:
 *         description: Internal server error.
 */
