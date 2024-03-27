import { FastifyInstance } from 'fastify';
import createSaving from './createSaving';
import deleteSaving from './deleteSaving';
import getSavingsByConditions from './getSavingsByConditions';
import getSavingBySavingID from './getSavingBySavingID';
import updateSaving from './updateSaving';

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

export default (fastify: FastifyInstance) => {

  createSaving(fastify);
  deleteSaving(fastify);
  getSavingsByConditions(fastify);
  updateSaving(fastify);
  getSavingBySavingID(fastify);

};
