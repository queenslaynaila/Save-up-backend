import z from 'zod';
import Router from '../../router';
import { entityIdParamsSchema } from './schema';
import { decodeEntityAndVerifyAccess } from '../../utils';

const testRoute = (router: Router) => {
  router.post({
    path: '/:user_id/verify',
    summary: 'Verify user ID and upload documents',
    description: 'Route to verify a user’s identity by providing ID details and associated documents.',
    auth: true,
    schema: {
      params: z.object({
        user_id: entityIdParamsSchema
      }),
      query: z.object({
        notify: z.boolean().optional().describe('If true, send a notification after verification')
      }),
      body: z.object({
        id_details: z.object({
          id_type: z.enum(['NATIONAL_ID', 'PASSPORT']).describe('Type of identification document'),
          id_number: z.string().regex(/^(?:[A-Z]{1,2}\d{6,9}|\d{8,10}|\d{13}|\d{16})$/).describe('Identification number matching the selected type')
        }).describe('Object containing ID document details'),
        documents: z.array(
          z.object({
            name: z.string().describe('Document name, e.g., "Front of ID"'),
            url: z.string().url().describe('Link to the uploaded document')
          })
        ).describe('List of uploaded documents for verification')
      })
    },
    response: {
      schema: z.object({
        success: z.boolean().describe('Whether the verification succeeded'),
        verified_user: z.object({
          user_id: z.number().describe('User ID of the verified user'),
          verified_at: z.string().datetime().describe('Timestamp of when the user was verified')
        }).describe('An object with Information about the verified user')
      })
    },
    handler: async (req, res) => {
      const userId = await decodeEntityAndVerifyAccess(req);
      res.json({
        success: true,
        verified_user: {
          user_id: userId,
          verified_at: new Date().toISOString()
        }
      });
    }
  });
};

export default testRoute;
