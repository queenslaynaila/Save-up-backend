import { Router } from 'express';
import createAdmin from './createAdmin';
import getTableStats from './getTableStats';
import updateUserRole from './updateUserRole';
export default (baseRouter: Router) => {
  const router = Router();
  createAdmin(router);
  getTableStats(router);
  updateUserRole(router);

  baseRouter.use('/admin', router);
};

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
 *     responses:
 *       200:
 *         description: Admin created successfully.
 *       401:
 *         description: Unauthorized access. Only admins can create new admins.
 * 
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
 *       401:
 *         description: Unauthorized access. Only admins can access this endpoint.
 * 
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
 *         description: The role to update (User, Admin, Moderator).
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user whose role to update.
 *     responses:
 *       200:
 *         description: User role updated successfully.
 *       401:
 *         description: Unauthorized access. Only admins can update user roles.
 */
