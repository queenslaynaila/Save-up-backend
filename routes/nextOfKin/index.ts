import express from 'express';
import createKin from './createKin';
import deleteKin from './deleteKin';
import updateKin from './updateKin';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createKin(router);
  deleteKin(router);
  updateKin(router);
  baseRouter.use('/next-of-kin', router);
};

/**
 * @swagger
 * components:
 *   schemas:
 *     NextOfKin:
 *       type: object
 *       required:
 *         - id
 *         - full_name
 *         - relationship
 *         - email
 *         - phone_number
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the next of kin record.
 *         full_name:
 *           type: string
 *           description: The full name of the next of kin.
 *         relationship:
 *           type: string
 *           description: The relationship of the next of kin to the user.
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the next of kin.
 *         phone_number:
 *           type: string
 *           description: The phone number of the next of kin.
 *       example:
 *         id: 1
 *         full_name: "Jane Doe"
 *         relationship: "Mother"
 *         email: "jane.doe@example.com"
 *         phone_number: "+254712345678"
 */

/**
 * @swagger
 * tags:
 *   name: Next of Kin
 *   description: The next of kin management API endpoints
*/

/**
 * @swagger
 * /next-of-kin:
 *   post:
 *     summary: Create a new next of kin record
 *     tags: [Next of Kin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NextOfKin'
 *     responses:
 *       200:
 *         description: Next of kin record created successfully.
 *       400:
 *         description: Error occurred during next of kin record creation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 *   get:
 *     summary: Get all next of kin records
 *     tags: [Next of Kin]
 *     responses:
 *       200:
 *         description: List of next of kin records.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NextOfKin'
 *       500:
 *         description: Internal server error.
 * 
 * /next-of-kin/{id}:
 *   patch:
 *     summary: Update a next of kin record
 *     tags: [Next of Kin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the next of kin record to delete.
 *     responses:
 *       200:
 *         description: Next of kin record deleted successfully.
 *       404:
 *         description: Next of kin record not found.
 *       500:
 *         description: Internal server error.
 * /next-of-kin/record/{id}:
 *   patch:
 *     summary: Soft Delete a next of kin record
 *     tags: [Next of Kin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the next of kin record to delete.
 *     responses:
 *       200:
 *         description: Next of kin record deleted successfully.
 *       404:
 *         description: Next of kin record not found.
 *       500:
 *         description: Internal server error.
 */
