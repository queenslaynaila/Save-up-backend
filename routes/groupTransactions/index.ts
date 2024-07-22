import express from 'express';
import getTransactions from './getTransactions';
import getTransactionDetails from './getTransactionById';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  getTransactions(router); 
  getTransactionDetails(router);
  
  baseRouter.use('/group-transactions', router);
};