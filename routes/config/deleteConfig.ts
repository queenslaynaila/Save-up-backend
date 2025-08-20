import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../core/router';

const SQL_UPDATE_CONFIG = sql<{ id: number }, Record<string, never>>(`
  UPDATE country_configurations
    SET deleted_at = NOW
  WHERE id = :id
    AND deleted_at IS NULL;
`);

const deleteConfiguration = (router: Router) => {
  router.delete({
    path: '/:id',
    summary: 'Delete a configuration',
    schema: {
      params: z.object({
        id: z.number()
      })
    },
    handler: async (req, res) => {
      await SQL_UPDATE_CONFIG({
        id: req.params.id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default deleteConfiguration;