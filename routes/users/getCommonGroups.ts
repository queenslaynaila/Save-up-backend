import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { Group, group } from '../groups/createGroups';

const SQL_GET_COMMON_GROUPS = sql< { logged_in_user_id: number, peer_user_id: number }, Group>(`
  SELECT groups.id, 
         groups.name, 
         groups.created_at
  FROM groups
  JOIN group_members
    USING (group_id)
  JOIN group_members AS group_members_peer
    USING (group_id)
  WHERE group_members.user_id = :logged_in_user_id
    AND group_members_peer.user_id = :peer_user_id
    AND group_members.is_active = TRUE
    AND group_members_peer.is_active = TRUE
    AND groups.deleted_at IS NULL;
`);

const getCommonGroups = (router:Router) => {
  router.route({
    method: 'get',
    path: '/:peer_user_id/shared-groups',
    summary: 'View common groups between a logged in user and a peer user.',
    request: {
      params: z.object({
        peer_user_id: z.string()
      })
    },
    response: {
      200: {
        schema: z.array(group)
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const logged_in_user_id = req.user!.id;
      const peer_user_id = Number(req.params.peer_user_id);
      const commonGroups = await SQL_GET_COMMON_GROUPS({
        logged_in_user_id,
        peer_user_id
      }).many();
      return res.json(commonGroups);
    }
  });
};

export default getCommonGroups;