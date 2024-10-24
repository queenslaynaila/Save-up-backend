import { Router } from 'express';
import { z } from 'zod';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { userContactDetailsSchema, UserId } from './schema';
import { UserRole } from '../../globalTypes';

export const updatedUserSchema = userContactDetailsSchema.pick({
  full_name: true
}).extend({
  new_role: z.nativeEnum(UserRole)
});

export type UpdatedUser = z.infer<typeof updatedUserSchema>;

const SQL_UPDATE_ROLE = sql<{ targetUserId: string, role:UserRole, adminId: number }, UpdatedUser>(`
  SELECT * FROM update_user_role(:targetUserId, :role, :adminId);
`);

const userRoleBodySchema = z.object({
  role: z.nativeEnum(UserRole)
});

type UserRoleBodyType = z.infer<typeof userRoleBodySchema>;

export default (router: Router) => {
  router.patch<UserId, UpdatedUser, UserRoleBodyType, Record<string, never>>(
    '/:user_id/role',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    validateRequest({ body: userRoleBodySchema }),
    async (req, res) => {
      const targetUserId = req.params.user_id;
      const role = convertToTitleCase(req.body.role);

      const user = await SQL_UPDATE_ROLE({
        role,
        targetUserId,
        adminId: req.user!.id 
      }).one();

      res.json(user);
    }
  );
};