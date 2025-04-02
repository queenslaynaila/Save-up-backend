import { z } from "zod";
import Router from "../../router";
import { sql } from "../../db";
import { decodeEntityAndVerifyAccess } from "../../utils";
import { entityIdParamsSchema } from "../users/schema";

const SQL_GET_DONATION_POCKETS = sql<{
  entity_id: number;
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
  WHERE pockets.entity_id = :entity_id
  ORDER BY pockets.created_at DESC
`);


const getDonationPockets = (router: Router) => {
  router.route({
    method: "get",
    path:  "/:entity_id/donations",
    summary: "Get all donation pockets for a group",
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema,
      })
    },
    response: {
        schema: z.array(
          z.object({
            xid: z.number().int().min(1),
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
    auth: true,
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req);
      const pockets = await SQL_GET_DONATION_POCKETS({ 
        entity_id: groupId
      }).many()
      res.json(pockets);
    },
  });
};

export default getDonationPockets;
