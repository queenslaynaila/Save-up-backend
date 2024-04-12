import express from 'express';
import createGroup from './createGroups';
import UpdateGroup from './UpdateGroup';
import getUserGroups from './getUserGroups';
import getGroupMembers from './getGroupMembers';
import getCommonGroups from './getCommonGroups';
import ExitGroup from './ExitGroup';

export default (baseRouter: express.Router) => {

  const router = express.Router();
  createGroup(router);
  UpdateGroup(router);
  getUserGroups(router);
  getGroupMembers(router);
  getCommonGroups(router);
  ExitGroup(router);

  baseRouter.use('/groups', router);
};

