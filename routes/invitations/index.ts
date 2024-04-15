import express from 'express';
import sendGroupInvite from './sendGroupInvite';
import getUserInvites from './getUserInvites';
import respondToGroupInvite from './respondToGroupInvites';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  sendGroupInvite(router);
  getUserInvites(router);
  respondToGroupInvite(router);
  
  baseRouter.use('/invitations', router);
};