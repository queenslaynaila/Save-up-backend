import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
export default (router: Router) => {
  router.post(
    '/signout',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      res.clearCookie('auth_token');
      return res.json({ message: 'Logout successful' });
    }
  );
};
