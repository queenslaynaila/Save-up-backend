import { z } from "zod";
import Router from "../../router";
import { sql } from "../../db";
import verifyGroupMembership from '../../utils';

const SQL_GET_DONATION_POCKETS = sql<{
  group_id: number;
}, {
  xid: number;
  category_name: string;
  name: string;
  description: string;
  target_amount: number;
  amount_raised: number;
  target_at: string;
  images: string[];
  created_at: string;
}>(`
  SELECT 
      pockets.xid,
      categories.name AS category_name,
      pockets.name,
      donation_pockets.description,
      pockets.target_amount,
      pockets.target_at,
      COALESCE((
          SELECT balance 
          FROM transactions 
          WHERE transactions.entity_id = pockets.entity_id
          AND transactions.pocket_id = pockets.xid
          ORDER BY transactions.xid DESC 
          LIMIT 1
      ), 0) AS amount_raised,
      donation_pockets.images,
      pockets.created_at
  FROM donation_pockets
  JOIN pockets 
      ON donation_pockets.entity_id = pockets.entity_id 
      AND donation_pockets.pocket_id = pockets.xid
  JOIN categories 
      ON pockets.category_id = categories.id
  WHERE pockets.entity_id = :group_id
  ORDER BY pockets.created_at DESC
`);


const getDonationPockets = (router: Router) => {
  router.route({
    method: "get",
    path: "/:group_id",
    summary: "Get all donation pockets for a group",
    request: {
      params: z.object({
        group_id: z.string(),
      })
    },
    response: {
      200: {
        schema: z.array(
          z.object({
            xid: z.number(),
            category_name: z.string(),
            name: z.string(),
            description: z.string(),
            images: z.array(z.string()),
            target_amount: z.number(),
            amount_raised: z.number(),
            target_at: z.string(),
            created_at: z.string()
          })
        ),
      },
    },
    authMiddlewareOptions: {},
    middlewares:[verifyGroupMembership(true)],
    handler: async (req, res) => {
      const group_id  = Number(req.params.group_id);
      const pockets = await SQL_GET_DONATION_POCKETS({ 
        group_id
      }).many();
      res.json(pockets);
    },
  });
};

export default getDonationPockets;
