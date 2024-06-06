import express from 'express';
import nominateAdmin from './nominateAdmin';
import getNominatedAdmins from './getNominatedAdmins';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  nominateAdmin(router);
  getNominatedAdmins(router);

  baseRouter.use('/nominations', router);
};

