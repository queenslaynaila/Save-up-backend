import { FastifyInstance } from 'fastify';
import updatePassword from './updatePassword';
import {
  initiatePasswordReset,
  verifyPasswordResetToken,
  verifySecurityAnswers,
  resetPassword,
} from './ForgetPasswordRoutes';

export default (fastify: FastifyInstance) => {

  updatePassword(fastify);
  initiatePasswordReset(fastify);
  verifyPasswordResetToken(fastify);
  verifySecurityAnswers(fastify);
  resetPassword(fastify);

};
