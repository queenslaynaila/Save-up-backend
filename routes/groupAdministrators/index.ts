import express from 'express';
import makeGroupAdmin from './makeGroupAdmin';
import nominateAdmin from './nominateAdmin';
import getNominatedAdministrators from './getNominatedAdministrators';
import approveNomination from './approveNomination';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  makeGroupAdmin(router);
  nominateAdmin(router);
  getNominatedAdministrators(router)
  approveNomination(router);
  
  baseRouter.use('/group-admin', router);
};