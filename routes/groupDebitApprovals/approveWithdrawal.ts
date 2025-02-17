import Router from '../../router';
import { sql } from '../../db';
import { approveValidation, ApproveWithdrawal } from './types';
import { z } from 'zod';
import { SQL_GET_USER_PIN } from '../users/updateAttributes';
import HttpError from '../../httpError';
import bcrypt from 'bcrypt';

const SQL_APPROVE_GRP_WITHDRAWAL = sql<ApproveWithdrawal, Record<string, never>>(`
  SELECT approve_debit(
    :group_id,
    :request_id,
    :admin_id,
    :status,
    :reason
  )
`);

const approveWithdrawal = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Approve or reject group withdrawal',
    description: 'Allows admins to approve or reject withdrawal requests with PIN verification',
    request: {
      body: approveValidation.extend({
        pin: z.number().min(1000).max(9999)
      })
    },
    response: {
      201: {},
      403: { schema: z.object({ message: z.string() }) }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { pin, ...approvalData } = req.body;
      const { pin: currentPin } = await SQL_GET_USER_PIN({
        id: req.user!.id
      }).one();
      
      const isValidPin = await bcrypt.compare(pin.toString(), currentPin);
      if (!isValidPin) {
        throw new HttpError(403, { message: 'Invalid PIN' });
      }

      await SQL_APPROVE_GRP_WITHDRAWAL({
        ...approvalData,
        admin_id: req.user!.id
      }).exec();

      res.sendStatus(201);
    }
  });
};

export default approveWithdrawal;