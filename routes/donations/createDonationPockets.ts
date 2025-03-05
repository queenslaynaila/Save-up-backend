import { z } from "zod";
import Router from "../../router";
import { sql } from "../../db";
import verifyGroupMembership from '../../utils';
import logger from "../../logger";

const donationParams = z.object({
  group_id: z.number().int(),
  name: z.string(),
  description: z.string(),
  images: z.array(z.string()).nullable().optional(),
  target_amount: z.number(),
  target_at: z.string(),
});

const SQL_CREATE_DONATION_FUND = sql<{
  group_id: number;
  name: string;
  target_amount: number;
  target_at: string;
}, {
  xid: number;
  category_id: number;
  name: string;
  status: "In Progress" | "Completed";
  pocket_type: "Standard" | "Locked";
  target_amount: number;
  target_at: string;
  created_at: string;
}>(`
  INSERT INTO pockets(entity_id, xid, category_id, name, target_amount, target_at)
  SELECT 
      :group_id,
      COALESCE(MAX(xid), 0) + 1,
      (SELECT id FROM categories WHERE name = 'Donations' LIMIT 1),
      :name,
      :target_amount,
      :target_at
  FROM pockets
  WHERE entity_id = :group_id
  RETURNING 
      xid, 
      category_id, 
      name, 
      priority, 
      status, 
      pocket_type, 
      target_amount,  
      target_at, 
      created_at
`);

const SQL_LINK_DONATION_DETAILS = sql<{
  group_id: number;
  pocket_id: number;
  description: string;
  images: string[];
}, {
  description: string;
  images: string[];
}>(`
  INSERT INTO donation_pockets (entity_id, pocket_id, description, images)
  VALUES (:group_id, :pocket_id, :description, :images)
  RETURNING description, images
`);

const createFundraiser = (router: Router) => {
  router.route({
    method: "post",
    path: "/",
    summary: "Create a fundraiser",
    request: {
      body:donationParams
    },
    response: {
      201: {
        schema: donationParams.pick({
          name: true,
          description: true,
          target_amount: true,
          target_at: true,
          images: true
        }).extend({
          xid: z.number(),
          pocket_type: z.string(),
          status: z.string(),
          created_at: z.string().datetime(),
          category_id: z.number()
        }),
      },
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership()],
    handler: async (req, res) => {
      const { 
        group_id, 
        name, 
        description, 
        target_amount, 
        target_at, 
        images
      } = req.body;

      await sql.transaction(async (trx) => {
        const fundraiser = await SQL_CREATE_DONATION_FUND({
          group_id,
          name,
          target_amount,
          target_at,
        }).using(trx).one().catch((err) => {
          logger.info(`error one is ${err}`)
          throw err
        });
;

        const fundraiserDetails = await SQL_LINK_DONATION_DETAILS({
          group_id,
          pocket_id: fundraiser.xid,
          description,
          images: images ?? [],
        }).using(trx).one().catch((err) => {
          logger.info(`error is ${err}`)
          throw err
        });

        res.json({
          xid: fundraiser.xid,
          category_id: fundraiser.category_id,
          name: fundraiser.name,
          description: fundraiserDetails.description,
          images: fundraiserDetails.images,
          pocket_type: fundraiser.pocket_type,
          status: fundraiser.status,
          target_amount: fundraiser.target_amount,
          target_at: fundraiser.target_at,
          created_at: fundraiser.created_at
        });
      });
    },
  });
};

export default createFundraiser;