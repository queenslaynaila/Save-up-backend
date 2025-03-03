import { z } from "zod";
import Router from "../../router";
import { sql } from "../../db";

const donationParams = z.object({
  group_id: z.number().positive(),
  name: z.string(),
  description: z.string(),
  target_amount: z.number(),
  target_at: z.string(),
});

const SQL_CREATE_POCKET = sql<{
  group_id: number;
  name: string;
  pocket_type: "Standard" | "Locked";
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
  INSERT INTO pockets (entity_id, xid, category_id, name, pocket_type, target_amount, target_at)
  SELECT 
      :group_id,
      COALESCE(MAX(xid), 0) + 1,
      (SELECT id FROM categories WHERE name = 'Donations' LIMIT 1),
      :name,
      :pocket_type,
      :target_amount,
      :target_at
  FROM pockets 
  WHERE entity_id = :group_id
  RETURNING +
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

const SQL_CREATE_DONATION_POCKET = sql<{
  group_id: number;
  pocket_id: number;
  description: string;
  //images: string[];
}, {
  description: string;
  images: string[];
}>(`
  INSERT INTO donation_pockets (entity_id, pocket_id, description, images)
  VALUES (:group_id, :pocket_id, :description, COALESCE(:images, '[]'))
  RETURNING description, images
`);

const createDonations = (router: Router) => {
  router.route({
    method: "post",
    path: "/",
    summary: "Create a donation",
    request: {
      body: donationParams,
    },
    response: {
      201: {
        schema: donationParams.pick({
          name: true,
          description: true,
          target_amount: true,
          target_at: true,
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
    handler: async (req, res) => {
      const { 
        group_id, 
        name, 
        description, 
        target_amount, 
        target_at, 
      } = req.body;

      await sql.transaction(async (trx) => {
        const pocket = await SQL_CREATE_POCKET({
          group_id,
          name,
          pocket_type: "Locked",
          target_amount,
          target_at,
        }).using(trx).one();

        const donationPocket = await SQL_CREATE_DONATION_POCKET({
          group_id,
          pocket_id: pocket.xid,
          description,
          // images: images || [],
        }).using(trx).one();

        res.status(201).json({
          xid: pocket.xid,
          category_id: pocket.category_id,
          name: pocket.name,
          description: donationPocket.description,
          // images: donationPocket.images,
          pocket_type: pocket.pocket_type,
          status: pocket.status,
          target_amount: pocket.target_amount,
          target_at: pocket.target_at,
          created_at: pocket.created_at
        });
      });
    },
  });
};

export default createDonations;
