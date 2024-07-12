import { Router } from 'express';
import { sql } from '../../db';
import  authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { groupCreationValidation, 
  GroupCreationValidation, 
  GroupUpdateInterface 
} from './types';
import { headersSchema, IdParamInterface, idParamSchema } from '../../globalTypes/index';

const SQL_UPDATE_GROUP = sql<GroupUpdateInterface, GroupUpdateInterface>(`
   SELECT * FROM update_group_name(:id, :user_id, :name)
`);

export default (router: Router) => {
  router.patch<IdParamInterface, GroupUpdateInterface, GroupCreationValidation, 
  Record<string,never>>(
    '/:id',
    validateRequest({
      headers: headersSchema, 
      params: idParamSchema,
      body:  groupCreationValidation
    }),
    authMiddleware(),
    async (req, res) => {
      const updatedGroup =  await SQL_UPDATE_GROUP({ 
        ...req.body, id:parseInt(req.params.id), user_id:req.user!.id
      }).one();
      res.json(updatedGroup);
    }
  );
};