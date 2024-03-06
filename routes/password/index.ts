import express from 'express';

import resetPassword from './resetPassword';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  resetPassword(router);

  baseRouter.use('/password', router);
};
