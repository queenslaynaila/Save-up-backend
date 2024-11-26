import { z } from 'zod';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { userContactDetailsSchema, userRoleHistorySchema } from './schema';
import { HttpError } from '../../middleware/errorMiddleware';
import Router from '../../router';
import logger from '../../logger';
import { UserRole } from '../../globalTypes';

const updatedUserSchema = userContactDetailsSchema.pick({
  full_name: true
}).extend({
  new_role: z.nativeEnum(UserRole)
});

type UpdatedUser = z.infer<typeof updatedUserSchema>;

const SQL_UPDATE_ROLE = sql<{ targetUserId: string, role:UserRole, adminId: number }, UpdatedUser>(`
  SELECT * FROM update_user_role(:targetUserId, :role, :adminId);
`);

const updateUserRole = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:user_id/role',
    summary: 'Update a user\'s role',
    description: 'Accesing this endpoint requires admin privileges',
    schema: {
      body: userRoleHistorySchema.pick({ role: true }),
      params: z.object({ user_id: z.string() })
    },
    response: {
      schema: updatedUserSchema
    },
    middlewares: [authMiddleware({ roles: [UserRole.ADMIN] })],
    handler: async (req, res) => {
      const userId = req.params.user_id;
      logger.error(req.user!.role);
      const role = convertToTitleCase(req.body.role);

      const user = await SQL_UPDATE_ROLE({
        targetUserId: userId,
        role,
        adminId: req.user!.id
      }).one().catch(err => {
        if (err.code === 'P0002') {
          throw new HttpError(403);
        }
        if (err.code === 'P0003') {
          throw new HttpError(400, { message: 'INVALID_USER' });
        }
        throw err;
      });

      res.json(user);
    }
  });
};

export default updateUserRole;