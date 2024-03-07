import { Router } from 'express';
import authMiddleware from '../../middleware/auth';

export default (router: Router) => {
  router.post('/signout', authMiddleware(), async (_, res) => {
    res.removeHeader('X-Auth-Token');
    return res.json({ message: 'Logout successful' });
  });
};
