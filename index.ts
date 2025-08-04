import { setupInterestJobSystem } from './jobs/bullConfig';
import Config from './config';
import { Application } from './core/app';
import configRouter from './routes/config';
import S3Routes from './routes/generatePresignedUrl';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import donationRoutes from './routes/donations';
import electionsRoutes from './routes/elections';
import expensesRoutes from './routes/expenses';
import groupDebitsRoutes from './routes/groupDebits';
import groupsRoutes from './routes/groups';
import groupWithdrawalsRoutes from './routes/groupWithdrawals';
import loanRoutes from './routes/loans';
import nextOfKinRoutes from './routes/nextOfKin';
import pocketsRoutes from './routes/pockets';
import securityQuestionsRoutes from './routes/securityQuestions';
import statisticsRoutes from './routes/stats';
import transactionsRoutes from './routes/transactions';
import usersRoutes from './routes/users';


const app = new Application({
  swagger: {
    title: 'Save-up API',
    description: 'API documentation for Save-up backend',
    path: '/saveup/docs',
    password: Config.SWAGGER_PASSWORD
  },
  allowedOrigins: [
    'http://localhost:5173',
    'https://save-up-seven.vercel.app',
    'http://localhost:3003'
  ]
});

app.use(configRouter);
app.use(S3Routes);
app.use(categoryRoutes);
app.use(authRoutes);
app.use(usersRoutes);
app.use(nextOfKinRoutes);
app.use(groupsRoutes);
app.use(expensesRoutes);
app.use(pocketsRoutes);
app.use(donationRoutes);
app.use(electionsRoutes);
app.use(groupDebitsRoutes);
app.use(groupWithdrawalsRoutes);
app.use(loanRoutes);
app.use(securityQuestionsRoutes);
app.use(statisticsRoutes);
app.use(transactionsRoutes);

app.listen(Config.PORT, () => {
  console.log(`Server is running on http://localhost:${Config.PORT}`);
});

 