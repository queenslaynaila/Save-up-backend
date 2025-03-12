import Router from '../../router';
import { sql } from '../../db';
import { Group, groupsSchema } from './schema';
import logger from '../../logger';

const SQL_CREATE_GROUP = sql<
Pick<Group, 'name' | 'creator_id'>,
Pick<Group, 'id' | 'name'|'created_at'>>(`
  SELECT * FROM create_group(:name, :creator_id)
`);

const createGroup = (router:Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a group',
    request: {
      body: groupsSchema.pick({ 
        name: true
      })
    },
    response: {
      201: {
        schema: groupsSchema.pick({ 
          id: true, 
          name: true, 
          created_at: true 
        })
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      logger.info(`Creating group for user_id: ${req.user!.id}`);
      const group = await SQL_CREATE_GROUP({
        creator_id: req.user!.id,
        name: req.body.name
      }).one();
      res.status(201).json(group);
    }
  });
};

export default createGroup;