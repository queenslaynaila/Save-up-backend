import { Router } from 'express';

export default (router: Router) => {
  router.get('/users/test', async (_req, res) => {
    res.json({ message: 'App is ready!' });
  });
};
