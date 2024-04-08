import express from 'express';
import createMessage from './createMessage';
import getAllMessages from './getAllMessages';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  createMessage (router);
  getAllMessages(router);

  baseRouter.use('/messages', router);
};
