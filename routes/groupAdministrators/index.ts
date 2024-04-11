import express from 'express';
import makeGroupAdmin from './makeGroupAdmin';


export default (baseRouter: express.Router) => {
  const router = express.Router();
  makeGroupAdmin(router);
  
  baseRouter.use('/groups', router);
};
