import express from 'express';
import createGroup from './createGroups';
import UpdateGroup from './UpdateGroup';
import createGroupGoal from './createGroupGoal';
import FetchGroupGoals from './FetchGroupGoals';
import getUserGroups from './getUserGroups';
import getGroupMembers from './getGroupMembers';
import getGroupAdmin from './getGroupAdmin';
import ExitGroup from './ExitGroup';

export default (baseRouter: express.Router) => {

  const router = express.Router();
  createGroup(router);
  UpdateGroup(router);
  createGroupGoal(router);
  FetchGroupGoals(router);
  getUserGroups(router);
  getGroupMembers(router);
  getGroupAdmin(router);
  ExitGroup(router);

  baseRouter.use('/groups', router);
};
