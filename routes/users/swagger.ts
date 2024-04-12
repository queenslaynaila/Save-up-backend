/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - full_name
 *         - gender
 *         - national_id
 *         - phone_number
 *         - pin
 *       properties:
 *         full_name:
 *           type: string
 *           description: The full name of the user.
 *         gender:
 *           type: string
 *           enum: [Male, Female, Prefer not to say]
 *           description: The gender of the user.
 *         national_id:
 *           type: number
 *           description: The national ID of the user.
 *         phone_number:
 *           type: string
 *           description: The phone number of the user.
 *         pin:
 *           type: number
 *           description: The PIN of the user.
 *       example:
 *         full_name: John Doe
 *         gender: Male
 *         national_id: 12345678
 *         phone_number: "+254713518356"
 *         pin: 1234
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The user management API endpoints
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - gender
 *               - national_id
 *               - phone_number
 *               - pin
 *             properties:
 *               full_name:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Prefer not to say]
 *               national_id:
 *                 type: number
 *                 description: National ID with 8 digits.
 *               phone_number:
 *                 type: string
 *                 pattern: '^\+254\d{9}$'
 *                 description: Phone number with the format +254XXXXXXXXX (12 digits).
 *               pin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account created successfully. Proceed to login.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indicating successful account creation.
 *       400:
 *         description: Account with this Phone number already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 */

/**
 * @swagger
 * /users/signin:
 *   post:
 *     summary: Login 
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *               pin:
 *                 type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the user.
 *                 full_name:
 *                   type: string
 *                   description: The full name of the user.
 *                 gender:
 *                   type: string
 *                   description: The gender of the user.
 *                 role:
 *                   type: string
 *                   description: The role of the user.
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time when the user account was created.
 *         headers:
 *           Refresh-token:
 *             description: The refresh token for the user session.
 *             schema:
 *               type: <Bearer> string
 *           Authorization:
 *             description: The access token for the user session.
 *             schema:
 *               type: <Bearer>string
 *       400:
 *         description: Invalid phone number or password combination..
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 */


/**
 * @swagger
 * /users/signout:
 *   post:
 *     summary: Logout 
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /users/update-phone/{id}:
 *   patch:
 *     summary: Update the phone number of a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user whose phone number to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pin
 *               - phone_number
 *             properties:
 *               pin:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 4
 *               phone_number:
 *                 type: string
 *                 pattern: '^\+254\d{9}$'
 *                 description: Phone number with the format +254XXXXXXXXX (12 digits).
 *           example:
 *             pin: "1234"
 *             phone_number: "+254713518356"
 *     responses:
 *       200:
 *         description: Phone number updated. For continued security, please log in again with your new phone number.
 *       404:
 *         description: Not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 *       401:
 *         description: Invalid password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 */

/**
 * @swagger
 * /users/{targetUser}:
 *   get:
 *     summary: Get users by various conditions
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: targetUser
 *         schema:
 *           type: string
 *         required: true
 *         description: |
 *           Defines the scope of users to retrieve.Can be one of the following:
 *           - "me": Retrieves information about the currently logged-in user.
 *           - "all": Retrieves information about all users (requires Admin or Moderator role).
 *           - A positive integer: Retrieves information about a specific user based on their ID (requires Admin or Moderator role).
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: |
 *           Filter users by role. Can be one of the following: 'User', 'Admin', 'Moderator' (case-sensitive).Optiona;
 *     responses:
 *       200:
 *         description: Array of users matching the specified conditions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'  # Assuming you have a User schema defined
 *       400:
 *         description: Bad request. Invalid targetUser value or missing required filter parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 *       401:
 *         description: Unauthorized. Access denied due to insufficient permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 *       403:
 *         description: Forbidden. User lacks permission to retrieve all users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for failure.
 *     requestBody:
 *       required: false  # Remove required attribute if optional filtering is allowed
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pin:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 4
 *               phone_number:
 *                 type: string
 *                 pattern: '^\+254\d{9}$'
 *                 description: Phone number with the format +254XXXXXXXXX (12 digits).
 *             example:
 *               pin: "1234"
 *               phone_number: "+254713518356"
 */
