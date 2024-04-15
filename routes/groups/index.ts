import express from 'express';
import createGroup from './createGroups';
import UpdateGroupDetails from './updateGroupDetails';
import getUserGroups from './getUserGroups';
import getGroupMembers from './getGroupMembers';
import getCommonGroups from './getCommonGroups';
import leaveGroup from './leaveGroup';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  createGroup(router);
  getUserGroups(router);
  getGroupMembers(router);
  UpdateGroupDetails(router);
  getCommonGroups(router);
  leaveGroup(router);

  baseRouter.use('/groups', router);
};

