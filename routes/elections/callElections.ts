import { sql } from '../../db';
import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { ElectionInterface, ElectionSchema, ElectionResponse} from '../../types';

const SQL_CREATE_ELECTION = sql< ElectionInterface, ElectionResponse>(`
  INSERT INTO elections (id,group_id,caller_id, election_name ,start_at,end_at )
  SELECT COALESCE((SELECT MAX(id) FROM elections WHERE group_id = :group_id), 0) + 1,
  SELECT :group_id,:caller_id,election_name,:start_at,:end_at
  WHERE NOT EXISTS (
    SELECT 1
    FROM elections
    WHERE group_id = :group_id AND end_time > NOW()
  )
  RETURNING id, group_id, name, caller_id, start_time, end_time, created_at;
`);

export default (router: Router) => { 
  router.post<Record<string, never>, ElectionResponse ,ElectionInterface,Record<string, never>, Record<string, never>>(
    '/',
    authMiddleware(),
    validateRequest(ElectionSchema),
    async (req, res) => {
      const user_id= req.user!.id
      const { group_id,election_name,start_at,end_at} = req.body;
      const newElection = await SQL_CREATE_ELECTION({ group_id,caller_id:user_id,election_name,start_at,end_at}).oneOrNull();
      if (!newElection) {
        throw new HttpError(400, 'Cannot create a new election. An active election already exists for this group.');
      }
      res.json(newElection);
    }
  );
};
