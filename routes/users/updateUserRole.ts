import { Router } from 'express';
import { z } from 'zod';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { userContactDetailsSchema, UserRole } from './types';
import { HttpError } from '../../middleware/errorMiddleware';

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
type RoleParams = z.infer<typeof roleSchema>;

export default (router: Router) => {
  router.patch<{ user_id:string }, UpdatedUser, RoleParams, Record<string, never>>(
    '/:user_id/role',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    validateRequest({ body: roleSchema }),
    async (req, res) => {
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
  );
};