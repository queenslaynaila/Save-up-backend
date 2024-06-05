import express from 'express';
import sendInvite from './sendInvite';
import getInvites from './getInvites';
import updateInvites from './updateInvites';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  sendInvite(router);
  getInvites(router);
  updateInvites(router);
  
  baseRouter.use('/invitations', router);
};