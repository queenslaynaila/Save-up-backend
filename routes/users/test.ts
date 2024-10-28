import { Router } from 'express';

export default (router: Router) => {
  router.get(
    '/test',
    async (_req, res) => {
      res.send('App is ready!');
    }
  );
};