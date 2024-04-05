import express from 'express';
import createGoal from './createGoal';
import deleteGoal from './deleteGoal';
import getGoalsByConditions from './getGoalsByConditions';
import updateGoal from './updateGoal';
import  getGoalByGoalID from './getGoalByGoalID';

export type savingInterface = {
  id: number;
  user_id: number;
  description: string;
  category_id: number;
  priority: string;
  status: string;
  target_amount: number;
  target_at: string;
  start_at: Date;
  created_at: Date;
  updated_at: Date;
  completed_at:Date;
  deleted_at:Date;
}

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createGoal(router);
  deleteGoal(router);
  getGoalsByConditions(router);
  updateGoal(router);
  getGoalByGoalID(router);

  baseRouter.use('/goals', router);
};
