import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';


const getDepositStats = (router: Router) => {
    router.route({
        method: 'post',
        path: '/transactions/stats/deposits',
        summary: 'Get withdrawal stats',
        auth: true,
        schema: {
            query: z.object({
                entity_id: z.number().int().min(1),
                agg: z.enum(['avg', 'sum', 'count', 'min', 'max']),
                group: z.enum(['hour','day', 'week', 'month', 'year']),
                start_date: z.string().datetime(),
                end_date: z.string().datetime()
            })
        },
        handler: async (req, res) => {
            const entityId =req.query.entity_id;


            res.sendStatus(200);
        }
    });
};

export default getDepositStats;