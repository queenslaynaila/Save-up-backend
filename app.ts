
import 'express-async-errors';
import cron from 'node-cron';
import Fastify from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import { sendSecurityReminderSMS } from './cronjob';
import { HttpError } from './middleware/errorMiddleware';
import usersRoutes from './routes/users/index';
import categoriesRoutes from './routes/categories/index';
import savingsRoutes from './routes/savings/index';
import expensesRoutes from './routes/expenses/index';
import contributionsRoutes from './routes/contributions/index';
import AdminRoutes from './routes/admin/index';
import passwordRoutes from './routes/password/index';
import securityQuestionsRoutes from './routes/securityQuestions';
import securityAnswerRoutes from './routes/securityAnswer/index';
import cumulativesRoutes from './routes/cumulatives/index';

cron.schedule('0 3 1 */6 *', sendSecurityReminderSMS);

const app = Fastify({ logger: true});
app.register(fastifyCors, {
  exposedHeaders: ['Authorization', 'X-Auth-Token', 'X-Refresh-Token', 'X-Reset-Token'],
});
app.register(fastifyHelmet, { global: true });
app.register(usersRoutes,{ prefix:'/users' })
app.register(savingsRoutes,{ prefix:'/savings' })
app.register(expensesRoutes,{ prefix:'/expenses' })
app.register(contributionsRoutes,{prefix: '/contributions' })
app.register(passwordRoutes,{ prefix: '/password' })
app.register(categoriesRoutes,{ prefix: '/categories' })
app.register(AdminRoutes,{ prefix: '/admin' })
app.register(securityQuestionsRoutes,{ prefix: '/security-questions' })
app.register(securityAnswerRoutes,{ prefix: '/security-answers' })
app.register(cumulativesRoutes,{ prefix: '/cumulatives' })

app.setNotFoundHandler(() => {
  throw new HttpError(404, 'Route Not found');
});

app.setErrorHandler((error, request, reply) => {
  if (error instanceof HttpError) { 
    return reply.status(error.statusCode).send({ error:error.message});
  }
  return reply.code(500).send({ error:'Internal Server Error' });
});


export default app;