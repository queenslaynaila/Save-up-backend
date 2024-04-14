import express from 'express';
import sendInvite from './sendInvite';
import getMyInvites from './getMyInvites';
import respondToInvite from './respondToInvite';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  sendInvite(router);
  getMyInvites(router);
  respondToInvite(router);
  baseRouter.use('/invitations', router);
};