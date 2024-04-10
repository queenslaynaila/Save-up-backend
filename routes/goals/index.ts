import express from 'express';
import createGoal from './createGoal';
import deleteGoal from './deleteGoal';
import getGoalsByConditions from './getGoalsByConditions';
import updateGoal from './updateGoal';
import  getGoalByGoalID from './getGoalByGoalID';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createGoal(router);
  deleteGoal(router);
  getGoalsByConditions(router);
  updateGoal(router);
  getGoalByGoalID(router);

  baseRouter.use('/goals', router);
};
