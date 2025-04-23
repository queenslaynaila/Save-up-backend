import { z } from "zod";
import Router from "../../router";
import { sql } from "../../db";
import logger from "../../logger";
import { decodeEntityAndVerifyAccess } from "../../utils";
import { entityIdParamsSchema } from "../users/schema";

const donationParams = z.object({
  entity_id: z.number().int().min(1),
  name: z.string(),
  description: z.string(),
  images: z.array(z.string()).nullable().optional(),
  currency: z.string(),
  target_amount: z.number(),
  target_at: z.string().date(),
});

const SQL_CREATE_DONATION_FUND = sql<{
  entity_id: number;
  name: string;
  target_amount: number;
  target_at: string;
  wallet_id:number;
}, {
  xid: number;
  category_id: number;
  name: string;
  status: "In Progress" | "Completed";
  pocket_type: "Standard" | "Locked";
  currency: string;
  target_amount: number;
  target_at: string;
  created_at: string;
}>(`
  INSERT INTO pockets(entity_id, xid, category_id, name, target_amount, target_at, currency)
  SELECT 
      :entity_id,
      COALESCE(MAX(xid), 0) + 1,
      (SELECT id FROM categories WHERE name = 'Donations' LIMIT 1),
      :name,
      :target_amount,
      :target_at,
      (SELECT currency FROM pockets WHERE entity_id = :entity_id AND xid = :wallet_id)
  FROM pockets
  WHERE entity_id = :entity_id
  RETURNING 
      xid, 
      category_id, 
      name, 
      priority, 
      status, 
      pocket_type, 
      currency,
      target_amount,  
      target_at, 
      created_at
`);

const SQL_LINK_DONATION_DETAILS = sql<{
  entity_id: number;
  pocket_id: number;
  description: string;
  images: string[];
}, {
  description: string;
  images: string[];
}>(`
  INSERT INTO donation_pockets (entity_id, pocket_id, description, images)
  VALUES (:entity_id, :pocket_id, :description, :images)
  RETURNING description, images
`);

const createFundraiser = (router: Router) => {
  router.post({
    path: "/:entity_id/donations",
    summary: "Create a donation pocket/fundraiser",
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      body:donationParams.pick({
        name: true,
        description: true,
        images: true,
        target_amount: true,
        target_at: true
      })
    },
    response: {
        schema: donationParams.pick({
          name: true,
          description: true,
          currency: true,
          target_amount: true,
          target_at: true,
          images: true
        }).extend({
          xid: z.number().int().min(1),
          pocket_type: z.string(),
          status: z.string(),
          created_at: z.string().datetime(),
          category_id: z.number()
        }),
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req)
      const {
        name,
        description,
        target_amount,
        target_at,
        images
      } = req.body;

      await sql.transaction(async (trx) => {
        const fundraiser = await SQL_CREATE_DONATION_FUND({
          entity_id:entityId,
          wallet_id:1,
          name,
          target_amount,
          target_at,
        }).using(trx).one().catch((err) => {
          logger.info(`error one is ${err}`)
          throw err
        });

        const fundraiserDetails = await SQL_LINK_DONATION_DETAILS({
          entity_id:entityId,
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
          currency:fundraiser.currency,
          target_amount: fundraiser.target_amount,
          target_at: fundraiser.target_at,
          created_at: fundraiser.created_at
        });
      });
    },
  });
};

export default createFundraiser;