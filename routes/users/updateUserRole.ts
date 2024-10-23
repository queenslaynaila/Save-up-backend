import { Router } from 'express';
import { z } from 'zod';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { UserRole } from '../../globalTypes';
import { userContactDetailsSchema } from './schema';

export const updatedUserSchema = userContactDetailsSchema.pick({
  full_name: true
}).extend({
  new_role: z.nativeEnum(UserRole)
});

export type UpdatedUser = z.infer<typeof updatedUserSchema>;

const SQL_UPDATE_ROLE = sql<{ targetUserId: string, role: UserRole, adminId: number }, UpdatedUser>(`
  SELECT * FROM update_user_role(:targetUserId, :role, :adminId);
`);


const userRoleParamSchema = z.object({
  id: z.string(),
  role: z.nativeEnum(UserRole)
});

export default (router: Router) => {
  router.patch<{ role: UserRole, id: string }, UpdatedUser, Record<string, never>, Record<string, never>>(
    '/:id/:role',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    validateRequest({ params: userRoleParamSchema }),
    async (req, res) => {
      const role = convertToTitleCase(req.params.role);
      const targetUserId = req.params.id;
      
      const user = await SQL_UPDATE_ROLE({
        role,
        targetUserId,
        adminId: req.user!.id 
      }).one();

      res.json(user);
    }
  );
};