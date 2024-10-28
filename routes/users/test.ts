import { Router } from 'express';

export default (router: Router) => {
  router.get(
    '/:',
    async (_req, res) => {
      res.send('App is ready!');
    }
  );
};