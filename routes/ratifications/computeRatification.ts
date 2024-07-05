import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { ratificationValidation,  
  RatificationResultsInterface, 
  ComputeRatificationInterface 
} from './types';

const  SQL_COMPUTE_RATIFICATIONS = sql<ComputeRatificationInterface
,RatificationResultsInterface>(`
  SELECT * FROM compute_ratification_results(:p_group_id, :p_election_id, :p_user_id)
`);

export default (router: Router) => {
  router.post<Record<string,never>, RatificationResultsInterface, 
  ComputeRatificationInterface,Record<string,never>>(
    '/',
    validateRequest(ratificationValidation ),
    authMiddleware(),
    async (req, res) => {
      await SQL_COMPUTE_RATIFICATIONS({
        ...req.body, user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  );
};