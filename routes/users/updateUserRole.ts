import { z } from 'zod';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { userContactDetailsSchema, UserRole } from './types';
import { HttpError } from '../../middleware/errorMiddleware';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import Router from '../../router';

extendZodWithOpenApi(z);

export const updatedUserSchema = userContactDetailsSchema.pick({
  full_name: true
}).extend({
  new_role: z.nativeEnum(UserRole)
});

export type UpdatedUser = z.infer<typeof updatedUserSchema>;

const SQL_UPDATE_ROLE = sql<{ targetUserId: string, role:UserRole, adminId: number }, UpdatedUser>(`
  SELECT * FROM update_user_role(:targetUserId, :role, :adminId);
`);

const roleSchema = z.object({ role: z.nativeEnum(UserRole) });

const updateUserRole = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:user_id/role',
    summary: 'Update a user\'s role',
    schema: {
      body: roleSchema,
      params: z.object({
        user_id: z.string()
      }).openapi({ description: 'User ID' })
    },
    response: {
      schema: updatedUserSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const userId = req.params.user_id;
      const role = convertToTitleCase(req.body.role);

      const user = await SQL_UPDATE_ROLE({
        role,
        targetUserId: userId,
        adminId: req.user!.id
      }).one().catch(err => {
        if (err.code === 'P0002') {
          throw new HttpError(403);
        }
        throw err;
      });

      res.json(user);
    }
  });
};

export default updateUserRole;