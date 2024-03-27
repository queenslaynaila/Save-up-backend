import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
//import {resetPasswordLimiter } from '../../services/rateLimit'


const SQL_UPDATE_PASSWORD = sql<{ password: string; phone_number: string },{ phone_number: string }>(`
  UPDATE users SET password =:password WHERE  phone_number= :phone_number 
`);


export default (fastify: FastifyInstance) => {
  fastify.patch<{Body:{ oldPassword: string; newPassword: string }}>(
    '/update-password', 
    { preHandler: [authMiddleware()]},
    async (req: FastifyRequest<{ Body: { oldPassword: string; newPassword: string } }>, res: FastifyReply) => {
      const { oldPassword, newPassword } = req.body;
      const user = req!.user;
      const passwordMatch = await bcrypt.compare(oldPassword, user!.password);
      if (!passwordMatch) {
        throw new HttpError(401, 'Incorrect password');
      }
      const hashPassword = bcrypt.hashSync(newPassword, 10);
      await SQL_UPDATE_PASSWORD({ phone_number: user!.phone_number, password: hashPassword }).exec();
      res.send({ message: 'Password updated successfully.' });
    });
};
