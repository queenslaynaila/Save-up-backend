import 'express-async-errors';
import { setupInterestJobSystem } from './jobs/bullConfig';
import Config from './config';
import configRouter from './routes/config/index';
import generatePresignedUrlRouter from './routes/generatePresignedUrl';
import securityQuestionsRouter from './routes/securityQuestions/index';
import categoriesRouter from './routes/categories/index';
import authRouter from './routes/auth/index';
import usersRouter from './routes/users/index';
import nextOfKinRouter from './routes/nextOfKin/index';
import groupsRouter from './routes/groups/index';
import electionsRouter from './routes/elections/index';
import groupWithdrawalsRouter from './routes/groupWithdrawals/index';
import loansRouter from './routes/loans/index';
import groupDebitsRouter from './routes/groupDebits/index';
import pocketsRouter from './routes/pockets/index';
import statisticsRouter from './routes/stats/index';
import expensesRouter from './routes/expenses/index';
import donationsRouter from './routes/donations/index';
import transactionsRouter from './routes/transactions/index';
import { Application } from './new/app';

setupInterestJobSystem();

const app = new Application({
  swagger: {
    title: 'Save-up API',
    description: 'API documentation for Save-up backend',
    path: '/saveup/docs',
    password: Config.SWAGGER_PASSWORD || 'admin'
  }
});

app.use(configRouter);
app.use(generatePresignedUrlRouter);
app.use(securityQuestionsRouter);
app.use(categoriesRouter);
app.use(authRouter);
app.use(usersRouter);
app.use(nextOfKinRouter);
app.use(groupsRouter);
app.use(electionsRouter);
app.use(groupWithdrawalsRouter);
app.use(loansRouter);
app.use(groupDebitsRouter);
app.use(pocketsRouter);
app.use(statisticsRouter);
app.use(expensesRouter);
app.use(donationsRouter);
app.use(transactionsRouter);

app.listen();