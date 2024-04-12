import express from 'express';
import sendInvite from './sendInvite';
import respondToInvite from './respondToInvite';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  sendInvite(router);
  respondToInvite(router);
  baseRouter.use('/invitations', router);
};