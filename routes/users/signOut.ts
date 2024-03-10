import { Router } from 'express';
import authMiddleware from '../../middleware/auth';

export default (router: Router) => {
  router.post<
  Record<string, never>,
  { message: string },
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
  >('/signout', authMiddleware(), async (_, res) => {
    res.removeHeader('X-Auth-Token');
    return res.json({ message: 'Logout successful' });
  });
};
